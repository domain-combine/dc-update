/* const redis = require('ioredis'); */
const chromium = require('chrome-aws-lambda');
const _ = require('lodash');
const puppeteer = require('puppeteer-core');
const crawler = require('./crawler');

exports.handler = async () => {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
  });

  const crawlerArr = await crawler(browser);
  const result = _.flatten(await Promise.all(crawlerArr));
  await browser.close();

  return result.reduce((obj, e) => {
    if (!obj[e.tld]) Object.defineProperty(obj, e.tld, { value: [], enumerable: true });
    obj[e.tld].push({
      origin: e.origin,
      price: e.price,
    });

    return obj;
  }, {});
};
