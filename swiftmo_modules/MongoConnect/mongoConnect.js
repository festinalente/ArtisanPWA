const mongopass = process.env.mongopass;
const dbname = process.env.dbname;
const dbusername = process.env.dbusername;
const url = eval(process.env.mongoDBUrl);
const assert = require('assert');
const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
let _db;

module.exports = {
  getDb,
  initDb
};

function initDb(callback) {
  if (_db) {
    console.warn(`Trying to init DB again!`);
    return callback(null, _db);
  }
  else{
    client.connect(connected);
  }

  function connected(err, db) {
    if (err) {
      console.log(`The following err occured: ${err}`);
      return callback(err);
    }
    console.log(`DB initialized, connected to ${dbname}`);
    _db = db;
    return callback(null, _db);
  }
}

function getDb() {
  assert.ok(_db, `Db has not been initialized. Please call init first.`);
  return _db;
}
