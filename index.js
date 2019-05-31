const chromium = require('chrome-aws-lambda');
const Redis = require('ioredis');
const flatten = require('lodash.flatten');
const puppeteer = require('puppeteer-core');
const crawler = require('./crawler');

const redis = new Redis(6379, process.env.REDIS_URL);

const generalize = (tld) => {
  if (tld[0] === '.') return tld.slice(1);
  return tld;
};

exports.handler = async () => {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
  });

  const crawlerArr = await crawler(browser);
  const result = flatten(await Promise.all(crawlerArr));
  await browser.close();

  const tlds = result.reduce((obj, e) => {
    const tld = generalize(e.tld);
    if (!obj[tld]) Object.defineProperty(obj, tld, { value: [], enumerable: true });
    obj[tld].push({
      origin: e.origin,
      price: e.price,
    });

    return obj;
  }, {});

  const settings = Object.keys(tlds).map(tld => redis.set(tld, JSON.stringify(tlds[tld])));
  settings.push(redis.set('_tlds', JSON.stringify(Object.keys(tlds))));
  await Promise.all(settings);

  return { result: 'Updated', tlds };
};
