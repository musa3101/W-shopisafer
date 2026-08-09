import { chromium } from 'playwright';

const DEBUG_PORT = 9222;
const CDP_URL = `http://127.0.0.1:${DEBUG_PORT}`;

async function run() {
  try {
    const browser = await chromium.connectOverCDP(CDP_URL);
    const context = browser.contexts()[0] || await browser.newContext();
    const page = context.pages()[0] || await context.newPage();

    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1000));

    const checkResult = await page.evaluate(() => {
      const footerLogoImg = Array.from(document.querySelectorAll('footer img')).find(el => el.src.includes('logo-footer-square') || el.alt.includes('ISAFÉR'));
      if (!footerLogoImg) return { found: false };

      const parentDiv = footerLogoImg.parentElement;
      const parentStyle = window.getComputedStyle(parentDiv);
      const imgStyle = window.getComputedStyle(footerLogoImg);

      return {
        found: true,
        parentBg: parentStyle.backgroundColor,
        parentBorder: parentStyle.borderWidth + ' ' + parentStyle.borderColor,
        parentBorderRadius: parentStyle.borderRadius,
        imgMixBlendMode: imgStyle.mixBlendMode,
        imgWidth: imgStyle.width,
        imgHeight: imgStyle.height
      };
    });

    console.log('DOM Footer verification:', JSON.stringify(checkResult, null, 2));

    await browser.close();
  } catch (error) {
    console.error('Error verifying DOM footer:', error);
  }
}

run();
