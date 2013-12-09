// Core
var express = require('express');

var app = express();
app.use(express.bodyParser());

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

   var AccountModel = require('./models/accountmodel.js');
   AccountModel.create(req.body, function(err, user) {
      if (err) {
         return next(err);
      }

      // Sanitize output
      delete user.password
      res.send(200, user);
   })
});

app.listen(3000, function() {
   console.log('Listening on port 3000');
});
