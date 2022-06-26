import launchBrowsers from "./components/launchBrowsers";
import scrapeInfo from "./components/scrapeInfo";
import { readFile, writeFile } from "jsonfile";
import { resolve } from "path";

interface Data {
  title: string;
  url: URL;
  desc: string;
  id: number;
  downloads: number;
  source?: URL;
  depricated: boolean;
  authors: string[];
}

async function main() {
  const dir = resolve(
    process.cwd(),
    "../../scraperRepository/bukkitResources.json"
  );
  const plugins = await readFile(dir);

  const numberOfBrowsers = 8;
  const pageArr = await launchBrowsers(numberOfBrowsers);

  const data: Data[] = [];


  let i = 0;
  const scrapers = new Array(numberOfBrowsers);
  for (const plugin in plugins) {
    try {
      scrapers[i % numberOfBrowsers] = scrapeInfo({ title: plugin, ...plugins[plugin] }, i, pageArr, numberOfBrowsers);
    } catch (e) {
      console.error(e);
    }

    if (i % numberOfBrowsers === numberOfBrowsers - 1) {
      try {
        await Promise.all(scrapers)
      } catch (err) {
        console.error(err)
      }
    }
    i++;
  }
  return data;
}

const dir = resolve(
  process.cwd(),
  "../../scraperRepository/bukkitResourcesData.json"
);

main()
  .then((data) => writeFile(dir, data))
  .catch(console.error);
