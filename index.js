/* const redis = require('ioredis'); */
const crawler = require('./crawler');

exports.handler = (event, context, cb) => {
  crawler().then((arr) => {
    Promise.all(arr)
      .then(e => cb(null, e))
      .catch(e => cb(e));
  });
};
