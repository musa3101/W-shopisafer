import { chromium } from 'playwright';

const DEBUG_PORT = 9222;
const CDP_URL = `http://127.0.0.1:${DEBUG_PORT}`;

async function run() {
  try {
    const browser = await chromium.connectOverCDP(CDP_URL);
    const context = browser.contexts()[0] || await browser.newContext();
    const page = context.pages()[0] || await context.newPage();

    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('http://localhost:5173/', { waitUntil: 'commit' });
    await new Promise(r => setTimeout(r, 2000));

    console.log('Scrolling to footer...');
    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();
    await new Promise(r => setTimeout(r, 1000));

    const screenshotPath = '/Users/musa/Downloads/sopisafer/carpeta de referencia/mobile_footer_cropped_fixed.png';
    console.log('Taking fast screenshot...');
    // Setting animations: 'disabled'
    await page.screenshot({ 
      path: screenshotPath, 
      animations: 'disabled',
      type: 'png'
    });
    console.log('Screenshot saved to:', screenshotPath);
    await browser.close();
  } catch (err) {
    console.error('Screenshot error:', err);
  }
}

run();
