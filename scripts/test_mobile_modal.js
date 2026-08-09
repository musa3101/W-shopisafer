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

    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 812 });

    const testUrl = 'http://localhost:5173/';
    console.log(`Navigating to ${testUrl} with mobile viewport...`);
    await page.goto(testUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    console.log('Waiting 3 seconds for page loading...');
    await new Promise(r => setTimeout(r, 3000));

    console.log('Opening product detail modal...');
    // Click on the first catalog product card (has article tags)
    await page.locator('article').first().click();
    await new Promise(r => setTimeout(r, 2000)); // wait for modal transition

    // Verify modal dimensions and scrollability
    const modalStatus = await page.evaluate(() => {
      // Find the dialog content container
      const dialogContent = document.querySelector('[role="dialog"]');
      if (!dialogContent) return { found: false };

      const innerScrollDiv = dialogContent.querySelector('.overflow-y-auto');
      const dialogRect = dialogContent.getBoundingClientRect();
      const innerScrollRect = innerScrollDiv ? innerScrollDiv.getBoundingClientRect() : null;

      return {
        found: true,
        dialogWidth: dialogRect.width,
        dialogHeight: dialogRect.height,
        dialogMaxHeightStyle: window.getComputedStyle(dialogContent).maxHeight,
        viewportHeight: window.innerHeight,
        fitsInViewport: dialogRect.height <= window.innerHeight,
        hasScrollDiv: !!innerScrollDiv,
        scrollDivHeight: innerScrollRect ? innerScrollRect.height : null,
        scrollDivScrollHeight: innerScrollDiv ? innerScrollDiv.scrollHeight : null,
        scrollDivIsScrollable: innerScrollDiv ? (innerScrollDiv.scrollHeight > innerScrollDiv.clientHeight) : false
      };
    });

    console.log('Mobile Product Modal status:', JSON.stringify(modalStatus, null, 2));

    await browser.close();
  } catch (error) {
    console.error('Error during mobile modal test:', error);
    process.exit(1);
  }
}

run();
