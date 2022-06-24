import launchBrowsers from "./components/launchBrowsers";
import fetchNumberOfPages from "./components/numberOfPages";
import { writeFile } from "jsonfile";
import { resolve } from "path";

async function main(filterSort = 5) {
  const numberOfBrowsers = 6;
  const pageArr = await launchBrowsers(numberOfBrowsers);
  const numberOfPages = await fetchNumberOfPages(pageArr);
  const data: { [key: string]: URL } = {};
  for (let i = numberOfPages; i > 0; i--) {
    const page = pageArr[i % numberOfBrowsers];
    //go to the bukkit page
    await page.goto(
      `https://dev.bukkit.org/bukkit-plugins?filter-sort=${filterSort}&page=${i}`
    );
    const elements = await page.$$("li.project-list-item");

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const titleElement = await element.$(
        "div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > a:nth-child(1)"
      );
      const title: string =
        titleElement !== null
          ? await (await titleElement.getProperty("textContent")).jsonValue()
          : "";
      const url: URL =
        titleElement !== null
          ? await (await titleElement.getProperty("href")).jsonValue()
          : new URL("");
      Object.assign(data, { [title]: url });
    }
  }
  for (const i in pageArr) {
    // close page
    pageArr[i].close();
  }
  return data;
}

const dir = resolve(
  process.cwd(),
  "../../scraperRepository/bukkitResources.json"
);

main()
  .then((data) => {
    writeFile(dir, data);
  })
  .catch((err) => {
    console.log(err);
  });
