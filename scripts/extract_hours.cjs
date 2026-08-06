const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'es-ES',
  });

  const page = await context.newPage();
  await page.goto('https://maps.app.goo.gl/2kHjqUHMUXyegViK8?g_st=ic', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  try {
    const acceptBtn = await page.$('button[aria-label*="Aceptar"], button:has-text("Aceptar todo")');
    if (acceptBtn) {
      await acceptBtn.click();
      await page.waitForTimeout(3000);
    }
  } catch (e) {}

  // Click on the hours element specifically
  const hoursBtn = await page.$('button[data-item-id*="oh"], [aria-label*="Abierto"], [aria-label*="horario"], button:has-text("Cierre:")');
  if (hoursBtn) {
    await hoursBtn.click();
    await page.waitForTimeout(2000);
  }

  const hoursData = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tr, [role="row"], table'));
    return rows.map(r => r.innerText).filter(t => t && t.length > 5);
  });

  console.log('HOURS EXTRACTED:', JSON.stringify(hoursData, null, 2));

  await browser.close();
}

main().catch(console.error);
