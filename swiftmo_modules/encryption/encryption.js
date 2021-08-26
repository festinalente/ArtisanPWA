/*jshint esversion: 6 */
const crypto = require('crypto');
const ENCRYPTION_KEY = process.env.key; // Must be 256 bytes (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16
const fs = require('fs');
const mongo = swiftMod('mongo');
//**https://gist.github.com/vlucas/2bd40f62d20c1d49237a109d491974eb**/

function encrypt(text) {
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
      encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function encryptPromise(text) {
  let promise = new Promise((resolve, reject)=>{
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
    resolve(iv.toString('hex') + ':' + encrypted.toString('hex'));
  });
  return promise;
}

function decrypt(text) {

  try {
    let textParts;

    if(text){
      textParts = text.split(':');
    }else{
      return undefined;
    }

    if(textParts.length < 2){
      return textParts;
    }
    let iv = Buffer.from(textParts.shift(), 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
  }
  catch(err){
    throw err;
    console.warn('Cypher error pertaining to: ' + text + '. Details: ' +  err);
  }

}

//alternatives
function encrypt_AES_128_ECB(data) {
    let iv = "";
    let clearEncoding = 'utf8';
    let cipherEncoding = 'base64';
    let cipherChunks = [];
    let cipher = crypto.createCipheriv('aes-128-ecb', Buffer.from(ENCRYPTION_KEY), iv);
    cipher.setAutoPadding(true);
    cipherChunks.push(cipher.update(data, clearEncoding, cipherEncoding));
    cipherChunks.push(cipher.final(cipherEncoding));
    return cipherChunks.join('');
}

function decrypt_AES_128_ECB(data) {
    var iv = crypto.randomBytes(IV_LENGTH);
    var clearEncoding = 'utf8';
    var cipherEncoding = 'base64';
    var cipherChunks = [];
    var decipher = crypto.createDecipheriv('aes-128-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    decipher.setAutoPadding(true);
    cipherChunks.push(decipher.update(data, cipherEncoding, clearEncoding));
    cipherChunks.push(decipher.final(clearEncoding));
    return cipherChunks.join('');
}

const password = process.env.password;
function encryptSimple(text) {
  var cipher = crypto.createCipher(algorithm, password);
  var crypted = cipher.update(text, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
}

function decryptSimple(text) {
  var decipher = crypto.createDecipher(algorithm, password);
  try {
    var dec = decipher.update(text,'hex','utf8');
    dec += decipher.final('utf8');
    return dec;
  }
  catch (ex) {
    //if in plain text we march on:
    return text;
  }
}


function  makeitemref() {

  function makeref(){
    let promise = new Promise(function (resolve, reject){
      crypto.randomBytes(4, function(err, buf) {
        if (err) reject(err);
        let itemref = buf.toString('hex');
        resolve(itemref);
      });
    });
    return promise;
  }

  async function checkCollision(){

      try{
         let itemref = await makeref();
         let collision = await mongo.checkCollision({itemref: itemref});

        if(collision === true){

          checkCollision();
        }
        else{
          return itemref;
        }
      }
      catch(err){
        throw err;
      }

  }
  return checkCollision();
}



function signDamages(image){
  let promise = new Promise((resolve, reject)=>{
    fs.readFile(image, (err, data) => {
        if (err) reject(err) ;
        let buf = Buffer.from(data);
        let salt = crypto.randomBytes(16).toString('hex');
        crypto.pbkdf2(buf, salt, 100000, 64, 'sha512', (err, derivedKey) => {
          if (err) reject(err);
          resolve(salt + ':' + derivedKey.toString('hex'));
        });
    });
  });
  return promise;
}

function signObject(stringRep){
  let promise = new Promise((resolve, reject)=>{
    let salt = crypto.randomBytes(16).toString('hex');
      crypto.pbkdf2(stringRep, salt, 100000, 64, 'sha512', (err, derivedKey) => {
        if (err) reject(err);
        resolve(salt + ':' + derivedKey.toString('hex'));
      });
  });
  return promise;
}

function checkSignature(image, hashToTest){
  let promise = new Promise((resolve, reject)=>{
    fs.readFile(image, (err, data) => {
      if (err) reject(err); // Fail if the file can't be read.
      let buf = Buffer.from(data); //signDamages(buf);
      let split = hashToTest.split(':');
      let salt = split[0];
      let hash = split[1];
      crypto.pbkdf2(buf, salt, 100000, 64, 'sha512', (err, derivedKey) => {
        if (err) reject(err);
        if(hash === derivedKey.toString('hex')){
          resolve('Image has not been tampered');
        }else{
          resolve('Image has been tampered');
        }
      });
    });
  });
  return promise;
}

function checkObject(obj){
  let hashToTest = obj.selfSignature;
  delete obj.selfSignature;

  let split = hashToTest.split(':');
  let salt = split[0];
  let hash = split[1];

  let strOb = JSON.stringify(obj);
  crypto.pbkdf2(strOb, salt, 100000, 64, 'sha512', (err, derivedKey) => {
    if (err) reject(err);
    if(hash === derivedKey.toString('hex')){
      resolve('Object has not been tampered');
    }else{
      resolve('Object has been tampered');
    }
  });

}


module.exports = { decrypt, encrypt, encryptPromise, encrypt_AES_128_ECB, decrypt_AES_128_ECB, decryptSimple, encryptSimple, makeitemref, signDamages, signObject, checkSignature, checkObject};
