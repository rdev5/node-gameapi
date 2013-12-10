// Core
var express = require('express');
var crypto = require('crypto');
var AccountModel = require('./models/accountmodel.js');
var SessionModel = require('./models/sessionmodel.js');
var StateModel = require('./models/statemodel.js');
var HttpAuth = require('./httpauth');

var port = 3000;

var CORS = function(req, res, next) {
   res.header('Access-Control-Allow-Origin', '*');
   res.header('Access-Control-Allow-Headers', 'Authorization, Content-Length, X-Requested-With');
   res.header('Access-Control-Expose-Headers', 'Authorization, Content-Length, X-Requested-With');
   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');

   // intercept OPTIONS method
   if ('OPTIONS' == req.method) {
      res.send(200);
   } else {
      next();
   }
};

var app = express();
app.use(CORS);
app.use(express.bodyParser());

// Root (GET)
app.get('/', function(req, res, next) {
   res.send(200, { minions: "Assemble!" });
});

// Account create (POST)
app.post('/users', function(req, res, next) {
   if (!req.body.name) {
      return res.send(400, 'Must specify a name (' + JSON.stringify(req.body) + ')');
   }
   if (!req.body.username) {
      return res.send(400, 'Must specify a username');
   }
   if (!req.body.password) {
      return res.send(400, 'Must specify a password');
   }

   AccountModel.create(req.body, function(err, userDoc) {
      if (err) {
         return next(err);
      }

      // Sanitize output
      delete userDoc.password
      res.send(200, userDoc);
   })
});

// Session create (POST)
app.post('/sessions', function(req, res, next) {
   if (!req.body.username) {
      return res.send(400, 'Must specify a username');
   }
   if (!req.body.password) {
      return res.send(400, 'Must specify a password');
   }
   
   AccountModel.getByUsername(req.body.username, function(err, userDoc) {
      if (err) {
         return next(err);
      }

      var password_hash = crypto.createHash('sha1').update(req.body.password).digest('base64');
      if (password_hash !== userDoc.password) {
         return res.send(400, 'Passwords do not match');
      }

      SessionModel.create(userDoc.uid, function(err, sessDoc) {
         if (err) {
            return next(err);
         }

         // Pass authorized session as HTTP header
         res.setHeader('Authorization', sessDoc.sid);

         // Sanitize output
         delete userDoc.password
         res.send(200, userDoc);
      });
   });
});

// Authenticated users (GET)
app.get('/me', HttpAuth, function(req, res, next) {
   AccountModel.get(req.uid, function(err, user) {
      if (err) {
         return next(err);
      }

      // Sanitize output
      delete user.password;
      res.send(200, user);
   });
});

// Save user state (PUT)
app.put('/state/:name', HttpAuth, function(req, res, next) {
   StateModel.save(req.uid, req.params.name, parseInt(req.query.last_ver, 10), req.body, function(err, stateBlock) {
      if (err) {
         return next(err);
      }

      res.send(200, stateBlock);
   });
});

// Get user state (GET)
app.get('/state/:name', HttpAuth, function(req, res, next) {
   StateModel.get(req.uid, req.params.name, function(err, stateBlock) {
      if (err) {
         return next(err);
      }

      res.send(200, stateBlock);
   });
});

// List user states (GET)

// See http://stackoverflow.com/a/7069902/901156
app.options('/states', HttpAuth, function(req, res, next) {
   console.log(JSON.stringify(req));
});

app.get('/states', HttpAuth, function(req, res, next) {
   StateModel.findByUserId(req.uid, function(err, states) {
      if (err) {
         return next(err);
      }

      res.send(200, states);
   });
});

app.listen(port, function() {
   console.log('Listening on port ' + port);
});
