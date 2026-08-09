import fs from 'fs';
// We can use a simple node script to read the image or parse it.
// Since it's a JPEG, we can use a library if installed, or we can just look at the hex values or write a small canvas script in page.evaluate!
// Yes, we can connect to Chrome via CDP and load the image in a canvas to get the exact pixel color! That's incredibly elegant and works without needing any npm packages.

import { chromium } from 'playwright';

const DEBUG_PORT = 9222;
const CDP_URL = `http://127.0.0.1:${DEBUG_PORT}`;

async function run() {
  try {
    const browser = await chromium.connectOverCDP(CDP_URL);
    const context = browser.contexts()[0] || await browser.newContext();
    const page = context.pages()[0] || await context.newPage();

    // Load a blank page and draw the image to canvas to get pixel color
    await page.goto('about:blank');
    const color = await page.evaluate(async () => {
      const img = new Image();
      img.src = 'http://localhost:5173/src/assets/logo-footer-square.jpg';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      // Get color from the middle-left (where the grey band is)
      const pixelData = ctx.getImageData(10, img.height / 2, 1, 1).data;
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
