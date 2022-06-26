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
  const dirPlugins = resolve(
    process.cwd(),
    "../../scraperRepository/bukkitResources.json"
  );
  const plugins = await readFile(dirPlugins);

  const dirIndexedPlugins = resolve(
    process.cwd(),
    "../../scraperRepository/bukkitResourcesData.json"
  );
  const indexedPlugins: Data[] = await readFile(dirIndexedPlugins);

  const numberOfBrowsers = 8;
  const pageArr = await launchBrowsers(numberOfBrowsers);

  const data: Data[] = [];

  data.push(...indexedPlugins);

  let i = 0;
  const scrapers = new Array(numberOfBrowsers);
  for (const plugin in plugins) {
    if (!indexedPlugins.find((x) => x.title === plugin)) {
      try {
        scrapers[i % numberOfBrowsers] = scrapeInfo({ title: plugin, ...plugins[plugin] }, i, pageArr, numberOfBrowsers);
      } catch (e) {
        console.error(e);
      }

      if (i % numberOfBrowsers === numberOfBrowsers - 1) {
        try {
          data.push(...await Promise.all(scrapers));
          writeFile(dirIndexedPlugins, data);
        } catch (err) {
          console.error(err)
        }
      }
      i++;
    }
  }
}

main()
  .catch(console.error);
