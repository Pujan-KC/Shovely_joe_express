const puppeteer = require("puppeteer");

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 300;
      var timer = setInterval(() => {
        const element = document.querySelectorAll(".section-scrollbox")[1];
        var scrollHeight = element.scrollHeight;
        element.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

async function parsePlaces(page) {
  let places = [];

  const elements = await page.$$(".gm2-subtitle-alt-1 span");
  if (elements && elements.length) {
    for (const el of elements) {
      const name = await el.evaluate((span) => span.textContent);

      places.push({ name });
    }
  }
  return places;
}

async function goToNextPage(page) {
  try {
    await page.click('button[aria-label=" Next page "]');
    await page.waitForNetworkIdle();
  } catch (error) {
    console.log(error);
  }
  await page.click('button[aria-label=" Next page "]');
  await page.waitForNetworkIdle();
}

async function hasNextPage(page) {
  const element = await page.$('button[aria-label=" Next page "');
  if (!element) {
    throw new error("Next Page Element is not found");
  }

  const disabled = await page.evaluate(
    (el) => el.getAttribute("disabled"),
    element
  );
  if (disabled) {
    console.log("The next page button is disabled");
  }
  return !disabled;
}

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // await page.setViewport({
  //   width: 1200,
  //   height: 1200,
  // });

  await page.goto(
    "https://www.google.com/maps/search/Restaurants/@27.7089207,85.2911132,13z/data=!3m1!4b1?hl=en"
  );

  let places = [];
  do {
    autoScroll(page);

    places = places.concat(await parsePlaces(page));
    console.log(places.length);

    goToNextPage(page);
  } while (await hasNextPage(page));
  console.log(places);
})();
