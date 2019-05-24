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

  const pArr = await crawler(browser);
  const result = await Promise.all(pArr);
  await browser.close();
  return _.flatten(result);
};
