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

    const testUrl = "http://localhost:5173/";
    console.log(`Navigating to ${testUrl}...`);
    await page.goto(testUrl, { waitUntil: "load", timeout: 30000 });

    console.log("Waiting 3 seconds for loader...");
    await new Promise((r) => setTimeout(r, 3000));

    console.log("Getting all image src values in #coleccion...");
    const images = await page.evaluate(() => {
      const imgElements = Array.from(
        document.querySelectorAll("#coleccion article img"),
      );
      return imgElements.map((img) => ({
        alt: img.alt,
        src: img.src,
      }));
    });

    console.log("Images found:", JSON.stringify(images, null, 2));

    await browser.close();
  } catch (error) {
    console.error("Error checking DOM images:", error);
    process.exit(1);
  }
}

run();
