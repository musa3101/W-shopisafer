import { chromium } from 'playwright';

const DEBUG_PORT = 9222;
const CDP_URL = `http://127.0.0.1:${DEBUG_PORT}`;

async function run() {
  try {
    const browser = await chromium.connectOverCDP(CDP_URL);
    const context = browser.contexts()[0] || await browser.newContext();
    const page = context.pages()[0] || await context.newPage();

    // Navigate to local server
    await page.goto('http://localhost:5173/', { waitUntil: 'load', timeout: 30000 });

    const color = await page.evaluate(async () => {
      // Find the footer image logo
      const img = Array.from(document.querySelectorAll('footer img')).find(el => el.src.includes('logo-footer-square') || el.alt.includes('ISAFÉR'));
      if (!img) throw new Error('Footer logo not found');

      // Create canvas to draw the image
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      // Sample at middle-left (y: height / 2, x: 10) to get the grey/beige background color
      const y = Math.floor(canvas.height / 2);
      const pixelData = ctx.getImageData(10, y, 1, 1).data;
      const rgb = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`;
      const hex = '#' + Array.from(pixelData.slice(0, 3)).map(x => x.toString(16).padStart(2, '0')).join('');

      return { rgb, hex };
    });

    console.log('Detected band color:', color);
    await browser.close();
  } catch (error) {
    console.error('Error getting image color:', error);
  }
}

run();
