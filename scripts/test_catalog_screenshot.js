import { chromium } from 'playwright';

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

    const testUrl = 'http://localhost:5173/';
    console.log(`Navigating to ${testUrl}...`);
    await page.goto(testUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    console.log('Waiting 4 seconds for page loading...');
    await new Promise(r => setTimeout(r, 4000));

    console.log('Scrolling down to #coleccion section...');
    await page.locator('#coleccion').scrollIntoViewIfNeeded();
    await new Promise(r => setTimeout(r, 2000)); // wait for rendering and images to fetch

    const screenshotPath = '/Users/musa/Downloads/sopisafer/carpeta de referencia/catalog_scrolled_fixed.png';
    console.log('Taking screenshot...');
    await page.screenshot({ path: screenshotPath, timeout: 10000 });
    console.log(`Saved scrolled screenshot to ${screenshotPath}`);

    await browser.close();
  } catch (error) {
    console.error('Error during catalog screenshot test:', error);
    process.exit(1);
  }
}

run();
