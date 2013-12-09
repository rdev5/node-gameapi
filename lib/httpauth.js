var HttpAuth = function(req, res, next) {
   req.uid = null;
   if (req.headers.authorization) {
      var sid = req.headers.authorization;
      var SessionModel = require('./models/sessionmodel.js');
      SessionModel.get(sid, function(err, uid) {
         if (err) {
            next('Your session id is invalid');
         } else {
            req.uid = uid;
            next();
         }
      });
   }
}

module.exports = HttpAuth;