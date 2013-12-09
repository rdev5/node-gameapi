var SessionModel = require('./models/sessionmodel.js');

var HttpAuth = function(req, res, next) {
   req.uid = null;
   if (req.headers.authorization) {
      var sid = req.headers.authorization;
      SessionModel.get(sid, function(err, uid) {
         if (err) {
            next('Your session id is invalid');
         } else {
            // Handle session renewal
            SessionModel.touch(sid, function() {
               if (err) {
                  next('Could not initialize your session');
               } else {
                  req.uid = uid;
                  next();
               }
            });
         }
      });
   }
}

module.exports = HttpAuth;