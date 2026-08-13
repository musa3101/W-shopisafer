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

    // Set viewport to mobile size (iPhone 13 style)
    await page.setViewportSize({ width: 375, height: 812 });

    const testUrl = "http://localhost:5173/";
    console.log(`Navigating to ${testUrl} with mobile viewport...`);
    await page.goto(testUrl, { waitUntil: "domcontentloaded", timeout: 30000 });

    console.log("Waiting 1s for loader to render...");
    await new Promise((r) => setTimeout(r, 1000));

    const checkResult = await page.evaluate(() => {
      const el = document.querySelector(".isafer-loader-wrapper");
      if (!el) return { found: false };
      return {
        found: true,
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        offsetWidth: el.offsetWidth,
        innerWidth: window.innerWidth,
        overflows: el.scrollWidth > window.innerWidth,
        text: el.innerText,
      };
    });

    console.log(
      "Loader element dimensions:",
      JSON.stringify(checkResult, null, 2),
    );

    await browser.close();
  } catch (error) {
    console.error("Error during mobile loader check:", error);
    process.exit(1);
  }
}

run();
