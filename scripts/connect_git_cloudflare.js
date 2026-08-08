import { chromium } from 'playwright';
import fs from 'fs';

const CDP_URL = 'http://127.0.0.1:9222';

async function run() {
  try {
    console.log('Conectando con Chrome via CDP...');
    const browser = await chromium.connectOverCDP(CDP_URL);
    const contexts = browser.contexts();
    const context = contexts[0] || (await browser.newContext());

    let pages = context.pages();
    console.log(`Páginas abiertas encontradas: ${pages.length}`);

    // Buscar la pestaña que tenga dash.cloudflare.com
    let cfPage = pages.find(p => p.url().includes('cloudflare.com'));
    if (!cfPage) {
      cfPage = pages[0] || (await context.newPage());
      await cfPage.goto('https://dash.cloudflare.com');
      await cfPage.waitForTimeout(3000);
    }

    console.log('Página actual:', cfPage.url());

    // Si ya está el modal abierto con la lista de repositorios
    const repoInput = cfPage.locator('input[placeholder*="Buscar"], input[aria-label*="Buscar"]').first();
    if (await repoInput.isVisible().catch(() => false)) {
      console.log('Buscando repositorio W-shopisafer en la lista de Cloudflare...');
      await repoInput.fill('W-shopisafer');
      await cfPage.waitForTimeout(1000);

      const itemWshop = cfPage.locator('text="W-shopisafer"').first();
      if (await itemWshop.isVisible().catch(() => false)) {
        await itemWshop.click();
        await cfPage.waitForTimeout(1000);
        console.log('Seleccionado repositorio W-shopisafer!');
      }
    }

    // Botón azul Conectar
    const connectBtn = cfPage.locator('button:has-text("Conectar")').first();
    if (await connectBtn.isVisible().catch(() => false)) {
      console.log('Haciendo clic en el botón Conectar...');
      await connectBtn.click();
      await cfPage.waitForTimeout(3000);
      console.log('¡Conexión completada exitosamente!');
    } else {
      console.log('Buscando botones de guardar o conectar...');
    }

    // Tomar captura de control
    const shotPath = '/Users/musa/Downloads/sopisafer/carpeta de referencia/cloudflare_git_connected.png';
    await cfPage.screenshot({ path: shotPath });
    console.log('Captura guardada en:', shotPath);

    await browser.close();
  } catch (err) {
    console.error('Error durante la automatización de Cloudflare Git:', err);
  }
}

run();
