const { chromium } = require('playwright');
const path = require('path');

async function main() {
  const outputDir = '/Users/musa/.gemini/antigravity-ide/brain/6c969d92-6daa-4866-bb7c-c946cd825a56/scratch';
  console.log('Launching Chromium...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  // TikTok
  console.log('Navigating to TikTok...');
  const page1 = await context.newPage();
  try {
    await page1.goto('https://www.tiktok.com/@shop_isafer1', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page1.waitForTimeout(3000);
    await page1.screenshot({ path: path.join(outputDir, 'tiktok_screenshot.png'), fullPage: false });
    console.log('TikTok screenshot saved successfully!');
  } catch (err) {
    console.error('TikTok error:', err.message);
  }

  // Instagram
  console.log('Navigating to Instagram...');
  const page2 = await context.newPage();
  try {
    await page2.goto('https://www.instagram.com/shopisafer', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page2.waitForTimeout(3000);
    await page2.screenshot({ path: path.join(outputDir, 'instagram_screenshot.png'), fullPage: false });
    console.log('Instagram screenshot saved successfully!');
  } catch (err) {
    console.error('Instagram error:', err.message);
  }

  await browser.close();
}

main().catch(console.error);
