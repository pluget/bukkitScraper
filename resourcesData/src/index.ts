import launchBrowsers from "./components/launchBrowsers";
import scrapeInfo from "./components/scrapeInfo";
import { readFile } from "jsonfile";
import { resolve } from "path";
import { stringify } from "querystring";

async function main() {
  const dirPlugins = resolve(
    process.cwd(),
    "../../scraperRepository/bukkitResources.json"
  );
  const plugins = await readFile(dirPlugins);

  const dirData = resolve(process.cwd(), "../../scraperRepository/bukkitResourcesData.json");
  const data: { title: string }[] = await readFile(dirData);

  const numberOfBrowsers = 8;
  const pageArr = await launchBrowsers(numberOfBrowsers);

  let i = 0;
  const scrapers = new Array(numberOfBrowsers);
  for (const plugin in plugins) {
    if (!data.find(d => d.title === plugin)) {
      try {
        scrapers[i % numberOfBrowsers] = scrapeInfo({ title: plugin, ...plugins[plugin] }, i, pageArr, numberOfBrowsers);
      } catch (e) {
        console.error(e);
      }

      if (i % numberOfBrowsers === numberOfBrowsers - 1) {
        try {
          for (const scraperData of await Promise.all(scrapers)) {
            console.log(JSON.stringify(scraperData[0]) + ",");
          }
        } catch (err) {
          console.error(err)
        }
      }
      i++;
    }
  }
}

console.log("[")
main()
  .then(() => {
    console.log("]");
  })
  .catch(console.error);
