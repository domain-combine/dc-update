/* const redis = require('ioredis'); */
const crawler = require('./crawler');

exports.handler = async () => {
  const results = await Promise.all[crawler];
  console.log(results);
};
