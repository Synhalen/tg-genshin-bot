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

    await page.waitForSelector("#main_art");

    const codes = await page.evaluate(() => {
      const root = document.querySelector("#main_art");
      if (!root) {
        return [];
      }

      const headings = [...root.querySelectorAll("h2, h3")];

      const startHeading = headings.find((heading) =>
        heading.textContent.includes("Действующие промокоды")
      );

      const endHeading = headings.find((heading) =>
        heading.textContent.includes("Как активировать промокоды")
      );

      if (!startHeading || !endHeading) {
        return [];
      }

      const codePattern = /^[A-Z0-9]{8,20}\b/;
      const extractedCodes = [];

      let currentNode = startHeading.nextElementSibling;

      while (currentNode && currentNode !== endHeading) {
        if (currentNode.tagName?.toLowerCase() === "ul") {
          const items = [...currentNode.querySelectorAll("li")]
            .map((li) => li.textContent.trim())
            .map((text) => {
              const match = text.match(codePattern);
              return match ? match[0] : null;
            })
            .filter(Boolean);

          extractedCodes.push(...items);
        }

        currentNode = currentNode.nextElementSibling;
      }

      return [...new Set(extractedCodes)];
    });

    if (codes.length === 0) {
      throw new Error("No promo codes found in active section");
    }

    return codes;
  } catch (e) {
    console.error(e);
    throw new Error("Failed to parse landofgames");
  }
}
