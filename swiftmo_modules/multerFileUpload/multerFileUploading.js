/*jshint esversion: 6 */
/**
 * File uploading module
 * @module multerFileUpload
 * @description Methods for uploading files to file system.
 */

const multer = require('multer');
const fse = require('fs-extra');
const pathmod = require('path');
const mongo = swiftMod('mongo');
const crypto = require('crypto');
/*
const userTestRoute = multer({
  dest: __dirname + '/userFiles/testUser/',
});*/
const Jimp = require('jimp');
const reqVal = swiftMod('reqValidator').reqVal;
const any = swiftMod('any').any;

exports.damageUploads = multer({
  storage: multer.diskStorage({
    limits: {files: 1, parts: 11, fileSize: 5000000},
    destination: function(req, file, callback) {
    getItemRef();

    async function getItemRef(){
      try{
        let itemtype = reqVal(req.body.itemtype, 'string', 200);
        let imgtype = reqVal(req.body.imgtype, 'string', 200);
        let itemref  = await makeitemref(req.body.itemref);
        let validItem = await mongo.ifExists({itemref: req.body.itemref});
        let path = './static/images/stock/'+ itemtype + '/' + itemref + '/' + imgtype + '/';
        let ensureDir = await fse.ensureDir(path);

        if(!validItem){
          throw new Error('Item does not exit');
        }
        callback(null, path);
      }catch(error){
        callback(null, 'An error occured: ' + error);
      }
    }
  },
    filename: function(req, file, callback){
    let imgtype = reqVal(req.body.imgtype, 'string', 35);
    let ext = pathmod.extname(file.originalname);
    if(any(['.JPG', '.jpg', 'JPEG', '.jpeg'], ext)){
      ext = '.jpg';
    }
    else{
      throw new Error('Invalid file type ' + ext);
    }
    callback(null, req.body.itemref + '-' + req.body.timestamp + '-' + req.body.imgtype + ext);
  }
  })
});

exports.storeVideo = multer({
  storage: multer.diskStorage({
    //2.2 GB max 1 h HD content or ~25 min 4k:
    limits: {files: 1, parts: 1, fileSize: 2200000000},
    destination: function(req, file, callback) {
      getItemRef();
      async function getItemRef(){
        try{
          let title = reqVal(req.body.title, 'string', 200);
          let validItem = await mongo.blogPostExists(req.body.title);
          let path = './static/video/blog/' + req.body._id + '-' + title + '/';
          let ensureDir = await fse.ensureDir(path);
          if(!validItem){
            let error = new Error('Item does not exit');
          }
          callback(null, path);

        }catch(error){
          callback(error, false);
        }
      }
    },
    filename: function(req, file, callback){
      let bytes = function createResetToken() {
        return crypto.randomBytes(2).toString("hex");
      },
          title = reqVal(req.body.title, 'string', 200),
          ext = pathmod.extname(file.originalname);
      try{
        callback(null,  req.body._id + '-' + title +  '-' + bytes() + ext);
      }catch(error){
        callback(error, false);
      }
    }
  })
});


exports.storeProducerImage = multer({
  storage: multer.diskStorage({
    limits: {files: 1, parts: 5, fileSize: 15000000},
    destination: function(req, file, callback) {
      (async ()=>{
        try{
          let role = reqVal(req.body.role, 'string', 200),
              path = './static/images/producer/' + req.body.name + '/unoptimized/',
              pathOptimized = './static/images/producer/' + req.body.name + '/optimized/',
              ensureDir = await fse.ensureDir(path),
              ensureDirOpt = await fse.ensureDir(pathOptimized);
          callback(null, path);
        }catch(error){
          callback(null, 'An error occured: ' + error);
        }
      })();
    },
    filename: function(req, file, callback){
      let bytes = ()=>{
        return crypto.randomBytes(2).toString("hex");
      };
      let photoLabel = req.body.photoLabel;
      let ext = pathmod.extname(file.originalname);
      callback(null, photoLabel + '-' + bytes() + ext);
    }
  })
})

exports.storeThemeImage = multer({
  storage: multer.diskStorage({
    limits: {files: 1, parts: 5, fileSize: 15000000},
    destination: function(req, file, callback) {
      (async ()=>{
        try{
          let theme = reqVal(req.body.themename, 'string', 200),
              path = './static/images/theme/' + theme + '/unoptimized/',
              pathOptimized = './static/images/theme/' + theme + '/optimized/',
              ensureDir = await fse.ensureDir(path),
              ensureDirOpt = await fse.ensureDir(pathOptimized);
          callback(null, path);
        }catch(error){
          callback(null, 'An error occured: ' + error);
        }
      })();
    },
    filename: function(req, file, callback){
      let bytes = ()=>{
        return crypto.randomBytes(2).toString("hex");
      };
      let photoLabel = req.body.photoLabel;
      let ext = pathmod.extname(file.originalname);
      callback(null, photoLabel + '-' + bytes() + ext);
    }
  })
})

/**
 * Store item image
 * @method storeItemImage
 * @param {object} Takes a form containing the main image file and relevant
 * metadata in the from:
 * { itemref: 'undefined',
 *   timestamp: '1589547149309',
 *   itemtype: 'theme',
 *   value: 'rambling rose' }
 * If an itemref is provided  the image applies to a specific item.
 * @description Middleware function that handles the uploading of a single image
 * for an item or item type.
 */
exports.storeItemImage = multer({
    storage: multer.diskStorage({
      limits: {files: 1, parts: 5, fileSize: 15000000},
      destination: (req, file, callback)=> {
        (async ()=>{
          try{
            let itemref  = (req.body.itemref === 'undefined') ? await makeitemref(req.body.itemref) : reqVal(req.body.itemref, 'string', 8);
            //let validItem = await mongo.ifExists({itemref: req.body.itemref});
            let theme = (req.body.theme === 'null') ? JSON.parse(req.body.theme) : req.body.theme;
            let itemType = (req.body['item type'] === 'null') ? JSON.parse(req.body['item type']) : req.body['item type'];

            if(theme && itemType){

              let path = './static/images/stock/' + theme + '/' + itemType + '/unoptimized/',
                  pathOptimized = './static/images/stock/' + theme + '/' + itemType + '/optimized/',
                  ensureDir = await fse.ensureDir(path),
                  ensureDirOpt = await fse.ensureDir(pathOptimized);

                  callback(null, path);
            }else{

              let path = './static/images/temp/' + itemref + '/unoptimized/',
                  pathOptimized = './static/images/temp/' + itemref + '/optimized/',
                  ensureDir = await fse.ensureDir(path),
                  ensureDirOpt = await fse.ensureDir(pathOptimized);

                  setTimeout(()=>{fse.remove(pathOptimized)}, 1000 * 60 * 60);
                  callback(null, path);
            }

          }catch(error){
            callback(error, false);
          }
        })();
    },
      filename: (req, file, callback)=>{
        try{
          let bytes = function createResetToken() {
            return crypto.randomBytes(2).toString("hex");
          };

          let itemref  = (req.body.itemref.length === 8) ? req.body.itemref : '';
          let ext = pathmod.extname(file.originalname);
          let filename = itemref + '-' + req.body.photoLabel + '-' + bytes() +  ext;
          callback(null, filename);

        }catch(error){
          callback(error, false);
        }
      }
  })
});

exports.storeItemVideo = multer({
    storage: multer.diskStorage({
      limits: {files: 1, parts: 5, fileSize: 2200000000},
      destination: (req, file, callback)=> {
        (async ()=>{
          try{
            let itemref  = (req.body.itemref === 'undefined') ? await makeitemref(req.body.itemref) : reqVal(req.body.itemref, 'string', 8);
            //let validItem = await mongo.ifExists({itemref: req.body.itemref});
            let theme = (req.body.theme === 'null') ? JSON.parse(req.body.theme) : req.body.theme;
            let itemType = (req.body['item type'] === 'null') ? JSON.parse(req.body['item type']) : req.body['item type'];

            if(theme && itemType){

              let path = './static/video/stock/' + theme + '/' + itemType + '/unoptimized/',
                  pathOptimized = './static/video/stock/' + theme + '/' + itemType + '/optimized/',
                  ensureDir = await fse.ensureDir(path),
                  ensureDirOpt = await fse.ensureDir(pathOptimized);

                  callback(null, path);
            }else{

              let path = './static/video/temp/' + itemref + '/unoptimized/',
                  pathOptimized = './static/video/temp/' + itemref + '/optimized/',
                  ensureDir = await fse.ensureDir(path),
                  ensureDirOpt = await fse.ensureDir(pathOptimized);

                  setTimeout(()=>{fse.remove(pathOptimized)}, 1000 * 60 * 60);
                  callback(null, path);
            }

          }catch(error){
            callback(error, false);
          }
        })();
    },
      filename: (req, file, callback)=>{
        try{
          let bytes = function createResetToken() {
            return crypto.randomBytes(2).toString("hex");
          };

          let itemref  = (req.body.itemref.length === 8) ? req.body.itemref : '';
          let ext = pathmod.extname(file.originalname);
          let filename = itemref + '-' + req.body.label + '-' + bytes() +  ext;
          callback(null, filename);

        }catch(error){
          callback(error, false);
        }
      }
  })
});

exports.storePlaceHolderImage = multer({
    storage: multer.diskStorage({
      limits: {files: 1, parts: 5, fileSize: 15000000},
      destination: function(req, file, callback) {
        (async ()=>{
          try{
            let path = './static/images/entity/';
            let ensureDir = await fse.ensureDir(path);
            callback(null, path);
          }catch(error){
            callback(error, false);
          }
        })();
      },
      filename: function(req, file, callback){
        let title = reqVal(req.body.photoLabel, 'string', 200);
        let ext = pathmod.extname(file.originalname);
        try{
          callback(null, title + ext);
        }catch(error){

          callback(error, false);
        }
      }
  })
});


exports.storeBlogImage = multer({
    storage: multer.diskStorage({
      limits: {files: 1, parts: 5, fileSize: 15000000},
      destination: function(req, file, callback) {
        getItemRef();
        async function getItemRef(){
          try{
            let title = reqVal(req.body.title, 'string', 200);
            let validItem = await mongo.blogPostExists(req.body.title);
            let path = './static/images/blog/' + req.body._id + '-' + title +'/';
            let ensureDir = await fse.ensureDir(path);
            if(!validItem){
              let error = new Error('Item does not exit');
            }
            callback(null, path);

          }catch(error){
            callback(error, false);
          }
        }
      },
      filename: function(req, file, callback){
        let bytes = function createResetToken() {
          return crypto.randomBytes(2).toString("hex");
        };

        let title = reqVal(req.body.title, 'string', 200);
        let ext = pathmod.extname(file.originalname);
        try{
          //, '.png', '.PNG'
          if(any(['.JPG', '.jpg', 'JPEG', '.jpeg'], ext)){
            ext = '.jpg';
            callback(null, req.body._id + '-' + title + bytes() + ext);
          }
          else{
            let error = new Error('Invalid file type, ' + ext + ', try .JPG, .jpg, .JPEG, .jpeg or .png');
            throw error;
          }
        }catch(error){

          callback(error, false);
        }
      }
  })
});


/**not really used for it's original purpose, just for reqval**/
function  makeitemref(itemref) {
  let promise = new Promise(function (resolve, reject){
  if(itemref){
    reqVal(itemref, 'string', 20);
    resolve(itemref);
  }else{
    let crypto = require('crypto');
    crypto.randomBytes(8, function(err, buf) {
      if (err) reject(err);
      itemref = buf.toString('hex');
      resolve(itemref);
    });
  }
});
  return promise;
}

exports.simple = multer({ dest: './static/images/' });
