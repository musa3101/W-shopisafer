const { chromium } = require('playwright');
const fs = require('fs');

async function main() {
  console.log('Navigating to Google Maps link...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'es-ES',
  });

  const page = await context.newPage();
  await page.goto('https://maps.app.goo.gl/2kHjqUHMUXyegViK8?g_st=ic', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Check for consent button
  try {
    const acceptBtn = await page.$('button[aria-label*="Aceptar"], button:has-text("Aceptar todo"), button:has-text("Accept all")');
    if (acceptBtn) {
      console.log('Clicking accept consent button...');
      await acceptBtn.click();
      await page.waitForTimeout(4000);
    }
  } catch (e) {}

  // Click hours dropdown to expand full schedule
  try {
    const hoursDropdown = await page.$('div:has-text("Abierto"), div:has-text("Cierre:"), [data-item-id*="oh"]');
    if (hoursDropdown) {
      console.log('Clicking hours dropdown...');
      await hoursDropdown.click();
      await page.waitForTimeout(2000);
    }
  } catch (e) {}

  const screenshotPath = '/Users/musa/.gemini/antigravity-ide/brain/6c969d92-6daa-4866-bb7c-c946cd825a56/scratch/maps_screenshot_expanded.png';
  await page.screenshot({ path: screenshotPath, fullPage: false });

  const bodyText = await page.evaluate(() => document.body.innerText);
  fs.writeFileSync('/Users/musa/.gemini/antigravity-ide/brain/6c969d92-6daa-4866-bb7c-c946cd825a56/scratch/maps_text_expanded.txt', bodyText);
  console.log('Maps expanded text saved!');

  await browser.close();
}

main().catch(console.error);
