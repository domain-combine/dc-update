const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

const domain = 'bvr678ijbvftyujnbvtyujn';

const getNameList = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let result = [];

  try {
    await page.goto(`https://www.name.com/domain/search/${domain}`);
    const response = await page.waitForResponse('https://www.name.com/api/search/poll');
    const json = await response.json();

    result = Object.entries(json.domains).map(e => ({
      tld: e[0].split('.')[1],
      price: e[1].renewal_price,
    }));
  } finally {
    await browser.close();
  }

  return result;
};

const getGabiaList = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const result = [];

  try {
    await page.goto('https://www.gabia.com');
    await page.type('#new_domain', domain);
    await page.keyboard.press('Enter');
    await page.waitForSelector('.fal.fa-spinner.fa-spin');
    // eslint-disable-next-line no-undef
    await page.waitFor(() => !document.querySelector('#ul_recommend .fal.fa-spinner.fa-spin'));
    const domains = await page.$eval('#ul_recommend', e => e.innerText);
    domains.split('\n').forEach((e, i) => {
      if (i % 2 === 0) result.push({ tld: e.split(' ')[0].split('.')[1], price: undefined });
      else [result[Math.floor(i / 2)].price] = e.split(' /');
    });
  } finally {
    await browser.close();
  }

  return result;
};

const getGodaddyList = async () => {
  const { data: { Products } } = await axios({
    method: 'get',
    url: 'https://find.godaddy.com/domainsapi/v1/search/spins',
    params: {
      pagestarts: 0,
      pagesize: 1000,
      q: domain,
    },
    headers: {
      Cookie: 'currency=KRW;',
    },
  });
  return Products
    .map(({ Tld: tld, PriceInfo: { CurrentPrice: price } }) => ({ tld, price }));
};

const getHostingKrList = async () => {
  const { data: { event: prices } } = await axios('https://www.hosting.kr/domains/carts/prices');
  const arr = [];
  Object.keys(prices).forEach((key) => {
    arr.push({ tld: key.slice(1), price: prices[key][1] });
  });
  return arr;
};

const getDirectHostingList = async () => {
  const { data: lawHTML } = await axios.get('https://direct.co.kr/domain/dm_pay.html');
  const $ = cheerio.load(lawHTML);

  const res = $('div[class=con] tbody')
    .first()
    .find('tr').map((i, e) => ({
      tld: $(e).find('th').text(),
      price: $(e).find('td').text().slice(0, -3),
    }))
    .get();

  return res;
};

const getOnlyDomainsList = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let result = [];

  try {
    await page.goto('https://www.onlydomains.com');
    await page.type('#domain', domain);
    await page.keyboard.press('Enter');
    await page.waitForSelector('#searchResultPage > div.Results > div.HomeResult > div');
    // eslint-disable-next-line no-undef
    const [{ ecommerce: { impressions: prices } }] = await page.evaluate(() => dataLayer);
    result = prices.map(({ name: tld, price }) => ({ tld, price }));
  } finally {
    await browser.close();
  }

  return result;
};

const getMailPlugList = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let tldArr = [];

  try {
    await page.goto('https://www.mailplug.com/front/domain/domain_regist');
    await page.type('[name="domainlist1"]', domain);
    await page.keyboard.press('Enter');
    await page.waitForSelector('img[alt="검색 결과 더보기"]');
    await page.waitForSelector('img[alt="검색 결과 더보기"]', { hidden: true });

    // eslint-disable-next-line no-undef
    const tlds = await page.evaluate(() => [...document.querySelectorAll('.domain_title')].map(x => x.innerText));

    await Promise.all(tlds).then((values) => {
      tldArr.push(...values.slice(1));
    });
  } finally {
    await browser.close();
  }

  const param = {};
  tldArr = tldArr.map(x => x.split('.').slice(1).join('.'));

  tldArr.forEach((x, i) => {
    param[`tld_arr[${i}]`] = x;
  });
  param.hope_str = domain;

  const { data } = await axios({
    method: 'get',
    url: 'https://www.mailplug.com/front/xhr_domain/domainRegistCheck',
    params: param,
  });

  return Object.values(data).map(x => ({ tld: x.tld, price: x.gp_tot_price }));
};

const getBluehostList = async () => {
  const { data: { results } } = await axios.get(`https://registration.bluehost.com/domains/search/${domain}?propertyID=52`);
  return results.map(x => ({ tld: x.domainInfo.tld, price: x.terms[0].price }));
};

module.exports = [
  getNameList,
  getGabiaList,
  getGodaddyList,
  getHostingKrList,
  getDirectHostingList,
  getOnlyDomainsList,
  getMailPlugList,
  getBluehostList,
];
