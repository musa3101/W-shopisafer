import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  console.log("Connecting to Chrome over CDP...");
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const defaultContext = browser.contexts()[0];
  const page = defaultContext
    ? defaultContext.pages()[0] || (await defaultContext.newPage())
    : await browser.newPage();

  let loaded = false;
  for (const url of [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
  ]) {
    try {
      console.log(`Navigating to ${url} ...`);
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 5000 });
      loaded = true;
      break;
    } catch (e) {
      console.log(`Could not reach ${url}`);
    }
  }

  if (!loaded) {
    console.error("Could not connect to dev server on port 3000 or 5173");
    await browser.close();
    return;
  }

  await page.waitForTimeout(2000);
  await page.evaluate(() => window.scrollBy(0, 800));
  await page.waitForTimeout(1000);

  console.log("Clicking on first product card...");
  const firstProduct = await page.$("article");
  if (firstProduct) {
    await firstProduct.click();
    await page.waitForTimeout(1500);
  } else {
    console.log("No article element found");
  }

  const screenshotPath = path.join(
    __dirname,
    "..",
    "carpeta de referencia",
    "product_modal_preview.png",
  );
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`Screenshot saved successfully to ${screenshotPath}!`);

  await browser.close();
})();
