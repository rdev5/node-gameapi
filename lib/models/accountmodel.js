var uuid = require('uuid');
var couchbase = require('couchbase');
var db = require('./../database').mainBucket;

function cleanUserObj(obj) {
   delete obj.type;
   return obj;
}

function AccountModel() {

}

AccountModel.create = function(user, callback) {
   var userDoc = {
      type: 'user', // map-reduces
      uid: uuid.v4(), // lookup field
      name: user.name, // attribute
      username: user.username, // attribute
      password: require('crypto').createHash('sha1').update(user.password).digest('base64') // attribute
   };

   // Key to access userDoc
   var userDocName = 'user-' + userDoc.uid;

   // Referential document to lookup username and prevent duplicates
   var refDoc = {
      type: 'username',
      uid: userDoc.uid
   };

   var refDocName = 'username-' + userDoc.username;

   // Insert referential document first
   db.add(refDocName, refDoc, function(err) {

      // Catch keyAlreadyExists
      if (err && err.code === couchbase.errors.keyAlreadyExists) {
         return callback('The username specified already exists');
      } else if (err) {
         return callback(err);
      }

      // Insert userDocName:userDoc
      db.add(userDocName, userDoc, function(err, result) {
         if (err) {
            return callback(err);
         }

         callback(null, cleanUserObj(userDoc), result.cas); // Optimistic locking (CAS)
      });
   });
}

AccountModel.get = function(uid, callback) {
   var userDocName = 'user-' + uid;
   db.get(userDocName, function(err, result) {
      if(err) {
         return callback(err);
      }

      callback(null, cleanUserObj(result.value), result.cas); // Optimistic locking
   });
}

AccountModel.getByUsername = function(username, callback) {
   var refDocName = 'username-' + username;
   db.get(refDocName, function(err, result) {
      if(err && err.code === couchbase.errors.keyNotFound) {
         return callback('Username not found');
      } else if (err) {
         return callback(err);
      }
      
      AccountModel.get(result.value.uid, callback);
   });
}

module.exports = AccountModel;