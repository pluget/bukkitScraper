import { Browser, Page } from "puppeteer"; //types for puppeteer
import puppeteer from "puppeteer-extra";
import AdblockPlugin from "puppeteer-extra-plugin-adblocker";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(AdblockPlugin());
puppeteer.use(StealthPlugin());

export default async function launchBrowsers(
  numberOfBrowsers: number = 1
): Promise<Page[]> {
  // Configure puppeteer
  const options = {
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: {
      width: 1919,
      height: 1079,
      deviceScaleFactor: 0,
      isMobile: false,
      hasTouch: false,
      isLandscape: false,
    },
  };

  const CHROME_PATH = process.env.CHROME_PATH || "";

  const browserArr: Browser[] = [];
  const pageArr: Page[] = [];

  for (let i = 0; i < numberOfBrowsers; i++) {
    const browser = await puppeteer.launch({
      ...options,
      executablePath: CHROME_PATH,
    });
    browserArr.push(browser);

    const page = (await browser.pages())[0];
    pageArr.push(page);
    await page.target().createCDPSession();
  }
  return pageArr;
}
