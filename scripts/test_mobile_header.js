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

    console.log("Waiting 3 seconds for page loading...");
    await new Promise((r) => setTimeout(r, 3000));

    // Evaluate visibility of the search button in header
    const searchBtnStatus = await page.evaluate(() => {
      // Find the button containing the search icon or having search attributes
      const searchButton = Array.from(
        document.querySelectorAll("header button"),
      ).find((btn) => {
        return (
          btn.innerHTML.includes("lucide-search") ||
          btn.getAttribute("aria-label") === "Buscar productos"
        );
      });

      if (!searchButton) return { found: false };

      const style = window.getComputedStyle(searchButton);
      return {
        found: true,
        display: style.display,
        visibility: style.visibility,
        isHidden: style.display === "none",
      };
    });

    console.log(
      "Header Search Button mobile status:",
      JSON.stringify(searchBtnStatus, null, 2),
    );

    await browser.close();
  } catch (error) {
    console.error("Error during mobile header test:", error);
    process.exit(1);
  }
}

run();
