const puppeteer = require('puppeteer-core');

const cheerio = require('cheerio');

require('dotenv').config();

const LOGIN_CREDENTIALS = {
    'username' : process.env.USERNAME,
    'password' : process.env.PASSWORD
};

const config = {
    pageUrl: "https://www.gmail.com/",
    waitUntil: 'networkidle0',
    viewPort:  {width: 1366, height: 738 },
};

const supportedDigests = {
    'Quora Digest' : true
};

const CHROME_EXTENSION_PATH = process.env.CHROME_EXT_PATH;
let $ = null;
(async function main() {
    try {
        const browser = await puppeteer.launch({
            headless: false,
            userDataDir: './user_data',
            executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            args: [
                `--disable-extensions-except=${CHROME_EXTENSION_PATH}`
            ],
            defaultViewport: null,
        });

        const page = await browser.newPage();
        await page.setViewport(config.viewPort);
        await page.setBypassCSP(true);

        await page.goto(config.pageUrl, config.waitUntil);
        // const navigationPromise = page.waitForNavigation();
        // await page.waitForSelector('input[type="email"]');
        // await page.type('input[type="email"]', LOGIN_CREDENTIALS.username);
        // await page.click('#identifierNext');
        //
        // await page.waitForSelector('input[type="password"]', { visible: true });
        // await page.type('input[type="password"]', LOGIN_CREDENTIALS.password);
        //
        // await page.click('#passwordNext');
        //
        // await navigationPromise;

        await page.waitForSelector("[aria-label='Social']", {
            visible: true,
        });

        const socialTab = await page.$("[aria-label='Social']");
        await socialTab.click();

        const html = await page.content();
        let $ = await cheerio.load(html);
        const selector = ".aDP > .aDM:nth-child(2) > div.Cp:nth-child(3) tbody > tr";
        const socialTabData = $(selector);

        let unreadEmailsIndex = [];

        socialTabData.each(async function(index, tr) {
            let data = {};
            $(tr).find('td').each (function(i, td) {
                if(i==4) {
                    data.author = $(td).find("div:nth-child(2) > span > span").text();
                }
                if (i==9) {
                    const actionRead = $(td).find("ul > li:nth-child(3)").data('tooltip');
                    data.isRead = actionRead != "Mark as read";
                }
            });
            if(!data.isRead) {
                if(supportedDigests[data.author]  === true )
                    unreadEmailsIndex.push(index);
                return false;
            }
        });

        let randomItem = unreadEmailsIndex[Math.floor(Math.random()*unreadEmailsIndex.length)];
        randomItem++;

        let mySelector = `.aDP > .aDM:nth-child(2) > div.Cp:nth-child(3) tbody > tr:nth-child(${randomItem})`;

        await page.evaluate((mySelector) => {
            document.querySelector(mySelector).click()
        }, mySelector);

        await page.waitForSelector(".ads.adn", {
            visible: true,
        });

        $ = await cheerio.load(await page.content());

        const pageSelector = '.ads.adn > div:nth-child(2) > div:nth-child(3) > div:nth-child(3) > div > div > div:nth-child(1) a[href*="https://www.quora.com/qemail/track_click?al_imp="]';
        let set = new Set();
        $(pageSelector).each(async function (index, item) {
            const url = $(item).attr('href');
            if(url.includes('QuestionLinkClickthrough')) {
                await open_tab($(item).attr('href'), browser);
                set.add($(item).attr('href'));
            }
        });
        console.log(set, set.size);
    }
    catch(error) {
        console.error(error);
    }
})();

async function open_tab(url,browser ){
    let  page  = await browser.newPage();
    await page.setViewport(config.viewPort);
    await page.setBypassCSP(true);
    await page.goto(url);
}


