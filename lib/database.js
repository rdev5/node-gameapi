// Database (Couchbase)
var couchbase = require('couchbase');
var cb_server = '127.0.0.1:8091';
var cb_bucket = 'gameapi';
var cb_password = 'gameapi-bucket-password-1234';

module.exports.mainBucket = new couchbase.Connection({host: cb_server, bucket: cb_bucket, password: cb_password});
