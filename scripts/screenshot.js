import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  console.log("Capturing admin login...");
  await page.goto('http://localhost:5174/admin/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000); // give time for animations
  await page.screenshot({ path: 'public/screenshot-admin-login.png' });

  console.log("Capturing public login...");
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000); // give time for animations
  await page.screenshot({ path: 'public/screenshot-public-login.png' });

  console.log("Capturing admin dashboard...");
  // First we need to login to see the dashboard
  await page.goto('http://localhost:5174/admin/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="text"]', 'admin');
  await page.fill('input[type="password"]', 'admin');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000); // wait for redirect and render
  await page.screenshot({ path: 'public/screenshot-admin-dashboard.png' });

  await browser.close();
  console.log("Done!");
})();
