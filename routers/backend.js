const express = require('express');
const backend = express.Router();
const mongo = swiftMod('mongo');
const authentication = swiftMod('authentication');
//unecessary, use fse.remove
const deleter = swiftMod('deleteFolderAndContents');

const jimpImageManipulation = swiftMod('jimpImageManipulation');
const folderContent = swiftMod('syncFolder').getArrayWithAllPathsInDir;
const encryptor = swiftMod('encryption');
const any = swiftMod('any').any;
const fse = require('fs-extra');
const crypto = require('crypto');
const ObjectId = require('mongodb').ObjectID;
const schedule = require('node-schedule');
const querystring = require('querystring');
const clonedeep = require('lodash.clonedeep');
const fileUploads = swiftMod('multerFileUpload');
const niceDates = swiftMod('niceDates');
const sharp = swiftMod('sharpImageManipulation');


backend.use(function (req, res, next) {
  try{
    (async ()=>{
      let ent = await mongo.entityDetails();

      res.locals.entityDetails = ent;
      //res.locals.nonce = uuidv4();
      next();
    })();
  }
  catch(err){
    console.warn(err);
  }
});

backend.use(function (req, res, next) {
  if(req.path !== '/backendlogin'){
    if (req.user) {
      next();
    } else {
      res.render('login.pug');
    }
  }else{
    next();
  }
});

backend.post('/backendlogin', authentication.adminStrategy, function(req, res){
  res.render('backend.pug', {user: req.user});
});

backend.post('/logout', function(req, res){
  req.logout();
  res.send('OK');
});

backend.get('/test', (req, res)=>{
  res.send('You hacker!')
});

backend.get('/', function(req, res){
  res.render('backend.pug', {user: req.user});
});

//const mergeImg = swiftMod('mergeImg');

/*
Service worker and clustering stuff to be done later.
const webPush = require('web-push');
const vapidPublicKey = process.env.vapidPublicKey;
const vapidPrivateKey = process.env.vapidPrivateKey;
const cluster = require('jhcluster');
*/
function deleteIfUnalteredAfterOneHour(newitemref){
  setTimeout(deleteItem, 1000 * 60 * 60);
  function deleteItem(){
    mongo.getItem(newitemref).then((item)=>{
      if(Object.keys(item[0]).length < 3){
        mongo.deleteItem({itemref: newitemref});
      }
    });
  }
}

/**
 * Cleans item from DB produced in test environment.
 * @function cleanDB
 * @description Checks the database if an document has less than 5 fields and
 * deletes it.
 */
function cleanDB(){
  mongo.getStock().then((items) =>{
    items.forEach((item, i) => {

      if(Object.keys(item).length < 6){

        mongo.deleteItem({itemref: item.itemref});
      }
    });
  });
}
cleanDB();

function deleteInvalid(){
  mongo.getStock().then((items)=>{
    items.forEach((item)=>{
      if(Object.keys(item).length < 4){
        mongo.deleteItem({itemref: item.itemref});
      }
    });
  });
}


backend.post('/entity', (req, res, next)=>{
  res.render('entity2.pug', {entity: res.locals.entityDetails});
});

backend.post('/shopchoices', (req, res, next)=>{
  res.render('shopchoices.pug', {entity: res.locals.entityDetails});
});

backend.post('/updateEntity', (req, res, next)=>{
  if(Object.keys(req.body).length > 0 && req.body.constructor === Object){
    req.body.username = (req.body.username) ? encryptor.encrypt(req.body.username) : res.locals.entityDetails.username;
    req.body.password = (req.body.password) ? encryptor.encrypt(req.body.password) : res.locals.entityDetails.password;
    (async ()=>{
      let insert = await mongo.updateEntity(req.body);
      res.send('OK');
    })();
  }
});

backend.post('/docs', (req, res, next)=>{
  res.render('docs.pug');
});

backend.post('/editItem', (req, res, next)=>{
  try{
    (async ()=>{
      let template = await mongo.getItem({itemref: req.body.itemref});
          template[0].posts = await mongo.getPostTitles();
      let itemgroups = await mongo.distinctItemType('item type.item group');
          template[0]['item type']['item group array'] = itemgroups;
          template[0].itemsToEdit = req.body.allItems;
      //could force an order on the display:
      let masterItem = await mongo.getItem({'master item type': true});
      //we create a new array field to display item group options, but not part of the saved object:


      //generate addpost view or similar with data
      //update all old stock
      res.render('editStock.pug', {template: template, master: masterItem[0]});

      /*for (let i = 0; i < req.body.count; i++) {

        newitems.push(cloneItem(template[0]));

        if(i === req.body.count-1){
          Promise.all(newitems).then((processed)=>{

            for (let j = 0; j < processed.length; j++) {
              processed[j].templateItem = false;
              if(j === processed.length -1){
                mongo.createItem(processed);
              }
            }

          }).then((ifOK)=>{
            res.send('OK');
          }).catch((e)=>{
            res.send('BAD');
          });
        }
      }*/
    })();
  }
  catch(error){
    next(error);
  }
  });

backend.post('/indexItem', (req, res, next)=>{
  console.warn('URL canonicalization can be done on indexItem');
    try{
      (async ()=>{
        let indexURL = swiftMod('autoGoogleIndex');
        let item = await mongo.getItem({itemref: req.body.itemref});
        let url = `${process.env.baseURL}shop/themes/${item[0].theme.name}/${item[0].name}`
            url = url.replace(' ', '_');
        let index = await indexURL(url);
        if(index === 'success'){
          let timeNow = new Date().toISOString();
          let updateItem = await mongo.updateItem({updates: {indexedGoogle: timeNow}}).then(
            (cb) => {
              res.send(timeNow);
            });
          }
        })();
    }catch(err){
      res.send('error');
    }

});

backend.post('/cloneItem', (req, res, next)=>{
  try{
    (async ()=>{
      let newitems = [];
      let template = await mongo.getItem({itemref: req.body.itemref});

      for (let i = 0; i < req.body.count; i++) {

        newitems.push(cloneItem(template[0]));

        if(i === req.body.count-1){
          Promise.all(newitems).then((processed)=>{

            for (let j = 0; j < processed.length; j++) {
              processed[j].templateItem = false;
              if(j === processed.length -1){
                mongo.createItem(processed);
              }
            }

          }).then((ifOK)=>{
            res.send('OK');
          }).catch((e)=>{
            res.send('BAD');
          });
        }
      }
    })();
  }
  catch(error){
    next(error);
  }
});

function cloneItem(template){
  let promise = new Promise((resolve, reject)=>{
    try {
      (async ()=>{
        let clone = clonedeep(template);
            clone.itemref = await encryptor.makeitemref();
            clone.created = new Date().getTime();

        if(clone.cart) delete clone.cart;
        if(clone._id) delete clone._id;

        resolve(clone);
      })();
    } catch (e) {

    }
  });
  return promise;
}

backend.post('/deleteItemType', (req, res, next)=>{

  try {
    (async ()=>{
      let result = await mongo.deleteItemType(req.body);

      if(result === 1){
        res.send('OK');
      }
    })();
  } catch (e) {

  }
});

backend.post('/viewstock', (req, res, next)=>{
  try {
    (async ()=>{
      let result = await mongo.getDistinctItems();
      res.render('viewstock.pug', {stock: result})

    })();
  } catch (e) {

  }
  /*finally {

  }*/
});

backend.post('/addstock', (req, res, next)=>{
  try{
    (async ()=>{
      let template = await mongo.getMasterItemType();
      template[0].posts = await mongo.getPostTitles();
      let itemref = await encryptor.makeitemref();
      let created = new Date().getTime();
      let insert = await mongo.createItem({itemref: itemref, created: created});
      let itemgroups = await mongo.distinctItemType('item type.item group');
      //template[0]['item type'][0]['item group'] = itemgroups;
      template[0]['item type']['item group'] = itemgroups;

      deleteIfUnalteredAfterOneHour({itemref: itemref});
      template[0].itemref = itemref;
      //res.send('fuck off')
      res.render('addstock.pug', {template: template, entity: res.locals.entityDetails})
    })();
  }
  catch(error){
    next(error);
  }
});

backend.post('/updateItemField', (req, res, next)=>{
  mongo.updateItemField(req.body)
    .then((cb) => {
      res.send('success');
    })
    .catch((err) => {
      throw err;
      res.send("An error occured saving this change." + err);}
  );
});

backend.post('/saveItemEdit', (req, res, next)=>{
  let items = req.body.itemrefs;
  for (let i = 0; i < items.length; i++) {
    req.body.updates.itemref = items[i].itemref;


    mongo.updateItem(req.body)
    .then((cb) => {
      if(i === items.length-1){
        res.send('success');
      }
    })
    .catch((err) => {
      throw err;
      res.send("An error occured saving this change." + err);}
    );
  }
});

backend.post('/updateItem', (req, res, next)=>{
  req.body.created = new Date().getTime();
  mongo.updateItem(req.body)
    .then((cb) => {
      res.send('success');
    })
    .catch((err) => {
      throw err;
      res.send("An error occured saving this change." + err);}
  );
});

backend.post('/updateArrayItem', (req, res, next)=>{
  mongo.updateArrayItem(req.body)
    .then((cb) => {
      res.send('success');
    })
    .catch((err) => {
      throw err;
      res.send("An error occured saving this change." + err);}
  );
});

backend.post('/updateItemType', (req, res, next)=>{
  mongo.updateItemType(req.body)
    .then((cb) => {
      res.send('success');
    })
    .catch((err) => {
      throw err;
      res.send("An error occured saving this change." + err);}
  );
});

backend.post('/updateTheme', (req, res, next)=>{
  mongo.updateTheme(req.body)
    .then((cb) => {
      res.send('success');
    })
    .catch((err) => {
      throw err;
      res.send("An error occured saving this change." + err);}
  );
});

/*
backend.post('/saveNewItem', (req, res, next)=>{
  mongo.saveNewItem(req.body)
    .then((cb) => {
      res.send('success');
    })
    .catch((err) => {
      throw err;
      res.send("An error occured saving this change." + err);}
  );
});*/

backend.post('/deleteImage', (req, res, next)=>{
  let frontendPathToImage = req.body.link;
  let frontendPathToFolder = querystring.unescape(frontendPathToImage).split('/').reduce((a, c, i, srcAr)=> {
    if(i !== srcAr.length-1){
      return a + '/'+ c
    }else{
      return a;
    }
  });

  let backendPathToImage = './static' + decodeURIComponent(frontendPathToImage);
  let backendPathToFolder = './static' + decodeURIComponent(frontendPathToFolder);

  try{
    (async ()=>{
      let file = await fse.remove(backendPathToImage);
      let newImageLinks = await folderContent(backendPathToFolder);

      //stock items use a different path, and have a delete if not saved function:
      if(req.body.name && req.body.itemtype){
        let db = await mongo.updateItemType(
          {updates: {name: req.body.name, itemtype: req.body.itemtype, 'image links': newImageLinks}}, backendPathToFolder
        );
        res.send('success');

      }else{
        res.send('success');
      }
    })();
  }
  catch(error){
    next(error);
  }
});

backend.post('/deleteVideo', (req, res, next)=>{
  let frontendPathToImage = req.body.link;
  let frontendPathToFolder = querystring.unescape(frontendPathToImage).split('/').reduce((a, c, i, srcAr)=> {
    if(i !== srcAr.length-1){
      return a + '/'+ c
    }else{
      return a;
    }
  });

  let backendPathToImage = './static' + decodeURIComponent(frontendPathToImage);
  let backendPathToFolder = './static' + decodeURIComponent(frontendPathToFolder);

  try{
    (async ()=>{
      let file = await fse.remove(backendPathToImage);
      let newImageLinks = await folderContent(backendPathToFolder);
      let db = await mongo.updateItemType(
        {updates: {name: req.body.name, itemtype: req.body.itemtype, 'image links': newImageLinks}}, backendPathToFolder
      );
      res.send('success');
    })();
  }
  catch(error){
    next(error);
  }
});



backend.post('/updateOrDeleteStockItemImage', (req, res, next)=>{

  let frontendPathToImage, frontendPathToFolder, backendPathToImage, backendPathToFolder;

  frontendPathToImage = req.body.link;
  frontendPathToFolder = querystring.unescape(frontendPathToImage).split('/').reduce((a, c, i, srcAr)=> {
    if(i !== srcAr.length-1){
      return a + '/'+ c
    }else{
      return a;
    }
  });
  backendPathToImage = './static' + decodeURIComponent(frontendPathToImage);
  backendPathToFolder = './static' + decodeURIComponent(frontendPathToFolder);

  try{
    (async ()=>{
      let file = await fse.remove(backendPathToImage);
      let newImageLinks = await folderContent(backendPathToFolder);

      let db = await mongo.bulkUpdateAllOfAnItem(
        {
          filter: {'theme.name': req.body.theme, 'item type.name': req.body.itemtype},
          updates: { 'image links': newImageLinks}
        }
      );
      res.send('success');
    })();
  }
  catch(error){
    next(error);
  }

});

backend.post('/deleteItemImage', (req, res, next)=>{
  let frontendPathToImage = req.body.link;
  let frontendPathToFolder = querystring.unescape(frontendPathToImage).split('/').reduce((a, c, i, srcAr)=> {
    if(i !== srcAr.length-1){
      return a + '/'+ c
    }else{
      return a;
    }
  });

  let backendPathToImage = './static' + decodeURIComponent(frontendPathToImage);
  let backendPathToFolder = './static' + decodeURIComponent(frontendPathToFolder);

  try{
    (async ()=>{
      let file = await fse.remove(backendPathToImage);
      let newImageLinks = await folderContent(backendPathToFolder);
      let db = await mongo.updateItemType(
        {updates: {name: req.body.name, itemtype: req.body.itemtype, 'image links': newImageLinks}}, backendPathToFolder
      );
      res.send('success');
    })();
  }
  catch(error){
    next(error);
  }
});

backend.post('/makeNewItemType', (req, res, next)=>{
  mongo.makeNewItemType(req.body)
    .then((cb) => {
      res.send('success');
    })
    .catch((err) => {
      throw err;
      res.send("An error occured saving this change." + err);}
  );
});

backend.post('/deleteTemplateItem', (req, res, next)=>{
  console.warn('delete template item fn to write');
});

backend.post('/removestock', function(req, res){
  (async ()=>{
    try {

      for (let i = 0; i < req.body.itemrefs.length; i++) {
        let deleteOb = req.body.itemrefs[i];
        if(req.body.templateItem){
          deleteOb.templateItem = true;
        }else{
          deleteOb.templateItem = false;
        }
        let folderpath = './static/images/stock/' +req.body.itemtype + '/' + req.body.itemrefs[i].itemref;
        let deleteFromDB = await mongo.deleteItem(deleteOb);



        let deleteFromFileSystem = await deleter.deleteFolderAndContents(folderpath);


        if(i === req.body.itemrefs.length -1){
          res.send('OK');
        }
      }
    } catch (e) {
      res.send({'error': e});
    }
  })();
});

/**
  * @description saves an item type, theme, producer or other item data.
  */
/*
backend.post('/saveitemimage', fileUploads.storeItemImage.single('image'), function(req, res){
  let path = req.file.destination.split('/').reduce((a, c, i, srcAr)=> {
    if(i !== srcAr.length-1){
      return a + '/'+ c
    }else{
      return a;
    }
  });
  //removes "./static" local path:
  let trimmedPath = path.slice(8);

  (async()=>{
    try {
      let imglinks = await folderContent(path);

      let dbinsert = mongo.updateItemType({updates: {name: req.body.name, itemtype: req.body.itemtype, 'image links': imglinks}}, path);
      res.send({message: 'Image saved', link: trimmedPath});
    } catch (e) {
      if(e) throw e;
      res.send({error: 'An error occured saving the image.'});
    }
  })();

});
*/
backend.post('/saveThemeImage', fileUploads.storeThemeImage.single('image'), function(req, res){
  let path = req.file.destination.split('/').reduce((a, c, i, srcAr)=> {
    if(i !== srcAr.length-1){
      return a + '/'+ c
    }else{
      return a;
    }
  });
  //removes "./static" local path:
  let trimmedPath = path.slice(8);

  (async()=>{
    try {
      path = path.replace('unoptimized', 'optimized');
      let resize = await sharp.makeItemPicture( req.file.destination, req.file.filename),
          imglinks = await getArrayWithAllPathsInDir(path),
          updates = await mongo.updateItemType({updates: {name: req.body.themename, itemtype: 'theme', 'image links': imglinks}}, path);
          fse.remove(path.replace('optimized', 'unoptimized'));
      res.send({message: 'Image saved', link: path.slice(8) + '/' + req.file.filename.split('.')[0] + '.webp'});
    } catch (e) {

    }
  })();

});

/**
  * @description saves an item type, theme, producer or other item data.
  */
backend.post('/saveProducerImage', fileUploads.storeProducerImage.single('image'), function(req, res){
  let path = req.file.destination.split('/').reduce((a, c, i, srcAr)=> {
    if(i !== srcAr.length-1){
      return a + '/'+ c
    }else{
      return a;
    }
  });
  //removes "./static" local path:
  let trimmedPath = path.slice(8);

  try{
    (async ()=>{
      //save with optimized image address
      path = path.replace('unoptimized', 'optimized');
      let name = req.file.filename.split('.')[0],
          dir = req.file.destination,
          resize = await sharp.makeItemPicture( dir, req.file.filename ),
          imglinks = await getArrayWithAllPathsInDir(path),
          updates = await mongo.updateItemType({updates: {name: req.body.name, itemtype: 'producer', 'image links': imglinks}}, path);

      res.send({message: 'Image saved', link: path.slice(6)});
    })();
  }
  catch(error){
    next(error);
  }


});

backend.post('/blog', (req, res)=>{
  //provider : req.user.provider
  (async()=>{
    try {
      let posts = await mongo.getBlogsViaQuery({});
      let blogSeed = await mongo.blogsavenew({});
      deleteBlogIfUnaltered(blogSeed._id);
      res.render('blog/main.pug', {data: posts, blog_id: blogSeed._id});
    } catch (e) {
      res.render('/blog/main', {data: {title: 'Error fetching blogs'}});
    };
  })();
});

function deleteBlogIfUnaltered(newblogpostId){

  setTimeout(checkifUnaltered, 1 * 60 * 1000);
  function checkifUnaltered(){
    mongo.getBlogsViaQuery({blogid: newblogpostId}).then((blog)=>{


      if(blog.length === 0){
        deleteBlog(newblogpostId);
      }
    });
  }
}

function deleteBlog(newblogpostId, res){
  let images = 'static/images/blog/' + newblogpostId;
  let video = 'static/video/blog/' + newblogpostId;
  fse.remove(images)
     .then(fse.remove(video))
     .then(mongo.blogdelete({_id: newblogpostId}))
     .then((result)=>{
       if(res){
         res.send('OK');
       }else{
         console.warn('OK');
       }
     })
     .catch((error)=>{
       if(res){
         res.send({error: error});
       }else{
         console.warn(error);
       }
     });
}

backend.post('/blognew', (req, res)=>{
  try {
    (async ()=>{
      let blogSeed = await mongo.blogsavenew({});
      deleteBlogIfUnaltered(blogSeed._id);
      res.render('blog/posttemplate.pug', {blog_id: blogSeed._id});
    })();
  } catch (e) {
    res.send({error: e});
  } finally {
  }
});

backend.post('/sales', (req, res)=>{
  try {
    (async ()=>{
      let carts = await mongo.getCartsPendingShipping();

      if(carts.length === 0){
        res.render('nosales.pug');
        return;
      }

      function getClientDetails(clientcode){
        let promise = new Promise((resolve, reject)=>{
          for (let i = 0; i < carts.length; i++) {
            let clientDeets = mongo.getClientDetails({clientcode: clientcode});
            resolve(clientDeets);
          }
        });
        return promise;
      }

      function decryptObject(obj){
        let promise = new Promise((resolve, reject)=>{
          if(obj){
            let keys = Object.keys(obj);
            let values = Object.values(obj);
              for (var i = 0; i < keys.length; i++) {

                obj[keys[i]] = encryptor.decrypt(values[i]);

                if(i === keys.length -1){
                  resolve(obj);
                }
              }
          }else{
            resolve('empty field');
          }
        });
        return promise;
      }

      async function assembleOrder(carts){
        let assembled = [];
        for (let i = 0; i < carts.length; i++) {
            let clientDetails = await getClientDetails(carts[i].clientcode);
            let decryptClientDetails = await decryptObject(clientDetails);

            let cartItems = await mongo.returnCartItems({cartcode: carts[i].cartcode});

            carts[i].summary.orderPlaced = niceDates.fromTimeStamp(carts[i].status.checkOut);
            assembled.push({
              cart: carts[i],
              clientDetails: decryptClientDetails,
              cartItems: (cartItems[0]) ? cartItems[0].items : {name: 'Item(s) no longer in DB'},
              entity: res.locals.entityDetails
            });

          if(i === carts.length -1){

            res.render('sales.pug', {sales: assembled});
          }
        }
      }

    assembleOrder(carts);

    })();
  } catch (e) {

 }
});

backend.post('/blogdelete', (req, res)=>{
  deleteBlog(req.body._id, res);
});

backend.post('/blogimagedelete', (req, res)=>{
  let forFse = 'static' + decodeURIComponent(req.body.image);
  let forMongo = decodeURIComponent(req.body.image);

  fse.remove(forFse, err=>{
    if(err) res.send({error: 'Error deleting image'});
    req.body.item = {el: 'img', cont: forMongo};
    mongo.removeContentElement(req).then((result)=>{

      if(result.result.nModified === 1){
        res.send({success: 'Image deleted'});
      }
      //try with the encoded URL
      else if(result.result.nModified === 0){

        req.body.item = {el: 'img', cont: req.body.image}
        mongo.removeContentElement(req).then((result)=>{
          if(result.result.nModified === 1){
            res.send({success: 'Image deleted'});
          }
        });

      }else{
        res.send({failure: 'Image not deleted'});
      }
    }).catch((err)=>{
      res.send({error: 'An error occured'})
    });

  });
});

backend.post('/blogvideodelete', (req, res)=>{
  let forFse = 'static/' + decodeURIComponent(req.body.video);
  let forMongo = decodeURIComponent(req.body.video);
  req.body.item = {el: 'video', cont: forMongo};


  try {
    (async ()=>{
      let deletefile = fse.remove(forFse, err=>{if(err) res.send({error: 'Error deleting video'})});
      let updatePost = mongo.removeContentElement(req);
      if(updatePost.result.nModified === 1){
        res.send({success: 'Video deleted'});
      }
      else if(result.result.nModified === 0){
        //try unencoded
        req.body.item = {el: 'video', cont: req.body.video}
        mongo.removeContentElement(req).then((result)=>{
          if(result.result.nModified === 1){
            res.send({success: 'Video deleted'});
          }
        });
      }
      else{
        res.send({failure: 'Video not deleted'});
      }
    })();
  } catch (e) {
    res.send({error: 'An error occured'});
  }
});


backend.post('/blogjson', (req, res)=>{
  if(req.body._id){
    req.body._id = ObjectId(req.body._id);
  }
  mongo.getBlogsViaQuery(req.body).then((result)=>{
    res.send({data: result});
  }).catch((error)=>{
    res.send({data: {title: 'Error fetching blogs'}});
  });
});

backend.post('/blogsave', (req, res)=>{
  req.query = {title: req.body.title};
  req.body.topics = (req.body.topics) ? req.body.topics.split(', ') : [];
  req.body.url =['blog', req.body.topics[0], req.body.title];
  //check if duplicate title:
  mongo.getBlogsViaQuery({title: req.body.title})
    .then((result)=>{
      let promise = new Promise((resolve, reject)=>{
        if(result.length === 0){
          resolve(req);
        }
        if(req.body._id.toString() === result[0]._id.toString()){
          resolve(req);
        }
        else{
          reject('duplicate item');
        }
      });
      return promise;
  }).then((req) => {
    mongo.blogsave(req);
  }).then((result)=>{
    res.send({response: 'OK'});
  }).catch((error)=>{
    throw error;
    res.send({error: 'Duplicate post name'});
  });
});

backend.post('/blogsavenew', (req, res)=>{

  req.query = {title: req.body.title};
  req.body.provider = req.user.provider;
  req.body.alias = req.user.alias;
  req.body['post date'] = new Date();
  req.body.timestamp = req.body['post date'].getTime();
  req.body.topics = (req.body.topics) ? req.body.topics.split(', ') : [];
  req.body.url =['blog', req.body.topics[0], req.body.title];

  //check if duplicate title:
  mongo.getBlogsViaQuery({title: req.body.title})
    .then((result)=>{
      let promise = new Promise((resolve, reject)=>{
        if(result.length === 0){

          resolve('new post');
        }
        else{

          req.body._id = result[0]._id;
          resolve('update post');
        }
      });
      return promise;
  }).then((exists) =>{
      if(exists === 'update post'){
        mongo.blogsave(req);
      }else{

        mongo.blogsavenew(req.body)
      }
    })
    .then((result) => { res.send({response: 'OK'});
  }).catch((error)=>{
    throw error
    //res.send({error: 'Duplicate post name'});
  });
});

backend.post('/saveblogimage', fileUploads.storeBlogImage.single('image'), function(req, res, next){
  let path = req.file.path;
  let trimmedPath = path.slice(6);


  //req.body.image = trimmedPath;

  mongo.blogsaveimages(req).then((link)=>{
    let promise = new Promise((resolve, reject)=>{
      res.send({link: trimmedPath, message: 'Image saved'});
    });
    return promise;
  }).catch((error)=>{
    throw error;
    res.send({error: 'Duplicate post name'});
  });
});

backend.post('/saveblogvideo', fileUploads.storeVideo.single('video'), function(req, res, next){
  let path = req.file.path;
  let trimmedPath = path.slice(6);
      req.body.image = trimmedPath;

  mongo.blogsaveimages(req).then((link)=>{
    let promise = new Promise((resolve, reject)=>{
      res.send({link: trimmedPath, message: 'video saved'});
    });
    return promise;
  }).catch((error)=>{
    throw error;
    res.send({error: 'Duplicate post name'});
  });
});

backend.post('/saveplaceholder', fileUploads.storePlaceHolderImage.single('image'), function(req, res){
  let path = req.file.destination.split('/').reduce((a, c, i, srcAr)=> {
    if(i !== srcAr.length-1){
      return a + '/'+ c
    }else{
      return a;
    }
  });

  try{
    (async ()=>{
      let name = req.file.filename;
      let dir = req.file.destination;

      let resize = await sharp.makePlaceHolderPicture( dir, name );

      res.send({message: 'Image saved', link: path.slice(6)});
    })();
  }
  catch(error){
    next(error);
  }
});



function getArrayWithAllPathsInDir(path){
  let promise = new Promise((resolve, reject)=>{
    let extPath = path.substr(8, path.length) + '/';
    let fullPaths = [];

    fse.readdir(path, function (err, files) {
      if (err) reject(err);
      if(files.length > 0){
        for (let i = 0; i < files.length; i++) {
          fullPaths.push(extPath.concat(files[i]));
          if(i === files.length -1){
            resolve(fullPaths);
          }
        }
      }else{

        resolve([]);
      }
    });
  });
  return promise;
}

/**
  * @description saves an actual item
  */

  /*backend.post('/saveblogvideo', fileUploads.storeVideo.single('video'), function(req, res, next){
    let path = req.file.path;
    let trimmedPath = path.slice(6);

        req.body.image = trimmedPath;

    mongo.blogsaveimages(req).then((link)=>{
      let promise = new Promise((resolve, reject)=>{
        res.send({link: trimmedPath, message: 'video saved'});
      });
      return promise;
    }).catch((error)=>{
      throw error;
      res.send({error: 'Duplicate post name'});
    });
  });*/

backend.post('/saveitem', fileUploads.storeItemImage.single('image'), function(req, res){
  let path = req.file.destination.split('/').reduce((a, c, i, srcAr)=> {
    if(i !== srcAr.length-1){
      return a + '/'+ c
    }else{
      return a;
    }
  });

  try{
    (async ()=>{
      let name = req.file.filename;
      let dir = req.file.destination;

      let resize = await sharp.makeItemPicture( dir, name );
                fse.remove(path);

      let imglinks = await getArrayWithAllPathsInDir(path.replace('unoptimized', 'optimized'));
      //name and itemtype both relate to the photo and are irrelevant to the entire item:
      let updates = await mongo.updateItem({updates: {itemref: req.body.itemref,
                               /*name: req.body.photoLabel,
                               itemtype: req.body.itemtype,*/
                               'image links': imglinks}});
      res.send({message: 'Image saved', link: path.slice(8)});
    })();
  }
  catch(error){
    next(error);
  }
});

backend.post('/saveitemvideo', fileUploads.storeItemVideo.single('video'), function(req, res, next){
  let path = req.file.destination.split('/').reduce((a, c, i, srcAr)=> {
    if(i !== srcAr.length-1){
      return a + '/'+ c
    }else{
      return a;
    }
  });

  try{
    (async ()=>{
      let name = req.file.filename;
      let dir = req.file.destination;

      //convert all incoming to mp4
      //let convert = await
      //fse.remove(path);

      let videolinks = await getArrayWithAllPathsInDir(path);
        //.replace('unoptimized', 'optimized'));
      let updates = await mongo.updateItem({updates: {itemref: req.body.itemref,
                               'video links': videolinks}});
      res.send({message: 'video saved', link: path.slice(8) + '/' + name});
    })();
  }
  catch(error){
    next(error);
  }
});



module.exports = backend;
