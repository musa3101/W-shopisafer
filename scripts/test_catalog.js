import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const DEBUG_PORT = 9222;
const CDP_URL = `http://127.0.0.1:${DEBUG_PORT}`;

async function run() {
  try {
    console.log('Connecting Playwright to Chrome via CDP...');
    const browser = await chromium.connectOverCDP(CDP_URL);
    console.log('Connected!');

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

    // Monitor console logs
    page.on('console', msg => {
      console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`);
    });

    page.on('pageerror', err => {
      console.error(`[BROWSER UNCAUGHT ERROR] ${err.toString()}`);
    });

    const testUrl = 'http://localhost:5173/';
    console.log(`Navigating to ${testUrl}...`);
    await page.goto(testUrl, { waitUntil: 'load', timeout: 30000 });

    console.log('Waiting 4 seconds for the initial loader to disappear...');
    await new Promise(r => setTimeout(r, 4000));

    const title = await page.title();
    console.log(`Title: "${title}"`);

    // Check if there are any products rendered
    const productsCount = await page.locator('article').count();
    console.log(`Number of product <article> cards visible: ${productsCount}`);

    // Let's get the inner text of the body to see if there's any visible error
    const bodyText = await page.innerText('body');
    console.log('--- Body Text Snippet ---');
    console.log(bodyText.substring(0, 1000));
    console.log('-------------------------');

    const screenshotPath = '/Users/musa/Downloads/sopisafer/carpeta de referencia/catalog_after_load.png';
    await page.screenshot({ path: screenshotPath });
    console.log(`Saved screenshot to ${screenshotPath}`);

    await browser.close();
  } catch (error) {
    console.error('Error during catalog test:', error);
    process.exit(1);
  }
}

run();
