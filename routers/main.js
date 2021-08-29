/*jshint esversion: 6 */
/**
* Express main router, serves all core/global routes.
* @type {object}
* @namespace main
*/

/**
 * Shop folder, organizes frondend viewa
 * @namespace shopFolder
 */

const authentication = swiftMod('authentication');
const helmet = require('helmet');
const multer = require('multer');
const uuidv4 = require('uuid/v4');
const reqVal = swiftMod('reqValidator').reqVal;
const mongo = swiftMod('mongo');
const encryptor = swiftMod('encryption');
const paymentModule = swiftMod('payment');
const makeJSONLD = swiftMod('makeJSONLD');
const niceDates = swiftMod('niceDates');
const formatSentence = swiftMod('formatSentence').format;
const redirectFunctions = swiftMod('redirectFunctions');
const email = swiftMod('email').sendmail;

module.exports = function(app) {
  app.use(function (req, res, next) {
    authentication.adminStrategy;
    next();
  });

  app.use(function (req, res, next) {
    try{
      (async ()=>{
        let ent = await mongo.entityDetails();
        res.locals.entityDetails = ent;
        res.locals.nonce = uuidv4();
        next();
      })();
    }
    catch(err){
      console.warn(err);
    }
  });

	app.use(helmet({
		frameguard: {
			action: 'allow-from',
			domain: 'https://stripe.com',
		},
		contentSecurityPolicy:{
			directives: {
				baseUri: ["'self'"],
				defaultSrc: ["'self'"],
				scriptSrc: [
					"'self'",
          '*.stripe.com',
          '*.mapbox.com',
					function (req, res) {
						return "'nonce-" + res.locals.nonce + "'";
					},
        ],
				connectSrc: ["'self'",  '*.endurance.link', '*.stripe.com', '*.mapbox.com'],
				fontSrc: ["'self'", '*.gstatic.com'],
				imgSrc: [
          "'self'",
					'*.porchespottery.com',
          '*.endurance.link',
          '*.mapbox.com',
				],
				frameSrc: ['*.stripe.com'],
				styleSrc: [
          "'self'",
          '*.stripe.com',
          "'unsafe-inline'",
          function (req, res) {
            return "'nonce-" + res.locals.nonce + "'";
          },
        ],
				formAction: ["'self'"]
			},
			browserSniff: false
		}
	}));

  app.get('/*', function (req, res, next) {
    if (req.url.indexOf("/images/") === 0 || req.url.indexOf("/css/") === 0 || req.url.indexOf("/js/") === 0) {
        res.setHeader("Cache-Control", "public, max-age=2628000");
    }
    next();
  });

  app.get('/app-set-up', (req, res)=>{
    (async ()=>{
      try{
        let exists = await mongo.entityUserExists();
        if(exists){
          res.redirect('/');
        }else{
          mongo.seedDB().then(
            res.render('firstView.pug', {nonce: res.locals.nonce, entity: res.locals.entityDetails})
          );
        }
      }
      catch(e){

      }
    })();
  });

  app.post('/register-seed-user', multer().fields([]), (req, res)=>{
    if(res.locals.entityDetails.username && res.locals.entityDetails.password){
      res.send('A seed user has been registered for this app');
    }
    else{
      let encryptUsername = encryptor.encrypt(req.body.username);
      let encryptPassword = encryptor.encrypt(req.body.password);
      mongo.updateEntity({username: encryptUsername, password: encryptPassword}).then(
        res.send('User registered.')
      );
    }
  });

  app.get('/', (req, res)=>{
    let generateJSONLD = makeJSONLD.entity(res.locals.entityDetails);
    res.render('masterView.pug', {nonce: res.locals.nonce, entity: res.locals.entityDetails, jsonld: generateJSONLD});
  });

  app.get('/sw.js', (req, res)=>{
    res.sendFile('/static/frontendPWA/production/sw.js', { root: '.' });
  });

  app.get('/robots.txt', (req, res)=>{
    res.sendFile('robots.txt', { root: '.' });
  });

  app.get('/pwa.js', (req, res)=>{
    res.sendFile('/static/frontendPWA/pwa.js', { root: '.' });
  });

  app.get('/visit', (req, res)=>{
    res.render('visit.pug', {nonce: res.locals.nonce, entity: res.locals.entityDetails});
  });

  app.get('/about', (req, res)=>{
    try {
      (async ()=>{
        let name = 'About ' + res.locals.entityDetails.name;

        let post = await mongo.getBlogsViaQuery({topics: name});

        res.render('blog/postView.pug', {post: post[0], nonce: res.locals.nonce, entity: res.locals.entityDetails});
      })();
    } catch (e) {
      console.warn(e);
      res.render('404.pug', {entity: res.locals.entityDetails});
    }

  });

  /**
   * Get all themes route
   * @description SImp
   * @param {Object} {theme: 'theme name'}
   * @return {Object[]} Returns an array with the entire stock in a particular pattern.
   */
  app.post('/stockQuery', (req, res)=> {
    fetchByTheme(req.body.theme, res);
  });

  /**
   * Get all special items
   * @description Returns all special stock
   * @return {Object[]} Returns an array with all special stock
   */
  app.post('/stockSpecial', (req, res)=> {
    fetchSpecial(res);
  });

  function fetchSpecial(res){
    try{
      (async ()=>{
        let stock = await mongo.stockQuery('special');
        res.render('mixins/items.pug', {stock: stock, entity: res.locals.entityDetails});
      })();
    }
    catch(err){
      console.warn(err);
    }
  }

  app.get('/shop', (req, res)=>{
    testNewFolder(res, null, null, req.originalUrl);
  });


  app.get('/shop/themes', (req, res)=>{
    testNewFolder(res, 'themes', null, req.originalUrl);
  });

  app.get('/shop/shapes', (req, res)=>{
    testNewFolder(res, 'types', null, req.originalUrl);
  });

  app.get('/shop/special', (req, res)=>{
    testNewFolder(res, 'special', null, req.originalUrl);
  });

  app.get('/shop/shapes/:itemtype', (req, res)=>{
    testNewFolder(res, req.params.itemtype, null, req.originalUrl);
  });

  app.get('/shop/themes/:theme', (req, res)=>{
    testNewFolder(res, req.params.theme, null, req.originalUrl);
  });

  app.get('/shop/shapes/:item/:theme', (req, res)=>{
    testNewFolder(res, req.params.item, req.params.theme, req.originalUrl);
  });

  app.get('/shop/themes/:theme/:item', (req, res)=>{
    testNewFolder(res, req.params.theme, req.params.item, req.originalUrl);
  });


  app.post('/stockByItemGroup', (req, res)=> {
    try{
      (async ()=>{
        let stock = await mongo.stockQuery({'item type.item group': req.body.itemgroup});
        res.render('mixins/itemsByTheme.pug', {stock: stock, entity: res.locals.entityDetails});
      })();
    }
    catch(err){
      console.warn(err);
    }
  });


  /**
   * Get all themes route
   * @description SImp
   * @param {Object} {theme: 'theme name'}
   * @return {Object[]} Returns an array with the entire stock in a particular pattern.
   */
  app.post('/stockByItemType', (req, res)=> {
    try{
      (async ()=>{
        //let stock = await mongo.getThemesForItemType(req.body);

        let stock = await mongo.stockQuery({itemtype: req.body.itemtype});

        res.render('mixins/itemsByTheme.pug', {stock: stock, entity: res.locals.entityDetails});
      })();
    }
    catch(err){
      console.warn(err);
    }
  });

  app.get('/stock', (req, res)=>{
    //mongo.getStock(req.body).
  });

  app.post('/postQuery', (req, res)=>{
    try {
      (async ()=>{
        let post = await mongo.getBlogsViaQuery(req.body);
        res.render('blog/postViewContentOnly.pug', {post: post[0]});

      })();
    } catch (e) {
      console.warn(e);
      res.render('404.pug', {entity: res.locals.entityDetails});
    }
  });

  function Scheduler(){
    let tasks = [];

    this.pushTask = (task)=>{
      pushTask(task);
    }
      //**task = {fn: functionto call, interval: 10000, cartcode: cartcode, update: parameter to pass}
    function pushTask(task){
      let exists = tasks.find( ({ cartcode }) => cartcode === task.cartcode );

      if(exists){
        clearTimeout(exists.timeout);
        exists.timeout = setTimeout(() => {
          task.fn(task.update);
        }, task.interval)
      }else{
        tasks.push({
          timeout: setTimeout(() => {
            task.fn(task.update);
          }, task.interval),
          cartcode: task.cartcode
        });


      }
    }
  };
  //{cart: cartOb, item: custom}
  app.post('/bespokeOrder', (req, res, next)=>{
    try{
      (async ()=>{
        let itemref = await encryptor.makeitemref();
        let template = await mongo.getMasterItemType();

        let created = new Date().getTime();
        req.body.width = parseInt(req.body.width);
        req.body.height = parseInt(req.body.height);
        let tileCount = ((req.body.height * req.body.width) / 225);
        req.body.weight = 220 * tileCount;

        let newItem = {
          itemref: itemref,
          created: created,
          bespoke: true,
          tax: template[0].tax,
          'item type': {
            weight: req.body.weight,
            dimensions: [req.body.height, req.body.width, (tileCount * 0.7)],
            name: 'Bespoke ' +  req.body['tile types'] + ' with ' + req.body.theme
          }
        }


        let final = {...newItem, ...req.body};
        let insert = await mongo.createItem(final);

        final.cart.itemrefs.push(itemref);
        final.cart.sessionID = req.sessionID;

        let update = await updateCart(final.cart, res);
        //res.send({itemref: itemref});
      })();
    }
    catch(error){
      next(error);
    }
  });

  function updateCart(itemsToAdd, res){
    try{
      (async ()=>{
        let cartcode = await (itemsToAdd.cartcode ? itemsToAdd.cartcode :  encryptor.makeitemref()),
            sessionID = itemsToAdd.sessionID,
            cart = {
              sessionID: sessionID,
              cartcode: cartcode,
              itemrefs: itemsToAdd.itemrefs,
              shippingDestination: itemsToAdd.shippingDestination,
              status: {added: new Date().getTime()}
            },

            abandoned = {
              sessionID: sessionID,
              cartcode: cartcode,
              itemrefs: itemsToAdd.itemrefs,
              shippingDestination: itemsToAdd.shippingDestination,
              status: {abandoned: new Date().getTime()}
            };

          let update = await mongo.updateManyItems({itemrefs: itemsToAdd.itemrefs, cart: cart}),
              updateCart = await mongo.updateCart(cart);
              let cartDelete = new Scheduler;
              cartDelete.pushTask({
                fn: mongo.updateCart,
                interval: 24 * 60 * 60 * 1000,
                cartcode: cartcode,
                update: abandoned
              });

              let itemsRemove = new Scheduler;
              itemsRemove.pushTask({
                fn: mongo.updateManyItems,
                interval: 24 * 60 * 60 * 1000,
                cartcode: cartcode,
                update: {cart: {cartcode: cartcode}, itemrefs: []}
              });

              let deleteOldHungCart = new Scheduler;
              deleteOldHungCart.pushTask({
                fn: mongo.deleteOldHungCart,
                cartcode: 'none',
                interval: 24 * 60 * 60 * 1000
              });



              res.send(cart);

      })();
    }
    catch(err){
      console.warn(err);
    }
  }

  //mongo.deleteOldHungCart();
//cartCode({sessionID: req.sessionID, cartcode: req.body.cartcode, status: ['added']});
  function cartCode(req){


    let promise = new Promise((resolve, reject)=>{
      try {
        (async ()=>{
            let fromDB = await mongo.getCartCode(req);

            if(fromDB){
              resolve(fromDB.cartcode);
            }else{

              let cartcode = await encryptor.makeitemref();

              resolve(cartcode);
            }
/*
            if(req.checkOldOrder){
            }
            //if doesn't exit, or is a return customer (within the same browser session):
            //new cart old session (i.e. n+1 visit)
            else if((!fromDB && !req.body.cartcode) || fromDB.status.checkOut){
            let cartcode = await encryptor.makeitemref();

              resolve(cartcode);
            }
            //if there's a valid cartcode in the DB but not in the browser
            //i.e. opening a new window and visiting in the current session
            else if((!req.body.cartcode || req.body.cartcode === '') && !!fromDB.cartcode){
              resolve(fromDB.cartcode);
            }
            //if a buying session is running and both DB and browser are aware:
            //i.e active session
            else if(req.body.cartcode === fromDB.cartcode){
              resolve(fromDB.cartcode);
            }
            else{
              let e = new Error("cart code from browser and db are different");
              throw e;
            }*/
          })();
      } catch (e) {
        reject(e);
      };
    });
    return promise;
  }

  /**
   * Makes a cart if one doesn't exist and fills it with the given items, else
   * adds items to an exiting cart, deletes expired carts
   * @param {Object} If exits. { items: [ 'cbfa4355' ], cartcode: '9f4e2635' } or if a cart doesn't exist: { items: [ 'cbfa4355' ], cartcode: '' }
   * @return {Object} Returns the same cart object.
   */
  app.post('/updateCart', (req, res) =>{

    try{
      (async ()=>{

        let cartcode = await cartCode({sessionID: req.sessionID, cartcode: req.body.cartcode, status: ['added']});


        let cart = {
              sessionID: req.sessionID,
              cartcode: cartcode,
              itemrefs: req.body.itemrefs,
              shippingDestination: req.body.shippingDestination,
              status: {added: new Date().getTime()}
            };

        let abandoned = {
              sessionID: req.sessionID,
              cartcode: cartcode,
              itemrefs: req.body.itemrefs,
              shippingDestination: req.body.shippingDestination,
              status: {abandoned: new Date().getTime()}
            };

        let update = await mongo.updateManyItems({itemrefs: req.body.itemrefs, cart: cart}),
            updateCart = await mongo.updateCart(cart);

        let cartDelete = new Scheduler;
            cartDelete.pushTask({
              fn: mongo.updateCart,
              interval: 24 * 60 * 60 * 1000,
              cartcode: cartcode,
              update: abandoned
            });

        let itemsRemove = new Scheduler;
            itemsRemove.pushTask({
              fn: mongo.updateManyItems,
              interval: 24 * 60 * 60 * 1000,
              cartcode: cartcode,
              update: {cart: {cartcode: cartcode}, itemrefs: []}
            });

        res.send(cart);

      })();
    }
    catch(err){
      console.warn(err);
    }
  });

  function renderCart(cart, res){
    try{
      (async ()=>{
        if(!cart || cart.length === 0){
          res.render('shoppingCart/mixins/cartEmpty');
        }
        else{
          if(cart[0].cart.shippingDestination){
            let weight = await totals(cart);
            let shippingPrice = await mongo.getShippingCost({country: cart[0].cart.shippingDestination, weight: weight.weight});
            res.render('shoppingCart/mixins/cartItems', {stock: cart, shipping: shippingPrice});
          }else{
            res.render('shoppingCart/mixins/cartItems', {stock: cart});
          }
        }
      })();
    }
    catch(err){
      console.warn(err);
    }
  }

  app.post('/fetchCartView', (req, res) =>{
    try{
      (async ()=>{


        let cartcode = await cartCode({sessionID: req.sessionID, cartcode: {$exists: true}, status: ['added']});
        let cart = await mongo.returnCartItems({cartcode: cartcode});

        //let cart = await mongo.returnCartItems({sessionID: req.sessionID});
        renderCart(cart, res);
      })();
    }
    catch(err){
      console.warn(err);
    }
  });

  app.post('/fetchCartData', (req, res) =>{
    try{
      (async ()=>{


        let cartcode = await cartCode({sessionID: req.sessionID, cartcode: {$exists: true}, status: ['added']});
        let cart = await mongo.returnCartItems({cartcode: cartcode});

        res.send(cart);
      })();
    }
    catch(err){
      console.warn(err);
    }
  });

  app.post('/getCartCode', (req, res) =>{
    try{
      (async ()=>{
        let cart = await cartCode({sessionID: req.sessionID, cartcode: {$exists: true}, status: ['added', 'checkOut', 'abandoned', 'shipped']});
        res.send(cart);
      })();
    }
    catch(err){
      console.warn(err);
    }
  });

  app.get('/checkout', (req, res) => {
    try{
      (async ()=>{
        let cartcode = await cartCode({sessionID: req.sessionID, cartcode: {$exists: true}, status: ['added', 'checkOut']});
        let cart = await mongo.returnCartItems({cartcode: cartcode});

        let total = await totals(cart);
        let shippingPrice = await mongo.getShippingCost({country: cart[0].cart.shippingDestination, weight: total.weight});
        let checkout = [
          {page: 'registration', view: 'registration', data: null, display: 'focus', address: 0},
          {page: 'payment', view: 'payment', data: null, display: 'reduce', address: 1},
          {page: 'confirmation', view: 'confirmation', data: null, display: 'reduce', address: 2},
        ];

        if(cart.length === 0){
          res.render('checkout/checkout.pug', {entity: res.locals.entityDetails});
        }
        else{
          res.render('checkout/checkout.pug', {
            checkout: checkout,
            items: cart,
            price: (total.price + shippingPrice.price),
            entity: res.locals.entityDetails
          });
        }
      })();
    }
    catch(err){
      console.warn(err);
    }
  });

  app.post('/orderValue', (req, res)=>{
      try{
        (async ()=>{
          let cartcode = await cartCode({sessionID: req.sessionID, cartcode: req.body.cartcode, status: ['added']});
          let cart = await mongo.returnCartItems({cartcode: cartcode});
            if(cart.length === 0){
              let cartcode = await cartCode(req);
              let cart = await mongo.returnCartItems({cartcode: cartcode});
              let price = await colate(cart);
              res.send({price: price.finalValue});
            }
            else{
                res.send({error: 'no items in cart'});
            }
        })();
      }
      catch(err){
        console.warn(err);
      }
  });

  app.post('/checkorder', (req, res)=>{
    try {
      (async ()=>{
        let cartcode = await cartCode({sessionID: req.sessionID, cartcode: req.body.cartcode, status: ['checkOut']});
        let cart = await mongo.returnCartItems({cartcode: cartcode});
            //get unique (ie identified by cartcode)
            //
        let cartObject = await await mongo.getCartsPendingShipping({cartcode: cartcode});
            //get unique (ie identified by cartcode)
            cartObject = cartObject[0];

        function getClientDetails(clientcode){
          let promise = new Promise((resolve, reject)=>{
            let clientDeets = mongo.getClientDetails({clientcode: clientcode});
            resolve(clientDeets);
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

        function removeItemsFromQuery(cartcode){
          let promise = new Promise((resolve, reject)=>{
            try {
              (async ()=>{
                let cartItems = await mongo.returnCartItems({cartcode: cartcode});
                let finalItems = [];

                for (let i = 0; i < cartItems.length; i++) {

                  finalItems = finalItems.concat(cartItems[i].items);

                  if(i === cartItems.length-1){
                    resolve(finalItems);
                  }
                }
              })();
            } catch (e) {
              reject(e);
            }
          });
          return promise;
        }

        async function assembleView(cart){

          let assembled = [];
          let clientDetails = await getClientDetails(cart[0].cart.clientcode);
          let decryptClientDetails = await decryptObject(clientDetails);
          let cartItems = await removeItemsFromQuery(cart[0].cart.cartcode);
          cart[0].cart.summary.orderPlaced = niceDates.fromTimeStamp(cart[0].cart.status.checkOut);
          cart[0].cart.summary.status = Object.keys(cart[0].cart.status)[0];
          assembled.push({summary : cart[0].cart.summary, cart: cart, clientDetails: decryptClientDetails, cartItems: cartItems, entity: res.locals.entityDetails});
          res.render('./checkout/orderConfirmation.pug', {sale: assembled});
          email({sale: assembled});
        }

        assembleView(cart);

        })();
      } catch (e) {
       console.warn(e)
     }
  });

  app.post('/globalPayment', multer().fields([]), function(req, res){
  	(async ()=> {
  		try{
        let cartcode = await cartCode({sessionID: req.sessionID, cartcode: {$exists: true}, status: ['added']});
        let cartItems = await mongo.returnCartItems({cartcode: cartcode});
        //let cartObject = await mongo.getCart({cartcode: cartcode});
        let cartObject = await mongo.getCartsByCartCode({cartcode: cartcode});

            //get unique (ie identified by cartcode)
            cartObject = cartObject[0];
        //write new updates:
        let cartUpdate = {
          sessionID: cartObject.sessionID,
          cartcode: cartObject.cartcode,
          itemrefs: cartObject.itemrefs,
          shippingDestination: cartObject.shippingDestination,
          status: {},
          summary: {},
          clientcode: cartObject.clientcode,
        };

        let updateItems = await mongo.updateManyItems({itemrefs: cartObject.itemrefs, cart: cartUpdate});

        let cartSummaryData = await totals(cartItems);

        let shippingPrice = await mongo.getShippingCost({country: cartItems[0].items[0].cart.shippingDestination, weight: cartSummaryData .weight});
        cartSummaryData.price += shippingPrice.price;
        cartUpdate.summary = cartSummaryData;
        console.warn('Charge type test')
  			let testObj = { chargeType: 'test',
  											price: cartSummaryData.price,
  											currency: 'EUR',
  											description: cartSummaryData.description,
  											sessionID: req.sessionID,
  											payment_method_id: req.body.stripeTokenSCA
  										};
        //this might be tidier as a promise:
  			paymentModule.charge(testObj, function(callback){
          (async ()=> {
            try {

              let checkedOut = await (()=>{
                let promise = new Promise((resolve, reject)=>{
                  cartUpdate.status = {checkOut : new Date().getTime()};
                  resolve();
                });
                return promise;
              })();

              let updateItemStatus = await mongo.updateManyItems ({
                itemrefs: cartUpdate.itemrefs,
                cart: cartUpdate
              });

              let updateCart = await mongo.updateCart(cartUpdate);

            } catch (e) {
              console.warn(e);
            } finally {
              res.send(callback);
            }
          })();

        //{itemrefs: [], 'cart status': {'added to cart': new Date().getTime()}}
            /*
  					let date = new Date();
  					let updates = queryvar;
  							updates['order paid at'] = date.getTime();
  							updates.payment = 'paid';


  					(async () =>{
  						try{
  							if(queryvar.cartcode){

  								updates.paymentType = 'cart';
  								await mongo.payCart(updates);
  							}
  							if(queryvar.confcode){
  								updates.paymentType = 'single';
  								await mongo.updateBooking(updates);
  							}
  							res.send(callback.success);
  						}catch(err){
  							res.send({error: 'An error occured saving your booking'})

  						}
  					})();


  				}
  				else if(callback.requires_action === true){
  					res.send({
  						requires_action: callback.requires_action,
  						payment_intent_client_secret: callback.payment_intent_client_secret,
  						confcode: req.body.code
  					})
  				}
  				else{
  					res.send(callback);
  				}*/
  			});

  		}catch(err){
  			console.warn(err.stack);
  		}
  	})();
  });

  //also fetchs client details:
  app.post('/registerClient', multer().fields([]), (req, res) => {

    try{
      (async ()=>{
          //multiple same options in a drop down field return... an array with the same options:
          if(Array.isArray(req.body.country)){
            req.body.country = req.body.country[0];
          }
          let checkExists = await mongo.checkClientcode({clientcode: req.body.clientcode, email: req.body.email});
          let cartcode = await cartCode({sessionID: req.sessionID, cartcode: {$exists: true}, status: ['added']});
          let cart = await mongo.returnCartItems({cartcode: cartcode});
          //let cartObject = await mongo.getCart(req.sessionID);
          let cartObject = await mongo.getCartsByCartCode({cartcode: cartcode});
              cartObject = cartObject[0];


          //write new updates:

          let cartUpdate = {
            sessionID: cartObject.sessionID,
            cartcode: cartObject.cartcode,
            itemrefs: cartObject.itemrefs,
            shippingDestination: cartObject.shippingDestination,
            status: cartObject.status,
            clientcode: ''
          };

        if(checkExists === false){
          let validInput = await validateInput(req.body);
              cartUpdate.clientcode = await encryptor.makeitemref();
            //save cart
          let encryptInput = await encryptStringInput(validInput);
              encryptInput.clientcode = cartUpdate.clientcode;

          let save = await mongo.registerClient(encryptInput),
              //Update Cart:
              updateCart = await mongo.updateCart(cartUpdate),
              //Update Items:
              updateItemStatus = await mongo.updateManyItems ({
                itemrefs: cartUpdate.itemrefs,
                cart: cartUpdate
              });


              res.status(200).send('OK');
        }
        else{
            cartUpdate.clientcode = req.body.clientcode;
                //Update Cart:
            let updateCart = await mongo.updateCart(cartUpdate),
                //Update Items:
                updateItemStatus = await mongo.updateManyItems ({
                  itemrefs: cartUpdate.itemrefs,
                  cart: cartUpdate
                });
            let keys = Object.keys(checkExists);
            for (var i = 0; i < keys.length; i++) {
              if(keys[i] !== 'clientcode' && keys[i] !== '_id'){
                checkExists[keys[i]] = encryptor.decrypt(checkExists[keys[i]]);
              }
              if(i === keys.length -1){
                res.status(200).send('OK');
              }
            }
            //res.send({price: colateItemRefs.finalValue});
          }
        })();
      }
      catch(err){
        console.warn(err);
      }
    });
    /*app.post('/checkClientExists', (req, res)=>{
    });*/
//END APP ROUTING
};

function colate(cart){
  let promise = new Promise((resolve, reject)=>{
    let itemrefs = [];
    let price = 0;
    for (var i = 0; i < cart.length; i++) {
      itemrefs.push(cart[i].itemref);
      price += cart[i].price;
      if(i === cart.length-1){
        resolve({itemrefs: itemrefs, finalValue: price});
      }
    }
  });
  return promise;
}

function totals(result){

  let totals = {
    price: 0,
    description: '',
    itemrefs: [],
    weight: 0
  };
  let promise = new Promise((resolve, reject)=>{
    for(let i = 0; i < result.length; i++){
      totals.price += result[i].items[0].price * result[i].count;
      totals.itemrefs = totals.itemrefs.concat(result[i].items);
      totals.description += result[i].items + 'x ' + result[i].items[0].theme.name + ' ' + result[i].items[0].name + '.\n';
      totals.weight += result[i].items[0]['item type'].weight * result[i].count;
      if(i === result.length-1){
        resolve(totals);
      }
    }
  });
  return promise;
}

/**
  * Takes an object containing strings and encrypts everything
  */
function encryptStringInput(ob){
  let promise = new Promise((resolve, reject)=>{
    let keys = Object.keys(ob);
    for (var i = 0; i < keys.length; i++) {
      ob[keys[i]] = encryptor.encrypt(ob[keys[i]]);
        if(i === keys.length-1){
          resolve(ob)
        }
      }
  });
  return promise;
}

function validateInput(ob){
  let template = {
    email: '',
    countrycode: '',
    phone: '',
    clientname: '',
    addressline1: '',
    addressline2: '',
    addresscity: '',
    addressprovince: '',
    country: '',
    addresspostcode: '',
    clientinvoicename: '',
    clientvatnumber: '',
    'addressline1-invoice': '',
    'addressline2-invoice': '',
    'addresscity-invoice': '',
    'addressprovince-invoice': '',
    'country-invoice': '',
    'addresspostcode-invoice': '',
    savedetails: ''
  };

  let promise = new Promise((resolve, reject)=>{
    let promises = [];
    let keys = Object.keys(ob);
    for (var i = 0; i < keys.length; i++) {

      template[keys[i]] = reqVal(ob[keys[i]], 'string', 300, true);
      if(i === keys.length-1){
        resolve(template);
      }
    }
  });
  return promise;
}

function fetchByTheme(theme, res){
  let replaceSpaces = theme.replace(/_/gi, ' ');
  try{
    (async ()=>{
      let stock = await mongo.stockQuery({theme: replaceSpaces});
      let generateJSONLD = await makeJSONLD.artesanato(stock);

      res.render('mixins/items.pug', {stock: generateJSONLD, entity: res.locals.entityDetails});
    })();
  }
  catch(err){
    console.warn(err);
  }
}

function renderClientCheckout(res){
  res.render('checkout.pug',  { tabs: [
                                'shop',
                                'Pieces',
                                'Extras',
                                'Shipping'
                              ], entity: res.locals.entityDetails});
}

function compileJSONLD(item){

}

/**
  * @function itemsInGroupPromisesFn
  * @memberof shopFolder
  * @param {object}[] names - An array of string with names of groups
  * @description This function takes an array of groups (e.g. "cars") and
  * sorts these into different queries to the database all of which return
  * a promise, once done it resolves all these promises returning all the
  * items for each group and inserts these into an array of page object
  * representing a shop page.
  * @returns A promise containing all the objects representing pages.
  */
function itemsInGroupPromisesFn(itemgroups){

  let promise = new Promise((resolve, reject)=>{
    let promises = [];
    let shopPages = [];
    let toremove = [];
    let duplicateGroups = [];
    let singleExampleItemForEachGroup = [];

    function remove(indexes, targetArray){

      let promise = new Promise((resolve, reject)=>{
        if(indexes.length === 0){
          resolve(targetArray);
        }
        else{
          for (var i = 0; i < indexes.length; i++) {
            targetArray.splice(indexes[i], 1);
            if(i === indexes.length -1){
              resolve(targetArray);
            }
          }
        }
      }); return promise;
    }


    for (let i = 0; i < itemgroups.length; i++) {

      let correctWhiteSpace = itemgroups[i]['item type']['item group'].match(/([\w\-]+)/g);
      if(correctWhiteSpace){
        if(!duplicateGroups.includes(correctWhiteSpace[0])){
          promises.push(mongo.stockQuery({'item type.item group': correctWhiteSpace[0]}));
          //shopPages.push({page: correctWhiteSpace[0], view: 'specificItemGroup', data: '', display: 'reduce'});
          shopPages.push({page: correctWhiteSpace[0], view: null, data: null, display: 'reduce'});
          duplicateGroups.push(correctWhiteSpace[0]);
        }
      }

      if(i === itemgroups.length -1){
        Promise.all(promises).then((items)=>{

          for (let i = 0; i < items.length; i++) {
            if(items[i].length > 0){
              shopPages[i].data = items[i];
              singleExampleItemForEachGroup.push(items[i][0]);
            }
            else{
              toremove.push(i);
            }
            if(i === items.length -1){

              remove(toremove, shopPages).then((e)=>{

                resolve({pages: shopPages, frontPageItems: singleExampleItemForEachGroup});
              });
            }
          }
        });
      }
    }
  });
  return promise;
}

function createItemTypePages(itemtypes){
  let finishedPages = [];
  let promise = new Promise((resolve, reject)=>{
    for(let i = 0; i < itemtypes.length; i++){
      finishedPages.push({page: itemtypes[i]['item type'].name, view: null, data: null, display: 'reduce'});
      if(i === itemtypes.length-1){
        resolve(finishedPages);
      }
    }
  });
  return promise;
}

function makePlaceHolderPageOnly(pages, view, data){
  let promise = new Promise((resolve, reject)=>{
    let shopPages = [];
    for (var i = 0; i < pages.length; i++) {
      //distinguish if group list or item list:
      let page = (pages[i].page) ? pages[i].page : pages[i];
      shopPages.push(
        { page: page,
          view: (view) ? view : null,
          data: (data) ? data : null,
          display: 'reduce'}
      );
      if(i === pages.length -1){
        resolve(shopPages);
      }
    }
  });
  return promise;
}

function testNewFolder(res, focusPageAddress, item, path){

  let frontPage = [
    {id: 'browseByTheme', text: "themes", imgdivClass: 'placeHolderTheme', linkto:'themes'},
    {id: 'browseByItemType', text: "shapes", imgdivClass: 'placeHolderItemType', linkto:'types'},
    {id: 'browseByGroup', text: "types", imgdivClass: 'placeHolderTypes', linkto:'itemgroups'},
    {id: 'browseSpecial', text: "special", imgdivClass: 'placeHolderSpecial', linkto:'special'},
    {id: 'browseBespoke', text: "bespoke", imgdivClass: 'placeHolderBespoke', linkto:'bespoke'},
  ];

  try{
    (async ()=>{
      let themes = await mongo.getAllThemesV2();

      //shapes
      let itemtypes = await mongo.getFullDocumentByDistinctValue('item type.name');
      let itemtypepages = await createItemTypePages(itemtypes);
      let itemgroups = await mongo.getFullDocumentByDistinctValue('item type.item group');
      let itemsingroup = await itemsInGroupPromisesFn(itemgroups);
      let special = await mongo.stockQuery('special');
      let bespokePost = await mongo.getBlogs('Order a bespoke piece');

      let shop = [
        {page: 'start', view: 'shopbase', data: frontPage, display: 'focus'},
          [
            {page: 'themes', view: 'themes', data: themes[0].theme, display: 'reduce'},
            [],
          ],
          [
            {page: 'types', view: 'itemtypesfull', data: itemtypes, display: 'reduce'},
            itemtypepages,
          ],
          [
            {page: 'itemgroups', view: 'itemGroup', data: itemsingroup.frontPageItems, display: 'reduce'},
            itemsingroup.pages
          ],
          {page: 'special', view: 'specialCard', data: special, display: 'reduce'},
          {page: 'bespoke', view: 'blog', data: bespokePost, display: 'reduce'}
      ];

      function themesByColours(bespoke){
        let promise = new Promise((resolve, reject)=>{
          let singularTypes = [];
          for (let i = 0; i < bespoke.length; i++) {
            if(singularTypes.findIndex(item => item.name.split(' - ')[0] === bespoke[i].name.split(' - ')[0]) === -1){

              singularTypes.push(bespoke[i]);
            }
            if(i === bespoke.length -1){
              addColours(singularTypes, bespoke);
            }
          }

          function addColours(singularTypes, bespoke){


            for (let i = 0; i < bespoke.length; i++) {
              let t = singularTypes.find(el => el.name.split(' - ')[0] === bespoke[i].name.split(' - ')[0]);

              if(t && t['colour options']){
                t['colour options'].push(bespoke[i].colours);
                t['colour images'].push(bespoke[i]['image links']);
              }else{
                t['colour options'] = [bespoke[i].colours];
                t['colour images'] = [bespoke[i]['image links']];
              }
              if(i === bespoke.length -1){

                resolve(singularTypes);
              }
            }
          }
        });
        return promise;
      }
      function generateBlogAndColourData(theme, a, b){
        //console.warn('Many round trips to the database may make the page slow to load in certain conditions. See line 757');
        let promise = new Promise((resolve, reject)=>{
            (async()=>{
              let post =  await mongo.getBlogs(theme['linked post']);
              //theme.name.split(' - ')[0] to make navigate
              let blogAndColoursBlock = [
                {page: theme.name.split(' - ')[0], view: 'blog', data: post, display: 'reduce', btnText: 'View colour choices'},
                {page: theme.name.split(' - ')[0] + ' colours', view: 'basicCard', data: [], display: 'reduce'}
              ];

              for(let j = 0; j < theme['colour options'].length; j++){
                blogAndColoursBlock[1].data.push({
                  image: (theme['colour images'][j] && theme['colour images'][j][0]) ? theme['colour images'][j][0] : null,
                  name: (theme['colour options'][j]) ? formatSentence(theme['colour options'][j]) : console.warn(theme.name + ' missing colours' ),
                  link: 'tile types'
                });
                if(j === theme['colour options'].length -1){
                  shop[a][b].push(blogAndColoursBlock);
                  resolve();
                }
              }

            })();
        });
        return promise;
      }

      let addThemes = (themes, shop, a, b, view, data)=>{

        let promise = new Promise((resolve, reject)=>{
          for (var i = 0; i < themes.length; i++) {

            shop[a][b].push(
              { page: themes[i].name,
                view: (view) ? view : null,
                data: (data) ? data : null,
                display: 'reduce'}
            );
            if(i === themes.length -1){

              resolve(shop);
            }
          }
        });
        return promise;
      }

      let addthemes = await addThemes(themes[0].theme, shop, 1, 1);
      //let addTileThemeBlog = await addTileThemes(tileThemes, shop, 4, 2);
      let processedShop =  await processPages(addthemes, focusPageAddress);

      res.render('newTestShop.pug', {
        shop: processedShop,
        itemModalToggle: item,
        nonce: res.locals.nonce,
        title: res.locals.entityDetails['shop title tag'],
        entity: res.locals.entityDetails,
        description: res.locals.entityDetails['shop description tag'],
        keywords: res.locals.entityDetails['shop keywords'],
        path: path
      });
    })();
  }
  catch(err){
    console.warn(err);
  }
}

function processPages(shop, focusPageAddress){

  let promise = new Promise((resolve, reject)=>{
    let address = '',
        arraycount = '',
        depth = 0,
        nextarraycount = '',
        loopsUnderway = [],
        previous = [];

      loop(shop);

      function loop(shopObInt){
        loopsUnderway.push(true);
        previous.push(shopObInt);
        let indexOfCurrent = loopsUnderway.length - 1;

        for (var i = 0; i < shopObInt.length; i++) {

          if(Array.isArray(shopObInt[i])){
            depth += 1;
            arraycount += i + '|';
            loop(shopObInt[i]);
          }

          address += i;
          shopObInt[i].depth = depth;
          shopObInt[i].address = arraycount.slice(arraycount.length - (depth *2), arraycount.length) + address;

          if(focusPageAddress){
            focusPageAddress = focusPageAddress.replace(/_/g, ' ');
            if(shopObInt[i].address === focusPageAddress || shopObInt[i].page === focusPageAddress){
              shopObInt[i].display = 'focus';
            }else{
              shopObInt[i].display = 'reduce';
            }
          }

          address = '';
          //allow it to climb back out of nested array:
          if(Array.isArray(shopObInt[i])){
            arraycount = arraycount.slice(0, arraycount.length -2);
          }
          //In the top level of the object, at the last item:
          if(i === shopObInt.length - 1){
            depth -= 1;
            //arraycount = arraycount.slice(0,  -2);
            loopsUnderway[indexOfCurrent] = false;
            if(!loopsUnderway.includes(true)){
              resolve(shopObInt);
            }
          }
        }
      }

  });
  return promise;
}




/*
function processPages(shopObject){
  let promise = new Promise((resolve, reject)=>{
    let address = '',
        arraycount = '',
        nextarraycount = '',

        loopsUnderway = [];


    loop(shopObject);

    function loop(shopObInt){
      loopsUnderway.push(true);
      let indexOfCurrent = loopsUnderway.length - 1;
      for (var i = 0; i < shopObInt.length; i++) {
        if(Array.isArray(shopObInt[i])){
          arraycount += i + '|';
          loop(shopObInt[i]);
        }
        else{
          if(Array.isArray(shopObInt[i-1])){
            arraycount = arraycount.substring(0, arraycount.length - 2);
          }
          address += i;
          shopObInt[i].address = arraycount + address;

          address = '';
        }
        //in the top level of the object, at the last item:
        if(i === shopObInt.length - 1){
          loopsUnderway[indexOfCurrent] = false;
          if(!loopsUnderway.includes(true)){

           resolve(shopObInt);
          }
        }
      }
    }
  });
  return promise;
}
*/

function renderFullShop(design, res, itemTypeOrTheme, displayPage, item){

  try{
    (async ()=>{
      let themes = await mongo.getAllThemes();
      let itemtypes = await mongo.distinctItemType();
      let stock = (design) ? await design() : null;

      res.render('shop.pug',  {
              suppliers: ['',''],
              language: [
                    "...I want to browse by?",
                    "themes",
                    "shapes",
                    "special",
                    "tiles"
                  ],
              themes: themes[0].theme,
              itemtypes: itemtypes,
              stock : stock,
              itemTypeOrTheme: itemTypeOrTheme,
              displayPage: displayPage,
              itemtype: item,
              entity: res.locals.entityDetails
      });
    })();
  }
  catch(err){
    console.warn(err);
  }
}
