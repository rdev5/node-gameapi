var db = require('./../database').mainBucket;

function StateModel() {

}

StateModel.save = function(uid, name, last_ver, data, callback) {
   var stateDocName = 'state-' + uid;
   db.get(stateDocName, function(err, result) {
      if (err) {
         // Allow lazy loading (stateDoc will be created on-the-fly)
         if (err.code !== couchbase.errors.keyNotFound) {
            return callback(err);
         }

         // stateDoc for uid
         var stateDoc = {
            type: 'state',
            uid: uid,
            states: {}
         };
         if (result.value) {
            stateDoc = result.value;
         }

         // stateBlock of uid for name (state requested)
         var stateBlock = {
            version: 0,
            data: null
         };
         if(stateDoc.states[name]) {
            stateBlock = stateDoc.states[name];
         } else {
            stateDoc.states[name] = stateBlock;
         }

         // Version management (client must request with the same version stored)
         if (stateBlock.version !== last_ver) {
            return callback('Your data is out of sync');
         } else {
            stateBlock.version++;
            stateBlock.data = data;
         }

         // Implement optimistic locking via CAS to prevent data collision on writes
         var setOptions = {};
         if (result.value) {
            setOptions.cas = result.cas;
         }

         db.set(stateDocName, stateDoc, setOptions, function(err, result) {
            if (err) {
               return callback(err);
            }

            callback(null, stateBlock);
         })
      }
   });
}

module.exports = StateModel;