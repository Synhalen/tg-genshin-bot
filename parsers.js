export async function proGameGuides(browser) {
  try {
    const page = await browser.newPage();
    await page.goto(
      "https://progameguides.com/genshin-impact/genshin-impact-codes/"
    );

    const SELECTOR =
      ".wp-block-gamurs-article-content > ul:first-of-type > li > strong:first-child";

    await page.waitForSelector(SELECTOR);
    const codes = await page.$$eval(SELECTOR, (elements) =>
      elements.map((element) => element.textContent)
    );

    return codes;
  } catch (e) {
    console.error(e);
    throw new Error("Failed to parse progameguides");
  }
}

export async function landOfGames(browser) {
  try {
    const page = await browser.newPage();
    await page.goto(
      "https://landofgames.ru/articles/guides/9832-promokody-dlya-genshin-impact-kamni-istoka-ochki-priklyucheniy-i-mora.html"
    );

    const SELECTOR = "#main_art > ul:nth-of-type(1) > li";

    await page.waitForSelector(SELECTOR);
    const codes = await page.$$eval(SELECTOR, (elements) =>
      elements.map((element) => element.textContent.split(" ", 1).join(""))
    );
    return codes;
  } catch (e) {
    console.error(e);
    throw new Error("Failed to parse landofgames");
  }
}
