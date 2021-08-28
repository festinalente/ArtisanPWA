/*jshint esversion: 6 */
/**
 * Mongo interface
 * @module Database interaction
 * @description Methods for database interaction
 */

/**
 * Stock
 * @namespace stockAPI
 * @description Stock consultation functions.
 */

 /**
  * Cart
  * @namespace shoppingCart
  * @description Functions relating to the shopping cart
  */

  /**
   * Clients
   * @namespace clients
   * @description Functions relating to clients
   */


  const db = function(){
    return swiftMod('MongoConnect').getDb();
  };
  const fs = require('fs');
  const ObjectId = require('mongodb').ObjectID;
  const any = swiftMod('any').any;
  const folderContent = swiftMod('syncFolder').getArrayWithAllPathsInDir;
  const dbname = process.env.dbname;

  let entity = db().db(dbname).collection('entity');
  let stock = db().db(dbname).collection('stock');
  let blog = db().db(dbname).collection('blog');
  let carts = db().db(dbname).collection('carts');
  let clients = db().db(dbname).collection('clients');
  let shipping = db().db(dbname).collection('shipping');
  const encryptor = swiftMod('encryption');
  //let checkInput = require('./checkUserInput').inputcheck;

function seedUpdate(query, collection, seedObject){
  let targetCollection = db().db(dbname).collection(collection);
  let exists = targetCollection.findOne(query).then(result =>{
    if(!result){
      targetCollection.insertOne(seedObject);

    }else{
      targetCollection.updateOne({}, {$set:  seedObject}, {upsert: false});

    }
  });
}

exports.seedDB = ()=>{
  let collections = ['blog', 'carts', 'clients', 'entity', 'sessions', 'shipping', 'stock'];
  let promise = new Promise((resolve, reject)=>{
    for (let i = 0; i < collections.length; i++) {
      db().db(dbname).createCollection(collections[i], function(err, res) {
        if (err) reject(err);

        if(collections[i] === 'stock'){
          let masterOb = {
            theme: [{
              name: 'sample theme: delete when not needed',
              colours: ['#fff', '#4287f5', '#f5e942'],
              'meta description': '180 char meta description',
              'linked post': '/link-to-a-blog-post-relevant-to-this-theme',
              'for bespoke': false,
              'image links': ['/link-to-theme-image-0.jpg']
            }],
            'item type': [{
              dimensions: [100, 100, 100],
              weight: 100,
              name: 'sample object'
            }],
            producer: [{
              Producer: 'artist',
              '@type': 'person',
              name: 'Jane Doe',
              'quick intro': 'A sample intro',
              type: 'a profession, e.g. jeweller',
              'image links': ['/link-to-producer-image-0.jpg']
            }],
            'master item type': true,
            'linked post': '/linked-post',
            '@type': '',
            '@context': '',
            itemref: '',
            price: 0,
            tax: 23,
            special: false,
            'image links': [],
            'video links': [],
            'description': '',
            'key characteristics': [
              'hand made'
            ],
            cart: {
              sessionId: '',
              cartcode: '',
              status: {},
              itemrefs: [],
              shippingDestination: ''
            }

          }
          seedUpdate({'master item type': true}, 'stock', masterOb);
        }

        if(collections[i] === 'entity'){
          let entityOb = {
                                username : "",
                                password : "",
                                storeCategory: "",
                                priceRange: "",
                                otherUsers: [
                                  {
                                    username : "",
                                    password : "",
                                    name: "",
                                    role: "",
                                    images: [],
                                    'short description': "",
                                    tagline: "",
                                    'linked post': ""
                                  }
                                ],
                                provider : "",
                                mainUser: {
                                  name: "",
                                  role: "",
                                  images: [],
                                  'short description': "",
                                  tagline: "",
                                  'linked post': ""
                                },
                                title : "",
                                location : {
                                  lat : "",
                                  lng : ""
                                },
                                PostalAddress : {
                                  name : "",
                                  streetAddress : "",
                                  addressLocality : "",
                                  postalCode : "",
                                  addressRegion : "",
                                  addressCountry : "",
                                  postOfficeBoxNumber : ""
                                },
                                openingHours : {
                                  Monday : [],
                                  Tuesday : [],
                                  Wednesday : [],
                                  Thursday : [],
                                  Friday : [],
                                  Saturday : [],
                                  Sunday : []
                                },
                                phone : 0,
                                'country code': 0,
                                email : "",
                                name : "",
                                'fiscal number' : 000000000,
                                fullShopOpeningHours: [],
                                currency: "",
                                logo: "",
                                photo: "",
                                otherPointsOfSale: [
                                  {
                                    PostalAddress : {
                                      name : "",
                                      streetAddress : "",
                                      addressLocality : "",
                                      postalCode : "",
                                      addressRegion : "",
                                      addressCountry : "",
                                      postOfficeBoxNumber : ""
                                    },
                                    openingHours : {
                                      Monday : [],
                                      Tuesday : [],
                                      Wednesday : [],
                                      Thursday : [],
                                      Friday : [],
                                      Saturday : [],
                                      Sunday : []
                                    },
                                    email : "",
                                    location : {
                                      lat : "",
                                      lng : ""
                                    },
                                    fullShopOpeningHours: [],
                                    phone : 0,
                                    'country code': 0,
                                  }
                                ],
                              };
          let exists = entity.findOne({}).then(result =>{
            if(!result){
              entity.insertOne(entityOb);
            }else{
              (async ()=>{
                try{
                  let insertNewFields = await entity.updateOne({}, {$set: entityOb}, {upsert: false}).then(
                                              entity.updateOne({}, {$set: result}, {upsert: false}));
                }
                catch(e){
                  console.warn('An error occured updating entity document.');
                }
              });
            }
          });
        }
        if(i === collections.length -1){
          entity.findOne({}).then((ent)=>resolve(ent));
        }
      });
    }
  });
  return promise;
}

  exports.entityUserExists = ()=>{
    let promise = new Promise((resolve, reject)=>{
      entity.findOne({}).then((ent)=>{
        if(ent && ent.username && ent.password) {
          resolve(true);
        }else{
          resolve(false);
        }
      });
    });
    return promise;
  }

/**
 * @typedef Boolean
 * @property {bool} Promise resolving a Boolean value.
 */

/**
 * Check itemref collision.
 * @param {object} itemref - example input: {itemref: '098p0p00'}
 * @description Checks the database if a given itemref exist.
 * @returns {Promise<Boolean>} Resolves a Boolean indicating whether to generate a new
 * itemref or not.
 */
  exports.checkCollision = (itemref)=>{
    let promise = new Promise((resolve, reject)=>{

      stock.findOne(itemref, function(err, results){
        if (err) reject(err);
        if(!results){
          resolve(false)
        }
        else{
          resolve(true);
        }
      });
    });
    return promise;
  }

/**
  * Get all items in stock and condences similar items by pattern and type
  * @summary Call this with no parameters to get all post titles.
  * @description Returns all unsold items in stock.
  * @returns {Promise<Array>} Resolves an array with all all unsold items in stock.
  * @memberof stockAPI
  */
exports.getDistinctItems = ()=>{
  let promise = new Promise((resolve, reject)=>{
    stock.aggregate([
      // group by key, score to get distinct
      //, "item type.name":"$type", "theme.name":"$pattern"
      {"$match" :{"$and": [{"cart.status.checkOut": {$exists: false}}, {"master item type": {$exists: false}}]}},
      {"$group" : {
        _id : {
          "weight":"$item type.weight",
          "type": "$item type.name",
          "pattern": "$theme.name",
          "dimensions": "$item type.dimensions"
        },
          count: { $sum: 1 },
          items: { $push: {itemref: "$itemref"}},
          //image: { $first: '$image links'}

          image: { $push: '$image links'}
        }
      },
      // Clean up the output
      //{"$project" : {_id:0, key:"$_id.key", score:"$_id.score"}}
      ]).toArray(function(err, result){
          if (err) reject(err);

          resolve(result);
        });
  });
  return promise;
}

/**
  * Get post titles
  * @summary Call this with no parameters to get all post titles.
  * @description Returns all the titles of all the blog posts. Posts aren't
  * expelicitly linked, rather they are dynamically linked via their title.
  * @returns {Promise<Array>} Resolves an array with all the blog post titles.
  * @memberof blog
  * @see backendEventDelegation
  */
  exports.getPostTitles = ()=>{
    let promise = new Promise((resolve, reject)=>{
      blog.find({}).project({_id: 0, title: 1}).toArray((err, results)=>{
        if (err) reject(err);
        resolve(results);
      });
    });
    return promise;
  }

  exports.adminLogin = (loginData)=>{
    let promise = new Promise((resolve, reject)=>{
      entity.findOne({}, function(err, results){
        if (err) reject(err);
        resolve(results);
      });
    });
    return promise;
  };

  exports.entityDetails = ()=>{
    let promise = new Promise((resolve, reject)=>{
      let ent = entity.findOne({}, {_id: 0}).then((result)=>{
        if(result){
          resolve(result);
        }else{
          resolve([{username: 'not defined'}])
        }
      });
    });
    return promise;
  };

  /**
   * Update a single document field in enity
   * @param {object} update - {itemref: '098poi0p', [field to update]: 'update value'}
   * @returns {promise} success or failure
   * @summary It searches for any field in entity because there should just be one.
   */
  exports.updateEntity = (update)=>{
    let promise = new Promise(function(resolve, reject){
      entity.updateOne({},{$set: update},{upsert: false}, function(err, result){
        if (err) reject(err);
        resolve(result);
      });
    });
    return promise;
  };

  exports.validateLogin = (loginData, callback)=>{
    let promise = new Promise((resolve, reject)=>{
      let query =  {username: loginData.username, password: loginData.password};
      entity.findOne(query, function(err, results){
        if (err) reject(err);
        resolve(results);
      });
    });
    return promise;
  };

  exports.getStock = ()=>{
    let promise = new Promise(function(resolve, reject){
      stock.find({}).toArray(function(err, results){
        if (err) reject(err);
        resolve(results);
      });
    });
    return promise;
  };

  exports.queryStock = (query)=>{
    let promise = new Promise(function(resolve, reject){
      stock.aggregate([
        {"$match" :{"$and": [{"cart.status.checkOut": {$exists: false}}, {"master item type": {$exists: false}}, query]}},
        {"$group" : {
          _id : {
            "name":"$name",
            "item type":"$item type",
            "theme": "$theme.name"
          },
            count: { $sum: 1 },
            items: { $push: {itemref: "$itemref"}},
            image: { $push: '$image links'}
          }
        },

        ]).toArray(function(err, result){
            if (err) reject(err);

            resolve(result);
          });
    });
    return promise;
  };

  exports.bulkUpdateAllOfAnItem = (req)=>{

     let promise = new Promise((resolve, reject)=>{
       stock.bulkWrite(
         [{
           updateMany: {
             filter: req.filter,
             update: {$set: req.updates},
             upsert: false,
          }
        }],
         //options
         null,
         function(err, result){
           if (err) reject(err);

           if(result.result.ok){
             resolve(result);
           }
         });
     });
     return promise;
  }

  exports.createItem = (req, cb)=>{
    let finalreq = (Array.isArray(req)) ? req : [req];
    let promise = new Promise((resolve, reject)=>{
      try{
        stock.insertMany(finalreq).then((rep)=>{
            resolve('OK');
          }
        );

      }catch(e){
        reject(e);
      }
    });
    return promise;
  }

  exports.getItem = (itemref)=>{
    let promise = new Promise(function(resolve, reject){
      stock.find(itemref).toArray(function(err, results){
        if (err) reject(err);
        resolve(results);
      });
    });
    return promise;
  };

  exports.deleteItem = (itemref)=>{
    let promise = new Promise(function(resolve, reject){
      resolve(stock.deleteOne(itemref));
    });
    return promise;
  };

  exports.deleteOldHungCart = (req, callback) => {
   let promise = new Promise((resolve, reject)=>{
     let timestamp24hAgo = new Date().getTime() -25 * 60 * 60 * 1000;
     stock.bulkWrite(
       [{updateMany: {
           filter: {'cart.status.added' : {$lt: timestamp24hAgo}},
           update: {$set: {cart: {sessionID: '', cartcode:'', status:{}, itemrefs: [], shippingDestination: ''}}},
           upsert: false,
       }}],
       //options
       null,
       function(err, result){
         if (err) reject(err);

         if(result.result.ok){
           resolve(result);
         }
       });
   });
   return promise;
  }


  exports.updateItem  = (req, callback) => {

    let promise = new Promise((resolve, reject)=>{
      (async function saveUpdate(){
        stock.updateOne(
          { itemref: req.updates.itemref},
          {$set: req.updates},
          {upsert: true},
          function(err, result){
            if (err) reject(err);
            resolve(result);
          });
      })();
    });
    return promise;
  }

  /**
   * Takes an object in req containing an array of items to update and updates those specific stock items with a cart status.
   * @param {Object} {itemrefs: [], 'cart status': {'added to cart': new Date().getTime()}}
   * @description
   *
   * This is callable like so:
   *   let update = await mongo.updateManyItems ({
   *     itemrefs: {Object[]},
   *     cart: {
   *     cartcode: cartcode,
   *     'cart status': {'added to cart': new Date().getTime()}
   *    }
   *   });
   *
   */
  exports.updateManyItems  = (updates, callback) => {
    let promise = new Promise((resolve, reject)=>{

      /*if(updates.itemrefs.length === 0){
        let err = new Error('blank object passed ' + JSON.stringify(updates));
        throw err;
      }*/
      (async function saveUpdate(){
        stock.bulkWrite([
          //add item
          {updateMany: {
              filter: {itemref: {$in: updates.itemrefs}},
              update: {$set: {cart: updates.cart}},
              upsert: true,
          }},
          //remove item
          {updateMany: {
              filter: {itemref: {$nin: updates.itemrefs}, 'cart.cartcode' : updates.cart.cartcode},
              update: {$set: {cart: {sessionID: '', cartcode:'', status:{}, itemrefs: [], shippingDestination: ''}}},
              upsert: false,
          }}
        ],
        //options
        null,
        function(err, result){
          if (err) reject(err);

          if(result.result.ok){
            resolve(result);
          }
        }
      );

      })();
    });
    return promise;
  }


  exports.insertCart = (cart, callback) => {
    let promise = new Promise((resolve, reject)=>{
      try{
        carts.insertOne(cart).then((rep)=>{
            resolve();
          }
        );

      }catch(e){
        reject(e);
      }
    });
    return promise;
  }

  /**
    * Update cart in cart collection
    * @summary Updates a clients cart (separate from the embeded carts in stock objects)
    * @param {Object} {clientcode: cart.clientcode, itemrefs: cart.itemrefs, shippingDestination: cart.shippingDestination, 'status.checkOut': new Date().getTime()};
    * @description Updates a cart with any changeable information (i.e. leaves cartcode, _id etc alone)
    * @returns {Promise} Returns an empty promise.
    * @todo Write a check on input values.
    * @memberof shoppingCart
    */
  exports.updateCart = (cart) => {
    //let sessionID = cart.sessionID;
    //delete cart.sessionID;

    let promise = new Promise((resolve, reject)=>{
        carts.updateOne(
          {cartcode: cart.cartcode, "status.checkOut": {$exists: false}},
          //{cartcode: cart.cartcode},
          {$set: cart},
          {upsert: true},
          function(err, result){
            if (err) reject(err);
            resolve();
          });
    });
    return promise;
  }

  /**
    * Get cartcode
    * @summary Gets a valid cart object (one that is pending checkOut for the current session)
    * @param {Object} {sessionID: req.sessionID};
    * @description Gets one valid cart based on the current sessionID.
    * @returns {Promise} Returns a promise containing the cart code;

    * @memberof cart
    */
  exports.getCartCode = (req) => {
    return getCartCode(req);
  }

  function getCartCode(req){

    let query = {sessionID: req.sessionID, cartcode: req.cartcode, $or: [{'status.added': {$exists: true}}, {'status.checkOut': {$exists: true}}]};
    /*
    if(req.cartcode){
      query = {sessionID: req.sessionID, cartcode: req.cartcode, $or: [{'status.added': {$exists: true}}, {'status.checkOut': {$exists: true}}]}
    }else{
      query = {sessionID: req.sessionID, $or: [{'status.added': {$exists: true}}, {'status.checkOut': {$exists: true}}]}
    }
    */
    let or = [];
    for (var i = 0; i < req.status.length; i++) {
      if(req.status.length > 1){
        //computed property name & string interpolation:
        or.push({[`status.${req.status[i]}`] : {$exists: true}});
        if(i === req.status.length-1){
          query = {sessionID: req.sessionID, cartcode: req.cartcode, $or: or};
        }
      }
      else{
        let name = `status.${req.status[i]}`;
        query = {sessionID: req.sessionID, cartcode: req.cartcode, [name]: {$exists: true}};
      }
    }

    let promise = new Promise((resolve, reject)=>{
      carts.find(query)
        .project({_id: 0, cartcode: 1, status: 1})
        .sort( { [`status.${req.status[0]}`] : -1})
        .limit(1)
        .toArray(function(err, results){
          if (err) reject(err);
          /*Last first in the odd case two carts exist in the same browser
          session at checkout (not sure how this works in other cases)*/;

          if(results[0] && results[0].cartcode){
            resolve(results[0]);
          }else{
            resolve(null)
          }
        });
    });
    return promise;
  }

  /**
    * getCart -takes session id
    * @description
      Gets a cart with a particular sessionID
    * @returns {Promise}
    * @memberof shoppingCart
    */
  exports.getCart = (sessionID)=>{
    let promise = new Promise((resolve, reject)=>{
      carts.find({sessionID: sessionID, 'status.added': {$exists: true}})
        .toArray(function(err, result){
          if (err) reject(err);
          resolve(result[0]);
      });
    });
    return promise;
  }

  /**
    * getCartsPendingShipping
    * @description
    * @param req optional carcode to get specific cart
      Gets all purchased carts awaiting shipping
    * @returns {Promise}
      The promise object contains an array with all items to be shipped.
    * @memberof shoppingCart
    * @todo Finish documentation!
    */
  exports.getCartsPendingShipping = (req)=>{
    let query = (req) ? { cartcode : req.cartcode, "status.checkOut": {$exists : true}} : {"status.checkOut": {$exists : true}};

    let promise = new Promise((resolve, reject)=>{
      carts.find(query)
        .toArray(function(err, result){
          if (err) reject(err);
          resolve(result);
      });
    });
    return promise;
  }


  exports.getCartsByCartCode = (req)=>{
    let query =  { cartcode : req.cartcode };
    let promise = new Promise((resolve, reject)=>{
      carts.find(query)
        .toArray(function(err, result){
          if (err) reject(err);
          resolve(result);
      });
    });
    return promise;
  }

  /**
    * getCartsPendingShipping -takes no parametes
    * @description
      This function checks the carts DB and if a cart exists with the corresponding
      sessionID, gets the cart code from based on that session cookie value. With
      this it then queries the stock DB at getAllItemsInCart(cartcode);
    * @calls getCartCode(req);
    * @calls getAllItemsInCart(cartcode);
    * @returns {Promise}
      The promis object contains an array with all items in the cart
    * @memberof shoppingCart
    */
  exports.returnCartItems = (req, callback) => {
    let promise = new Promise((resolve, reject)=>{
      try {
        (async()=>{
          //either uses cartcode or sessionID
          let cartcode = (req.cartcode) ? req.cartcode : await getCartCode(req);

          if(cartcode){
            let cartItems = await getAllItemsInCart({cartcode: cartcode});


            resolve(cartItems);
          }else{
            resolve([]);
          }
        })();
      } catch (e) {
        console.warn(err);
      }
    });
    return promise;

  };

  //takes an object {cartcode: 'poiu0987'};
  function getAllItemsInCart(cartcode){
    let promise = new Promise((resolve, reject)=>{
      let code = (cartcode && cartcode.cartcode) ? cartcode.cartcode : '';


      let query = [
        //{"$match" : {"$and": [{'cart.cartcode': code, "cart.status.checkOut": {$exists: false}}, {"master item type": {$exists: false}}]}},
        {"$match" : {"$and": [{'cart.cartcode': code}, {"master item type": {$exists: false}}]}},
        {"$group" : {
          _id : {
            //"weight":"$item type.weight",
            //"price": "$item type.price",
            "name": "$name",
            "theme": "$theme.name"
          },
            items: { $push: "$$CURRENT" },
            count: { $sum: 1 },
            weight: { $sum: "$item type.weight"},
            itemrefs: { $push: "$itemref"},
            cart: { $first: "$cart"}
          }
        },
      ];



      stock.aggregate(query).toArray(function(err, result){
            if (err) reject(err);

            resolve(result);
          });

    });
    return promise;
  }

  /**
    * getSalesPendingShipping -takes no parametes
    * @description
      Fetches all items from the database that have been purchased by clients and
       need to be shipped.
    * @returns {Promise}
      The promis object contains an array with all items to be shipped.
    * @memberof stockAPI
    * @todo Finish documentation!
    */
  exports.getSalesPendingShipping = ()=>{
    let promise = new Promise((resolve, reject)=>{
      stock.find({"cart.status.checkOut": {$exists: true}, "master item type": {$exists: false}})
        .toArray(function(err, result){
          if (err) reject(err);
          resolve(result);
      });
    });
    return promise;
  }

  /**
   * Update a single document field.
   * @param {object} update - {itemref: '098poi0p', [field to update]: 'update value'}
   * @returns {promise} success or failure
   */
  exports.updateItemField = (update)=>{
    let itemref = update.itemref;
    delete update.itemref;

    let promise = new Promise(function(resolve, reject){
        stock.updateOne({itemref: itemref},{$set: update},{upsert: false}, function(err, result){
          if (err) reject(err);
          resolve(result);
        });
    });
    return promise;
  };

  exports.getMasterItemType = ()=>{
    let promise = new Promise(function(resolve, reject){
      stock.find({'master item type': true}).toArray(function(err, results){
        if (err) reject(err);
        resolve(results);
      });
    });
    return promise;
  };


/**
  * Update array item
  * @description The key of the parent value being updated is the array
  * field to be updated in the array.
  *
  */
  exports.updateArrayItem = function(updates, callback){
    let id = updates._id;
    delete updates._id;

    let promise = new Promise((resolve, reject)=>{
      stock.updateOne(
        { 'master item type': true},
          {$push:
            updates
          },
        {upsert: true}, function(err, result){
        if (err) reject(err);
        resolve(result);
      });
    });
    return promise;
  };


  function exists(field, name){
    let query = { [field]: name};

    let promise = new Promise((resolve, reject)=>{
      stock.findOne(query, function(err, results){
        if (err) reject(err);
        if(!results){
          resolve(false);
        }else{
          resolve(true)
        }
      });
    });
    return promise;
  }

  /**
    * Check duplicate emails
    */
  exports.checkEmail = (req, cb) =>{
    let query = {email: req};
    //let query = {clientcode: req.clientcode};
    let promise = new Promise((resolve, reject)=>{
      clients.findOne(query, function(err, results){
        if (err) reject(err);
        if(!results){
          resolve(false);
        }else{
          resolve(results)
        }
      });
    });
    return promise;
  }

  /**
    * Check duplicate emails
    */
  exports.checkClientcode = (req, cb) =>{
    let query = {clientcode: req.clientcode};
    let promise = new Promise((resolve, reject)=>{
      clients.findOne(query, function(err, results){
        if (err) reject(err);
        if(!results){
          resolve(false);
        }else{
          let storedEmail = encryptor.decrypt(results.email);
          if(storedEmail === req.email){
            resolve(results)
          }
        }
      });
    });
    return promise;
  }

  /**
   * Add new and save OR update
   * @param {object} { dimensions: [ 290, 40, 290 ],weight: 900, name: 'large plate'}
   * @description Checks the database if a given item type exist, if it does
   * it updates it, else it creates a new item
   * @return {object} Mongo result modified true or not
   */
  exports.updateItemType = (req, path, callback) => {


    let promise = new Promise((resolve, reject)=>{
      (async function saveUpdate(){
        let type = req.updates.itemtype;
            delete req.updates.itemtype;
        let name = req.updates.name;

        let query = { 'master item type': true, [type+'.name']: name};

        let getCurrent = await stock.find(query).project({_id: 0, [type]: 1}).toArray();

        let specificTheme = (()=>{
          if(getCurrent && getCurrent[0] && getCurrent[0][type]){
            for (var i = 0; i < getCurrent[0][type].length; i++) {
              if(getCurrent[0][type][i].name === name){
                return getCurrent[0][type][i];
              };
            }
          }
        })();

        if(req.updates['image links']){
          let paths = await folderContent(path);
          req.updates['image links'] = paths;
        }


        if(getCurrent && getCurrent.length > 0){
          let newUpdates = Object.assign(specificTheme, req.updates);
          let updates = {[type+'.$']: newUpdates};

          stock.findOneAndUpdate(query,{$set:updates},{upsert: true}, (err, result)=>{
              if (err) reject(err);
              resolve(result);
            });
        }
        else{
          let query = { 'master item type': true},
              update = { [type]:req.updates };

          stock.updateOne(query,{$push: update},{upsert: true}, (err, result)=>{
              if (err) reject(err);
              resolve(result);
            });
        }

      })();
    });
    return promise;
  }


  exports.makeNewItemType = (req, callback) => {

    let promise = new Promise((resolve, reject)=>{
      stock.updateOne(
        { 'master item type': true},
          {$push:
            { 'item type':
              {name: req.name, dimensions: [0,0,0], weight: 0} }},
              {upsert: true},
        function(err, result){
          if (err) reject(err);
          resolve(result);
        });
    });
    return promise;
  }

  /**
   * Add new and save OR update
   * @param {object} { dimensions: [ 290, 40, 290 ],weight: 900, name: 'large plate'}
   * @description Checks the database if a given item type exist, if it does
   * it updates it, else it creates a new item
   * @return {object} Mongo result modified true or not
   */
  exports.updateTheme = (req, callback) => {

    let promise = new Promise((resolve, reject)=>{
      (async function saveUpdate(){
        let exist = await exists('theme.name', req.theme.value);
        if(!exist){
          stock.updateOne(
            { 'master item type': true},
              {$push:
                { 'theme':
                  {name: req.theme.value, images: req.theme['image links'] || []} }},
                  {upsert: true},
            function(err, result){
              if (err) reject(err);
              resolve(result);
            });
        }
        else{
          stock.updateOne(
            { 'master item type': true,
            'theme':
              //{ $elemMatch:
                { 'theme.name': req.theme.value }
              //}
            },
            {$set:
              {'theme.$' : req.theme}
            },{upsert: true}, function(err, result){
              if (err) reject(err);
              resolve(result);
            });
        }
      })();
    });
    return promise;
  }

  exports.deleteItemType = (req) => {
    let promise = new Promise((resolve, reject)=>{
      let name = (req.name === '') ? '' : req.name;
      let query =   {$pull:{[req.type]: { name: name }}};

      stock.updateOne({ 'master item type': true}, query, (err, result)=>{
        if (err) reject(err);
        resolve(result.result.nModified);
      });
    });
    return promise;
  }

  /**
   * Get all themes
   * @description Gets all themes listed in the master item.
   * @return {Object[]} Returns an array in the form
   * @todo As a route predominantly used on the front end, this might be good to refractor.
   */
  exports.getAllThemes = (req) => {
    let promise = new Promise((resolve, reject)=>{
      stock.find({'master item type': true}).project({_id: 0, theme: 1}).toArray((err, results)=>{
        if (err) reject(err);
        let themes = results[0].theme;
        let filtered = [];
        let bespoke = [];
        for (var i = 0; i < themes.length; i++) {
          if(!themes[i]['for bespoke'] === true){
            filtered.push(themes[i]);
          }else{
            bespoke.push(themes[i]);
          }
          if(i === themes.length-1){
            resolve([{theme: filtered, bespoke: bespoke}]);
          }
        }
      });
    });
    return promise;
  }

  exports.getAllThemesV2 = (req) => {
    let promise = new Promise((resolve, reject)=>{
      let query = [
        {"$match" :
          {"$or":
            [
            {"$and": [
              {"cart.status.checkOut": {$exists: false}},
              {"cart.status.added": {$exists: false}},
              {"templateItem": false},
              {"special":false}
            ]},
            {"master item type": true}
            ]
          }
      },

          {"$group" : {
            _id : {
              "themes": "$theme",
            }
          }
        },

      ];

      stock.aggregate(query).toArray(function(err, result){
        if (err) reject(err);

        //var util = require('util')



        if(result.length > 0){
          let allThemes = [];
          //let massProdThemes = [];
          let massProdName = [];
          let filtered = [];
          let bespoke = [];

          for (let i = 0; i < result.length; i++) {
            if(result[i]._id.themes.length > 1){
              allThemes = result[i]._id.themes;
            }
            else{
              massProdName.push(result[i]._id.themes.name)
              //massProdThemes.push(result[i]._id.themes);
            }
            if(i === result.length-1){
              matchThemes();
            }
          }

          function matchThemes(){
            for (let i = 0; i < allThemes.length; i++) {
              if(allThemes[i]['for bespoke'] === true){
                bespoke.push(allThemes[i]);
              }
              else if(massProdName.includes(allThemes[i].name)){
                filtered.push(allThemes[i]);
              }
              if(i === allThemes.length-1){


                resolve([{theme: filtered, bespoke: bespoke}]);
              }
            }
          }

        }
      });
    });
    return promise;
  }

  /**
   * Get all stock for particular theme DB call
   * @param {Object} theme or shape -An object containing whether to query by theme or by shape.
   * @description Get all available stock with a particular theme or shape
   * @return {Object[]} Returns an array in the form [{item}, {item} ] where each item
   * represents a singular time (i.e. if there are more than one of an item, only one is returned.).
   */
  exports.stockQuery = (req)=>{

    let choice = (req.theme) ?
                  {'theme.name': req.theme} :
                    (req.itemtype) ?
                      {'item type.name': req.itemtype} :
                        (req['item type.item group']) ?
                          {'item type.item group': req['item type.item group']} : {'special': true};


    let promise = new Promise((resolve, reject)=>{
      let query = [
        {"$match" : {"$and": [choice, {"cart.status.checkOut": {$exists: false}}, {"cart.status.added": {$exists: false}}, {"templateItem": false}, {"master item type": {$exists: false}}]}},
        {"$group" : {
          _id : {
            "weight":"$item type.weight",
            "type": "$item type.name",
            "pattern": "$theme.name",
            "dimensions": "$item type.dimensions"
          },
            firstExample: { $first: "$$CURRENT" },
            count: { $sum: 1 },
            //items: { $push: {itemref: "$itemref"}},
            items: { $push: "$itemref"},
            image: { $first: '$image links'}
          }
        },
        //{ $replaceRoot: { newRoot: '$firstExample' } }

      ];
      stock.aggregate(query).toArray(function(err, result){
            if (err) reject(err);
            resolve(result);
          });
    });
    return promise;
  }


  /**
   * Get the full document by distinct value (pass the value to be queried in req)
   * @param {string} field name to be queried e.g. "name" returns a single item for each name.
   * @description Gets a single item for each distinct value for the field queried.
   * @return {Object[]} Returns an array in the form
   */
  exports.getFullDocumentByDistinctValue = (req) => {
    let promise = new Promise((resolve, reject)=>{
      let value = '$' + req
      //stock.aggregate([{$group: {_id: value, doc : {$first: "$$ROOT"}}}]).toArray(function(err, result){
      stock.aggregate([
        //exclude master item type and null fields
        {$match: { 'master item type': { $exists: false }, [req] : {$ne : null}}},
        //group by name and return the first document
        {$group: {_id: value, doc : {$first: "$$ROOT"}}}
      ]).toArray(function(err, result){
          if (err) reject(err);

          let flat = [];
          for (let i = 0; i < result.length; i++) {
            flat.push(result[i].doc);
            if(i === result.length-1){
              resolve(flat);
            }
          }
        });
    });
    return promise;
  }

  /**
   * Get all distinct Item Types.
   * @return {Object[]} Returns an array in the form
   */
  exports.distinctItemType = (req) => {
    let promise = new Promise((resolve, reject)=>{
      stock.distinct(req, {}, (err, results)=>{
        if (err) reject(err);
        resolve(results);
      });
    });
    return promise;
  }

  /**
   * Get all distinct Item Types.
   * @return {Object[]} Returns an array in the form
   */
  exports.distinctBlog = (req) => {
    let promise = new Promise((resolve, reject)=>{
      blog.distinct(req, {}, (err, results)=>{
        if (err) reject(err);
        resolve(results);
      });
    });
    return promise;
  }

  /**
   * Return client details
   * @namespace clients
   */
  exports.getClientDetails = (clientcode) =>{

    let promise = new Promise((resolve, reject)=>{
      clients.find(clientcode).project({_id: 0}).toArray((err, result)=>{
        if (err) reject(err);
        //

        resolve(result[0]);
      });
    });
    return promise;
  }

  /**
   * Register Client
   * @namespace clients
   */
   exports.registerClient = (req) =>{
     let promise = new Promise((resolve, reject)=>{
       clients.insertOne(req, (err, results)=>{
         if (err) reject(err);
         resolve(results);
       });

     });
     return promise;
   }

  /**
   * Get all available themes for a particular item type
   * @description Get all available themes for a particular item type.
   * @param {Object} {'name': 'coaster'}
   * @return {Object[]} Returns an array in the form
   */
  exports.getThemesForItemType = (req) => {
    let promise = new Promise((resolve, reject)=>{
        stock.aggregate([
          //exclude master item type and null fields
          {$match: { 'master item type': { $exists: false }, name: 'Coaster' }},
          //group by name and return the first document
          {$group: {_id: '$theme.name', doc : {$first: "$$ROOT"}}}
        ]).toArray(function(err, result){
            if (err) reject(err);
            let flat = [];

            for (let i = 0; i < result.length; i++) {
              flat.push(result[i].doc);
              if(i === result.length-1){

                resolve(flat);
              }
            }
          });
    });
    return promise;
  }

  /**
   * Get Shipping cost
   * @description Gets shipping cost based on country.
   * @param {Object} {country: country, weight: weight}
   * @return {int} Returns the cost of shipping
   */
   exports.getShippingCost = (req) => {
     let promise = new Promise((resolve, reject)=>{
        shipping.find({}).project({_id: 0}).toArray((err, result)=>{
          if (err) reject(err);
          let priceObject = result[0],
              country = (req.country && req.country.includes('|')) ? req.country.split('|')[1] : req.country;
              weight = req.weight;

          let indexCountry = ()=>{
            for (let i = 0; i < priceObject.countries.length; i++) {
              if(priceObject && priceObject.countries[i] && priceObject.countries[i].includes(country)){
                return i;
              }
              else if(i === priceObject.countries.length-1){
                return i;
              }
              else{
                continue;
              }

            }
          };

          let indexWeight = ()=>{
            return priceObject.weight.indexOf(priceObject.weight.filter(x => x > weight)[0]);
          }

          let price = priceObject.prices[indexCountry()][indexWeight()];

          let weightLeft = priceObject.weight[indexWeight()] - weight;


          let shipping = {country: country, price: price, vat: priceObject.vat, weightLeft: weightLeft, currentWeight : weight};

          resolve(shipping);
        });
     });
     return promise;
   }

 /**
 * accepts a title only, ignores params, and directories.
 */
exports.getBlogs = function(req, res){
  let promise = new Promise((resolve, reject)=>{
    let path = (req && req.slice(0,1) === '/') ? req.replace('/', '') : req;
    if(typeof req === undefined){
      resolve(null);
    }else{
      blog.find({title: path}).toArray((err, result)=>{
        if(err) reject(err);
        resolve(result[0]);
      });
    }

 });
 return promise;
};

exports.getTopics = function(req, res){
 let promise = new Promise((resolve, reject)=>{
   blog.find({}).project({topics : 1, _id: 0}).toArray((err, item)=>{
     if(err) reject(err);
     let uniquesSkinned = (item && item.topics && item.topics[0]) ? [...new Set(result)].map(item => item.topics[0]) :
    'no particular topic declared';
     resolve(uniquesSkinned);
   });
 });
 return promise;
};

exports.getBlogsViaQuery = function(req, res){
 let promise = new Promise((resolve, reject)=>{
   blog.find(req).toArray((err, results)=>{
     if(err) reject(err);
     resolve(results);
   });
 });
 return promise;
};

exports.blogsave = function(req, res){
 let id = req.body._id;
 delete req.body._id;
 //req.body.provider = req.user.provider;
 let promise = new Promise((resolve, reject)=>{
   blog.updateOne({_id: ObjectId(id), provider: req.user.provider},
   {$set: req.body},{upsert: false}, function(err, result){
     if (err) reject(err);
     resolve('OK');
   });
 });
 return promise;
};

exports.blogsaveimages = function(req, res){
 let promise = new Promise((resolve, reject)=>{
   let id = (req.body._id === 'undefined') ? ObjectId() : ObjectId(req.body._id);
   blog.updateOne({_id: id, provider: req.user.provider},
   {$push:{content: {el: 'img', cont: req.body.image}}}, {upsert: false}, function(err, result){
     if (err) reject(err);
     resolve(result);
   });
 });
 return promise;
};

exports.removeContentElement = function(req, res){
  let promise = new Promise((resolve, reject)=>{
    //let id = req.body._id;
    let id = (req.body._id === 'undefined') ? ObjectId() : ObjectId(req.body._id);

    blog.updateOne({_id: id, provider: req.user.provider},
    {$pull:{content: req.body.item}}, {upsert: false}, function(err, result){
      if (err) reject(err);
      resolve(result);
    });
  });
  return promise;
};


exports.blogsavenew = function(req, res){
  let promise = new Promise((resolve, reject)=>{
    blog.insertOne(req, function(err, res) {
      if (err) reject(err);
      resolve('OK')
      //resolve({'_id': res.ops[0]._id});
    });
  });
  return promise;
};

exports.blogPostExists = function(query){
  let promise = new Promise(function(resolve, reject){

    blog.findOne({title: query}, {"_id" : 1}, function(err, results){
      if (err) reject(err);
      if(results && results.title && results.title === query){
        resolve(true);
      }
      else{
        resolve(false);
      }
    });
  });
  return promise;
};


exports.blogdelete = function(req, res){
  let promise = new Promise((resolve, reject)=>{

    if(!req._id){
      blog.find({title: req.title})
        .toArray()
        .then(result)
        .then(blog.deleteOne({_id: result._id}))
        .then(result => console.warn(`Deleted ${result.deletedCount} items.`))
        .catch(err => console.error(`Delete failed with error: ${err}`));
    }
    else{
      blog.deleteOne({_id: ObjectId(req._id)})
        .then(result => console.warn(`Deleted ${result.deletedCount} item.`))
        .catch(err => console.error(`Delete failed with error: ${err}`));
    }
  });
  return promise;
};
