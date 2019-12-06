const puppeteer = require('puppeteer-core');
const cheerio = require('cheerio');

const { config, credentials, supportedDigests } = require('./config');
const socialTabSelector = "[aria-label='Social']";
const socialTabListSelector = ".aDP > .aDM:nth-child(2) > div.Cp:nth-child(3) tbody > tr";
const linkPattern = 'a[href*="https://www.quora.com/qemail/track_click?al_imp="]';
const pageSelector = `.ads.adn > div:nth-child(2) > div:nth-child(3) > div:nth-child(3) > div > div > div:nth-child(1) ${linkPattern}`;

(async function main() {
    try {
        const browser = await puppeteer.launch({
            headless: false,
            executablePath: config.chromePath,
            args: [ '--start-maximized', '--window-size=1920,1080' ],
            defaultViewport: null
        });
        const page = await browser.newPage();

        await page.goto(config.pageUrl, config.waitUntil);
        const navigationPromise = page.waitForNavigation();

        //Input Login Credentials
        await page.waitForSelector('input[type="email"]');
        await page.type('input[type="email"]', credentials.username);
        await page.click('#identifierNext');

        await page.waitForSelector('input[type="password"]', { visible: true });
        await page.type('input[type="password"]', credentials.password);

        await page.click('#passwordNext');

        await navigationPromise;

        await page.waitForSelector(socialTabSelector, { visible: true });

        //Goto Socials Tab
        const socialTab = await page.$(socialTabSelector);
        await socialTab.click();

        const html = await page.content();
        let $ = await cheerio.load(html);

        const socialTabList = $(socialTabListSelector);
        const unreadEmailsIndex = getUnreadEmailsIndex($, socialTabList);

        if (unreadEmailsIndex === undefined || unreadEmailsIndex.length == 0) {
            // array empty or does not exist
            await page.waitFor(5000);
            await browser.close();
        }

        let randomUnreadEmailIndex = unreadEmailsIndex[Math.floor(Math.random() * unreadEmailsIndex.length)];

        const unreadEmailSelector = `.aDP > .aDM:nth-child(2) > div.Cp:nth-child(3) tbody > tr:nth-child(${++randomUnreadEmailIndex})`;

        await page.evaluate((unreadEmailSelector) => { document.querySelector(unreadEmailSelector).click() }, unreadEmailSelector);

        //Redirect to Email Page
        await page.waitForSelector(".ads.adn", { visible: true });
        $ = await cheerio.load(await page.content());

        $(pageSelector).each(async function (index, item) {
            const storyUrl = $(item).attr('href');
            if(storyUrl.includes('QuestionLinkClickthrough')) {
                await open_tab(storyUrl, browser);
            }
        });
    }
    catch(error) {
        console.error(error);
    }
})();

async function open_tab(url,browser) {
    let  page  = await browser.newPage();
    await page.goto(url, config.waitUntil);
}

function getUnreadEmailsIndex($,list) {
    const result = [];
    list.each(async function(index, tr) {
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
                result.push(index);
            return false;
        }
    });
    return result;
}