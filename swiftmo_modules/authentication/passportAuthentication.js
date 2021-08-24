/*Copied from swiftMo2020 12-05-2021 (DD-MM-YYYY), since then a package in the
  local Verdaccio repository exists.*/
const cookieParser = require('cookie-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const mongo = swiftMod('mongo');
const encrypt = swiftMod('encryption').encrypt;
const decrypt = swiftMod('encryption').decrypt;

passport.use('admin', new LocalStrategy(
  function(username, password, callback) {
    mongo.adminLogin({}).then((user)=>{
      if(decrypt(user.password) === password && decrypt(user.username) === username){
        return callback(null, user);
      }else{
        return callback(null, false);
      }
    });
  }));

passport.serializeUser(function(user, callback) {
  callback(null, user);
});

passport.deserializeUser(function(result, callback) {
  mongo.adminLogin({}).then((res)=>{
    if(decrypt(result.password) === decrypt(res.password) &&
        decrypt(result.username) === decrypt(res.username)){
      return callback(null, {user: decrypt(result.username), provider: result.provider, signature: result.masterSignature});
    }else{
      return callback(null, false);
    }
  });
});

exports.adminStrategy = passport.authenticate('admin');

exports.ifLoggedIn = function(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.render('login.pug');
  }
};
