/* const redis = require('ioredis'); */
const crawler = require('./crawler');

exports.handler = (event, context, cb) => {
  crawler[0].then((e) => {
    cb(null, e);
  });
};
