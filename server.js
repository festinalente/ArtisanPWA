require('dotenv').config();
const express = require('express');
const http2 = require('spdy');
const pug = require('pug');
const compression = require('compression');
const favicon = require('serve-favicon');
const app = express();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const fs = require('fs');
const session = require('express-session');
const crypto = require('crypto');

global.swiftMod = (swiftmoModuleName)=>{
  const path = require('path');
  let desiredMod = path.resolve(process.env.PWD + '/swiftmo_modules/' + swiftmoModuleName);
  return require(desiredMod);
};

const server_port = process.env.PORT || 8080;
const server_ip_address = '0.0.0.0' || '127.0.0.1';

const mongo = swiftMod('MongoConnect');
const initDb = mongo.initDb;
const getDb = mongo.getDb;


const MongoStore = require('connect-mongo');

  let initMongo = function(){
    let promise = new Promise(function(resolve, reject){
      initDb(function (err) {
        if(!err){
          resolve();
        }
        else{
          reject(err);
        }
      });
    });
    return promise;
  };

  let initMongoSessionControl = function(){
    let promise = new Promise(function(resolve, reject){
      //get connection
      const db = function(){
        let m = mongo.getDb();
        return m;
      };

      let mongoStoreOptions = {
        client: db(),
        ttl: 14 * 24 * 60 * 60 * 1000,
        collection: 'sessions'
      };

      const mongoStoreInit = new MongoStore(mongoStoreOptions);

      let sessionOptions = {
        secret: process.env.sessionSecret,
        saveUninitialized: true, // don't create session until something stored,
        resave: true,
        store: mongoStoreInit,
        cookie: {maxAge: 14 * 24 * 60 * 60 * 1000}
      };

      if (app.get('env') === 'production') {
        app.set('trust proxy', 1); // trust first proxy
        sessionOptions.cookie.secure = true; // serve secure cookies
      }

      app.use(session(sessionOptions));

      resolve();
    });
    return promise;
  };

  let mountOtherMiddleWare = function(){
    let promise = new Promise(function(resolve, reject){

      app.use(compression());
      app.use(favicon('./favicon.ico'));
      app.use(cookieParser());
      app.use(bodyParser.urlencoded({ extended: false }));
      app.use(bodyParser.json());
      app.set('trust proxy', 1);
      app.use(passport.initialize());
      app.use(passport.session());
      //static
      app.use('/tmp', express.static(__dirname + '/tmp'));
      app.use(express.static(__dirname + '/static'));
      app.use('/backendStatic', express.static(__dirname + '/backend'))
      app.use('/frontendStatic', express.static(__dirname + '/frontend'))
      app.use('/documentation',express.static(__dirname + '/out'));

      //routers
      app.use('/backend', require('./routers/backend'));
      app.use('/blog', require('./routers/blog'));
      app.use('/video', require('./routers/video'));
      require('./routers/main')(app);

      //render engine
      app.set('views',[__dirname + '/frontend/views', __dirname + '/backend/views']);
      app.set('view engine', 'pug');
      app.engine('html', require('pug').renderFile);

      //404 redirect
      (()=>{try{
        (async ()=>{
          const mongoDB = swiftMod('mongo');
          let ent = await mongoDB.entityDetails();
          app.use(function (req, res, next) {
            res.locals.entityDetails = ent[0];

            //res.status(404).render('404.pug', {entity: res.locals.entityDetails});
          });
        })();
      }
      catch(err){
        console.warn(err);
      }})();

    });
  };

function startApp(port){
  initMongo()
  .then(initMongoSessionControl)
  .then(mountOtherMiddleWare)
  .then(()=>{
    app.listen(port, server_ip_address, function () {
      console.log( "Listening on " + port + ", server_port " + server_port );
    });
  }).catch(function(err){
    console.log('there was an error' + err.stack);
  });
}

function appOnly(){
  let promise = new Promise((resolve, reject)=>{
    initMongo()
    .then(initMongoSessionControl)
    .then(mountOtherMiddleWare).then((a)=>{
      resolve(a);
    });
  });
  return promise;
}

module.exports = {startApp, appOnly};
