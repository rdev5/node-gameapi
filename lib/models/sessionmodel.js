var uuid = require('uuid');
var couchbase = require('couchbase');
var db = require('./../database').mainBucket;

function cleanSessionObj(obj) {
   delete obj.type;
   return obj;
}

function SessionModel() {

}

SessionModel.create = function(uid, callback) {
   var sessDoc = {
      type: 'session',
      sid: uuid.v4(),
      uid: uid
   };

   var sessDocName = 'sess-' + sessDoc.sid;

   db.add(sessDocName, sessDoc, { expiry: 3600 }, function(err, result) {
      callback(err, cleanSessionObj(sessDoc), result.cas);
   });
}

SessionModel.get = function(sid, callback) {
   var sessDocName = 'sess-' + sid;

   db.get(sessDocName, function(err, result) {
      if (err) {
         return callback(err);
      }

      callback(null, result.value.uid);
   });
}

SessionModel.touch = function(sid, callback) {
   var sessDocName = 'sess-' + sid;

   db.touch(sessDocName, { expiry: 3600 }, function(err, result) {
      callback(err);
   });
}

module.exports = SessionModel;