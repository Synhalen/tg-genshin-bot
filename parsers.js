export async function proGameGuides(browser) {
  const page = await browser.newPage();
  await page.goto(
    "https://progameguides.com/genshin-impact/genshin-impact-codes/"
  );

  const SELECTOR =
    ".entry-content > ul:first-of-type > li > strong:first-child";

  page.waitForSelector(SELECTOR);
  const codes = await page.$$eval(SELECTOR, (elements) =>
    elements.map((element) => element.textContent)
  );

  return codes;
}

export async function landOfGames(browser) {
  const page = await browser.newPage();
  await page.goto(
    "https://landofgames.ru/articles/guides/9832-promokody-dlya-genshin-impact-kamni-istoka-ochki-priklyucheniy-i-mora.html"
  );

  const SELECTOR = "#main_art > ul:nth-child(9) > li";

  page.waitForSelector(SELECTOR);
  const codes = await page.$$eval(SELECTOR, (elements) =>
    elements.map((element) => element.textContent.split(" ", 1).join(""))
  );

  return codes;
}
