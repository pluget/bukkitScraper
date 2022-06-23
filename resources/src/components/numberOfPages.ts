import { Page } from "puppeteer";

export default async function numberOfPages(
  pageArr: Page[],
  pageNumber = 0,
  filterSort = 5
): Promise<number> {
  const page = pageArr[pageNumber];
  await page.goto(
    `https://dev.bukkit.org/bukkit-plugins?filter-sort=${filterSort}`
  );

  const element = await page.$(
    "div.b-pagination:nth-child(2) > ul:nth-child(1) > li:nth-child(7)"
  );

  const text: string =
    element !== null
      ? await (await element.getProperty("textContent")).jsonValue()
      : "0";

  const intiger = parseInt(text);
  return intiger;
}
