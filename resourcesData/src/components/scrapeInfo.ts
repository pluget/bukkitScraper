import { Page } from "puppeteer";

interface Data {
  title: string;
  url: URL;
  iconUrl?: URL;
  desc: string;
  id: number;
  downloads: number;
  source?: URL;
  depricated: boolean;
  authors: string[];
}

export default async function scrapeInfo(plugin: { title: string, url: URL, desc: string }, i: number, pageArr: Page[], numberOfBrowsers: number): Promise<Data[]> {
  const data: Data[] = []
  const { title, url, desc }: { title: string, url: URL; desc: string } = plugin;
  const page = pageArr[i % numberOfBrowsers];
  await page.goto(url.toString());
  //await page.waitForSelector('.project-details');
  const aboutSectionPromise = page.$(
    ".e-project-details-secondary > .cf-sidebar-wrapper > .cf-sidebar-inner > ul.cf-details.project-details"
  );
  const authorsElementPromise = page.$$("ul.project-members > li.user-tag-large > .info-wrapper > p > a > span");
  const iconElementPromise = page.$("a.e-avatar64");
  const [aboutSection, authorsElement, iconElement] = await Promise.all([
    aboutSectionPromise,
    authorsElementPromise,
    iconElementPromise
  ]);

  const idElementPromise =
    aboutSection !== null
      ? aboutSection.$("li:nth-child(1) > div:nth-child(2)")
      : null;
  const downloadsElementPromise =
    aboutSection !== null
      ? await aboutSection.$("li:nth-child(4) > div:nth-child(2)")
      : null;
  let sourceElement = null;
  for (let i = 0; i < 10; i++) {
    const tempSourceElement =
      aboutSection !== null
        ? await page.$(
          `.e-menu > li:nth-child(${i}) > a.external-link:nth-child(1)`
        )
        : null;
    if (
      tempSourceElement !== null &&
      String(
        await (await tempSourceElement.getProperty("textContent")).jsonValue()
      ).trim() === "Source"
    ) {
      sourceElement = tempSourceElement;
      break;
    }
  }
  const [idElement, downloadsElement] = await Promise.all([
    idElementPromise,
    downloadsElementPromise
  ]);

  const id: number =
    idElement !== null
      ? parseInt(
        await (await idElement.getProperty("textContent")).jsonValue()
      )
      : 0;
  const downloads: number =
    downloadsElement !== null
      ? parseInt(
        String(
          await (
            await downloadsElement.getProperty("textContent")
          ).jsonValue()
        )
          .split(",")
          .join("")
      )
      : 0;
  const source: URL | undefined =
    sourceElement !== null
      ? await (await sourceElement.getProperty("href")).jsonValue()
      : undefined
  const iconUrl: URL | undefined = iconElement !== null ? await (await iconElement.getProperty("href")).jsonValue() : undefined;

  // if .e-icon-alert is present, the plugin is depricated
  const depricated = (await page.$(".e-icon-alert")) !== null
  const authors: string[] = []

  if (authorsElement !== null) {
    for (let j = 0; j < authorsElement.length; j++) {
      authors.push(await (await authorsElement[j].getProperty("textContent")).jsonValue());
    }
  }

  data.push({ title, url, desc, id, downloads, source, depricated, authors, iconUrl })
  return data;
}
