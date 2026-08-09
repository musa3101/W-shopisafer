import { chromium } from 'playwright';

const DEBUG_PORT = 9222;
const CDP_URL = `http://127.0.0.1:${DEBUG_PORT}`;

async function run() {
  try {
    console.log('Connecting Playwright to Chrome via CDP...');
    const browser = await chromium.connectOverCDP(CDP_URL);
    const context = browser.contexts()[0] || await browser.newContext();
    const page = context.pages()[0] || await context.newPage();

    // 1. Mobile Viewport Test (375x812)
    console.log('Testing Mobile Viewport (375x812)...');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));

    // Scroll to catalog section
    const catalogHeader = page.locator('#catalogo');
    if (await catalogHeader.isVisible()) {
      await catalogHeader.scrollIntoViewIfNeeded();
      await new Promise(r => setTimeout(r, 1000));
    }

    // Click "Añadir" on first catalog product
    console.log('Clicking mobile "Añadir" button...');
    const addButton = page.locator('[data-testid="add-to-cart-button-mobile"]').first();
    await addButton.click();
    await new Promise(r => setTimeout(r, 1000));

    // Check if QuickAddOverlay is visible
    const overlayStatus = await page.evaluate(() => {
      const overlay = document.querySelector('.animate-in');
      if (!overlay) return { visible: false };

      const buttons = Array.from(overlay.querySelectorAll('button'));
      return {
        visible: true,
        sizeCount: buttons.length,
        sizeTexts: buttons.map(b => b.textContent.trim())
      };
    });

    console.log('Mobile QuickAddOverlay status:', JSON.stringify(overlayStatus, null, 2));

    // Click on size "M" or first size button
    console.log('Clicking size button in overlay...');
    const sizeButton = page.locator('.animate-in button').nth(1); // second button (e.g. S or M)
    await sizeButton.click();
    await new Promise(r => setTimeout(r, 1500));

    // Verify cart drawer or toast opened
    const cartOpen = await page.evaluate(() => {
      const sheet = document.querySelector('[role="dialog"]');
      return !!sheet;
    });

    console.log('Cart drawer opened after size selection:', cartOpen);

    // 2. Desktop Viewport Test (1280x800)
    console.log('\nTesting Desktop Viewport (1280x800)...');
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));

    // Click on first product card in desktop
    const firstArticle = page.locator('article').first();
    await firstArticle.click();
    await new Promise(r => setTimeout(r, 1500));

    const desktopModalStatus = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return { open: false };
      const rect = dialog.getBoundingClientRect();
      return {
        open: true,
        width: rect.width,
        height: rect.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight
      };
    });

    console.log('Desktop Modal status:', JSON.stringify(desktopModalStatus, null, 2));

    await browser.close();
    console.log('All tests finished successfully!');
  } catch (error) {
    console.error('Error during test:', error);
    process.exit(1);
  }
}

run();
