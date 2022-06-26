import { Page } from "puppeteer";
import puppeteer from "puppeteer-extra";
import AdblockPlugin from "puppeteer-extra-plugin-adblocker";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

export default async function launchBrowsers(numberOfBrowsers: number = 6) {
  puppeteer.use(AdblockPlugin());
  puppeteer.use(StealthPlugin());

  // setup puppeteer options
  const browserOptions = {
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  };
  const CHROME_PATH = process.env.CHROME_PATH || puppeteer.executablePath();
  const pageArr: Page[] = [];
  for (let i = 0; i < numberOfBrowsers; i++) {
    const browser = await puppeteer.launch({
      ...browserOptions,
      executablePath: CHROME_PATH,
    });
    const page = (await browser.pages())[0];
    pageArr.push(page);
  }
  return pageArr;
}
