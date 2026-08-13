import { chromium } from "playwright";

const DEBUG_PORT = 9222;
const CDP_URL = `http://127.0.0.1:${DEBUG_PORT}`;

async function run() {
  try {
    console.log("Connecting Playwright to Chrome via CDP...");
    const browser = await chromium.connectOverCDP(CDP_URL);
    console.log("Connected!");

    const contexts = browser.contexts();
    let context = contexts[0];
    if (!context) {
      context = await browser.newContext();
    }

    let pages = context.pages();
    let page = pages[0];
    if (!page) {
      page = await context.newPage();
    }

    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 812 });

    const testUrl = "http://localhost:5173/";
    console.log(`Navigating to ${testUrl} with mobile viewport...`);
    await page.goto(testUrl, { waitUntil: "domcontentloaded", timeout: 30000 });

    console.log("Waiting 3 seconds for page loading...");
    await new Promise((r) => setTimeout(r, 3000));

    console.log("Scrolling down to footer...");
    await page.locator("footer").scrollIntoViewIfNeeded();
    await new Promise((r) => setTimeout(r, 2000)); // wait for rendering and images to fetch

    const screenshotPath =
      "/Users/musa/Downloads/sopisafer/carpeta de referencia/mobile_footer_fixed.png";
    console.log("Taking screenshot...");
    // We use a small timeout and animations disabled to make it fast
    await page.screenshot({
      path: screenshotPath,
      timeout: 5000,
      animations: "disabled",
    });
    console.log(`Saved scrolled screenshot to ${screenshotPath}`);

    await browser.close();
  } catch (error) {
    console.error("Error during mobile footer screenshot test:", error);
    process.exit(1);
  }
}

run();
