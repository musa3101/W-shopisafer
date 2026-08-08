import { chromium } from 'playwright';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const DEBUG_PORT = 9222;
const CDP_URL = `http://127.0.0.1:${DEBUG_PORT}`;
const USER_DATA_DIR = '/Users/musa/Library/Application Support/Google/ChromeDev';
const SCREENSHOT_DIR = '/Users/musa/Downloads/sopisafer/carpeta de referencia/audit';

// Ensure screenshot dir exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function isChromeListening() {
  try {
    const res = await fetch(`${CDP_URL}/json/version`);
    if (res.ok) return true;
  } catch {}
  return false;
}

async function launchChromeRemote() {
  console.log('Chrome not running with debug. Launching...');
  if (!fs.existsSync(USER_DATA_DIR)) {
    fs.mkdirSync(USER_DATA_DIR, { recursive: true });
  }
  exec(`"${CHROME_PATH}" --remote-debugging-port=${DEBUG_PORT} --user-data-dir="${USER_DATA_DIR}" --no-first-run --no-default-browser-check > /dev/null 2>&1 &`);
  for (let i = 0; i < 10; i++) {
    await sleep(1000);
    if (await isChromeListening()) {
      console.log('Chrome launched and listening on port 9222!');
      return true;
    }
  }
  throw new Error('Failed to launch Chrome debug instance.');
}

async function screenshot(page, name) {
  const filepath = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: filepath, fullPage: false });
  console.log(`  📸 Screenshot saved: ${name}.png`);
  return filepath;
}

async function screenshotFull(page, name) {
  const filepath = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`  📸 Full-page screenshot saved: ${name}.png`);
  return filepath;
}

// ============================================================
// PART 1: CLIENT-FACING WEBSITE AUDIT
// ============================================================
async function auditClientWebsite(context) {
  const results = [];
  console.log('\n' + '='.repeat(60));
  console.log('🛍️  AUDITORÍA VISUAL: WEB DE CLIENTES');
  console.log('='.repeat(60));

  const page = await context.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  // 1. Homepage
  console.log('\n[1/8] Página de inicio...');
  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);
    const title = await page.title();
    console.log(`  ✓ Título: "${title}"`);
    await screenshot(page, '01_home_hero');

    // Check for console errors
    const consoleErrors = [];
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

    // Verify hero heading exists
    const heroText = await page.textContent('body');
    const hasHeroContent = heroText.includes('SENSUAL') || heroText.includes('Elegante') || heroText.includes('isafer');
    results.push({ test: 'Homepage Hero', status: hasHeroContent ? 'OK' : 'ISSUE', detail: hasHeroContent ? 'Hero content loads correctly' : 'Hero text missing' });
  } catch (err) {
    results.push({ test: 'Homepage Hero', status: 'ERROR', detail: err.message });
  }

  // 2. Scroll to catalog
  console.log('\n[2/8] Sección catálogo de prendas...');
  try {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
    await sleep(1500);
    await screenshot(page, '02_catalog_section');

    // Check product cards exist
    const productCards = await page.$$('[data-product-id], .group, article');
    console.log(`  ✓ Elementos tipo tarjeta/producto encontrados: ${productCards.length}`);
    results.push({ test: 'Catalog Section', status: productCards.length > 0 ? 'OK' : 'WARNING', detail: `${productCards.length} product elements found` });
  } catch (err) {
    results.push({ test: 'Catalog Section', status: 'ERROR', detail: err.message });
  }

  // 3. Product detail modal (Quick View)
  console.log('\n[3/8] Modal de producto (Quick View)...');
  try {
    // Scroll back to top first to find product cards
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(1000);
    
    // Scroll to products area
    const exploreBtn = await page.$('text=EXPLORE COLLECTION');
    if (exploreBtn) {
      await exploreBtn.click();
      await sleep(1500);
    } else {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight * 1.5));
      await sleep(1000);
    }

    // Try clicking on product image or card
    const firstProduct = await page.$('img[alt*="product"], img[loading="lazy"], .cursor-pointer img');
    if (firstProduct) {
      await firstProduct.click();
      await sleep(1500);
      await screenshot(page, '03_product_modal');
      
      // Check if modal opened
      const modalVisible = await page.$('[role="dialog"], .fixed.inset-0, [data-state="open"]');
      results.push({ test: 'Product Detail Modal', status: modalVisible ? 'OK' : 'WARNING', detail: modalVisible ? 'Modal opens on product click' : 'Modal selector not found but click processed' });

      // Close modal
      const closeBtn = await page.$('[role="dialog"] button, .fixed button:has(svg), button:has-text("✕")');
      if (closeBtn) await closeBtn.click();
      await sleep(500);
    } else {
      results.push({ test: 'Product Detail Modal', status: 'WARNING', detail: 'Could not locate product image to click' });
    }
  } catch (err) {
    results.push({ test: 'Product Detail Modal', status: 'ERROR', detail: err.message });
  }

  // 4. Shopping Cart (Bolsa)
  console.log('\n[4/8] Carrito de compra (Bolsa)...');
  try {
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(500);
    const cartBtn = await page.$('button:has-text("Bolsa"), [aria-label*="cart"], [aria-label*="bolsa"]');
    if (cartBtn) {
      await cartBtn.click();
      await sleep(1000);
      await screenshot(page, '04_cart_panel');
      results.push({ test: 'Cart Panel', status: 'OK', detail: 'Cart opens on click' });

      // Close cart
      const closeCartBtn = await page.$('.fixed button:has(svg)');
      if (closeCartBtn) await closeCartBtn.click();
      await sleep(500);
    } else {
      results.push({ test: 'Cart Panel', status: 'WARNING', detail: 'Cart button not found in header' });
    }
  } catch (err) {
    results.push({ test: 'Cart Panel', status: 'ERROR', detail: err.message });
  }

  // 5. Dark Mode Toggle
  console.log('\n[5/8] Toggle dark mode...');
  try {
    const darkToggle = await page.$('button[aria-label*="modo"], button[aria-label*="dark"], button[aria-label*="theme"], header button:has(svg.lucide-moon), header button:has(svg.lucide-sun)');
    if (darkToggle) {
      await darkToggle.click();
      await sleep(1000);
      await screenshot(page, '05_dark_mode');
      results.push({ test: 'Dark Mode Toggle', status: 'OK', detail: 'Dark mode toggled' });
      
      // Toggle back
      await darkToggle.click();
      await sleep(500);
    } else {
      // Try moon icon in nav area
      const moonBtn = await page.$('nav button svg, header button svg');
      results.push({ test: 'Dark Mode Toggle', status: 'WARNING', detail: 'Dark mode toggle button not found via selectors' });
    }
  } catch (err) {
    results.push({ test: 'Dark Mode Toggle', status: 'ERROR', detail: err.message });
  }

  // 6. Language Switcher
  console.log('\n[6/8] Selector de idioma...');
  try {
    const langBtn = await page.$('button:has-text("EN"), button:has-text("ES"), [data-lang]');
    if (langBtn) {
      const currentText = await langBtn.textContent();
      await langBtn.click();
      await sleep(1500);
      await screenshot(page, '06_language_switch');
      results.push({ test: 'Language Switcher', status: 'OK', detail: `Switched from ${currentText.trim()}` });
    } else {
      results.push({ test: 'Language Switcher', status: 'INFO', detail: 'Language selector not visible in header' });
    }
  } catch (err) {
    results.push({ test: 'Language Switcher', status: 'ERROR', detail: err.message });
  }

  // 7. Footer
  console.log('\n[7/8] Sección footer...');
  try {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await sleep(1500);
    await screenshot(page, '07_footer');
    
    const footerText = await page.textContent('footer');
    const hasFooter = footerText && (footerText.includes('isafer') || footerText.includes('Isafer') || footerText.includes('Brooklyn'));
    results.push({ test: 'Footer Section', status: hasFooter ? 'OK' : 'WARNING', detail: hasFooter ? 'Footer renders with brand content' : 'Footer text unclear' });
  } catch (err) {
    results.push({ test: 'Footer Section', status: 'ERROR', detail: err.message });
  }

  // 8. Login Page
  console.log('\n[8/8] Página de login de clientes...');
  try {
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle', timeout: 15000 });
    await sleep(1500);
    await screenshot(page, '08_login_page');

    const loginForm = await page.$('form, input[type="email"], input[type="password"]');
    results.push({ test: 'Login Page', status: loginForm ? 'OK' : 'WARNING', detail: loginForm ? 'Login form renders correctly' : 'Login form elements not found' });
  } catch (err) {
    results.push({ test: 'Login Page', status: 'ERROR', detail: err.message });
  }

  // Check for broken images
  console.log('\n[BONUS] Verificando imágenes rotas...');
  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 20000 });
    await sleep(2000);
    const brokenImages = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      const broken = [];
      images.forEach(img => {
        if (img.naturalWidth === 0 && img.src && !img.src.startsWith('data:')) {
          broken.push(img.src);
        }
      });
      return broken;
    });
    console.log(`  Imágenes rotas detectadas en DOM: ${brokenImages.length}`);
    if (brokenImages.length > 0) {
      console.log(`  URLs rotas: ${brokenImages.join(', ')}`);
    }
    results.push({ test: 'Broken Images Check', status: brokenImages.length === 0 ? 'OK' : 'ISSUE', detail: `${brokenImages.length} broken images` });
  } catch (err) {
    results.push({ test: 'Broken Images Check', status: 'ERROR', detail: err.message });
  }

  await page.close();
  return results;
}

// ============================================================
// PART 2: ADMIN DASHBOARD AUDIT
// ============================================================
async function auditAdminDashboard(context) {
  const results = [];
  console.log('\n' + '='.repeat(60));
  console.log('👑  AUDITORÍA VISUAL: DASHBOARD DE CAMILA (ADMIN)');
  console.log('='.repeat(60));

  const page = await context.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  // 1. Admin Login Page
  console.log('\n[1/7] Página de login admin...');
  try {
    await page.goto('http://localhost:5173/admin/login', { waitUntil: 'networkidle', timeout: 20000 });
    await sleep(2000);
    await screenshot(page, '09_admin_login');

    const loginInputs = await page.$$('input');
    results.push({ test: 'Admin Login Page', status: loginInputs.length >= 2 ? 'OK' : 'WARNING', detail: `${loginInputs.length} input fields found` });
  } catch (err) {
    results.push({ test: 'Admin Login Page', status: 'ERROR', detail: err.message });
  }

  // 2. Admin Dashboard (direct navigation - will redirect to login if not auth'd)
  console.log('\n[2/7] Dashboard principal (/admin)...');
  try {
    await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle', timeout: 20000 });
    await sleep(2000);
    await screenshot(page, '10_admin_dashboard');

    const currentUrl = page.url();
    if (currentUrl.includes('/admin/login')) {
      console.log('  ⚠️ Redirigido a login (no autenticado) - esto es comportamiento esperado');
      results.push({ test: 'Admin Dashboard Auth Guard', status: 'OK', detail: 'Redirects unauthenticated users to login (correct behavior)' });
    } else {
      const dashText = await page.textContent('body');
      const hasDashContent = dashText.includes('Dashboard') || dashText.includes('Resumen') || dashText.includes('Ingresos');
      results.push({ test: 'Admin Dashboard', status: hasDashContent ? 'OK' : 'WARNING', detail: hasDashContent ? 'Dashboard loads with metrics' : 'Dashboard content unclear' });
    }
  } catch (err) {
    results.push({ test: 'Admin Dashboard', status: 'ERROR', detail: err.message });
  }

  // 3. Catalogo Admin
  console.log('\n[3/7] Catálogo de prendas admin (/admin/catalogo)...');
  try {
    await page.goto('http://localhost:5173/admin/catalogo', { waitUntil: 'networkidle', timeout: 20000 });
    await sleep(2000);
    await screenshot(page, '11_admin_catalogo');

    const currentUrl = page.url();
    if (currentUrl.includes('/admin/login')) {
      results.push({ test: 'Admin Catalogo Auth Guard', status: 'OK', detail: 'Redirects to login (expected)' });
    } else {
      const bodyText = await page.textContent('body');
      const hasCatalog = bodyText.includes('Catálogo') || bodyText.includes('Producto') || bodyText.includes('Stock');
      results.push({ test: 'Admin Catálogo', status: hasCatalog ? 'OK' : 'WARNING', detail: hasCatalog ? 'Catalog page loads correctly' : 'Catalog content unclear' });
    }
  } catch (err) {
    results.push({ test: 'Admin Catálogo', status: 'ERROR', detail: err.message });
  }

  // 4. Pedidos Admin
  console.log('\n[4/7] Pedidos admin (/admin/pedidos)...');
  try {
    await page.goto('http://localhost:5173/admin/pedidos', { waitUntil: 'networkidle', timeout: 20000 });
    await sleep(2000);
    await screenshot(page, '12_admin_pedidos');

    const currentUrl = page.url();
    if (currentUrl.includes('/admin/login')) {
      results.push({ test: 'Admin Pedidos Auth Guard', status: 'OK', detail: 'Redirects to login (expected)' });
    } else {
      results.push({ test: 'Admin Pedidos', status: 'OK', detail: 'Orders page loads' });
    }
  } catch (err) {
    results.push({ test: 'Admin Pedidos', status: 'ERROR', detail: err.message });
  }

  // 5. Ajustes Admin
  console.log('\n[5/7] Ajustes admin (/admin/ajustes)...');
  try {
    await page.goto('http://localhost:5173/admin/ajustes', { waitUntil: 'networkidle', timeout: 20000 });
    await sleep(2000);
    await screenshot(page, '13_admin_ajustes');

    const currentUrl = page.url();
    if (currentUrl.includes('/admin/login')) {
      results.push({ test: 'Admin Ajustes Auth Guard', status: 'OK', detail: 'Redirects to login (expected)' });
    } else {
      results.push({ test: 'Admin Ajustes', status: 'OK', detail: 'Settings page loads' });
    }
  } catch (err) {
    results.push({ test: 'Admin Ajustes', status: 'ERROR', detail: err.message });
  }

  // 6. SSR check - do all pages return valid HTML?
  console.log('\n[6/7] Verificación SSR de todas las páginas...');
  const ssrPages = [
    { name: 'Home', path: '/' },
    { name: 'Login', path: '/login' },
    { name: 'Admin Login', path: '/admin/login' },
    { name: 'Admin Dashboard', path: '/admin' },
    { name: 'Admin Catalogo', path: '/admin/catalogo' },
    { name: 'Admin Pedidos', path: '/admin/pedidos' },
    { name: 'Admin Ajustes', path: '/admin/ajustes' },
  ];

  for (const p of ssrPages) {
    try {
      const res = await fetch(`http://localhost:5173${p.path}`);
      const status = res.status;
      console.log(`  ${p.name} (${p.path}): HTTP ${status}`);
      results.push({ test: `SSR ${p.name}`, status: status === 200 ? 'OK' : 'ISSUE', detail: `HTTP ${status}` });
    } catch (err) {
      results.push({ test: `SSR ${p.name}`, status: 'ERROR', detail: err.message });
    }
  }

  // 7. Check for JS errors in console on homepage
  console.log('\n[7/7] Captura de errores de consola JS...');
  try {
    const errPage = await context.newPage();
    const jsErrors = [];
    errPage.on('console', msg => {
      if (msg.type() === 'error') jsErrors.push(msg.text());
    });
    errPage.on('pageerror', err => jsErrors.push(err.message));

    await errPage.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 20000 });
    await sleep(3000);
    // Interact a bit
    await errPage.evaluate(() => window.scrollBy(0, 500));
    await sleep(1000);

    console.log(`  Errores JS capturados en consola: ${jsErrors.length}`);
    if (jsErrors.length > 0) {
      jsErrors.forEach((e, i) => console.log(`    [${i+1}] ${e.substring(0, 120)}`));
    }
    results.push({ test: 'JS Console Errors', status: jsErrors.length === 0 ? 'OK' : 'WARNING', detail: `${jsErrors.length} console error(s)${jsErrors.length > 0 ? ': ' + jsErrors[0].substring(0, 80) : ''}` });

    await errPage.close();
  } catch (err) {
    results.push({ test: 'JS Console Errors', status: 'ERROR', detail: err.message });
  }

  await page.close();
  return results;
}

// ============================================================
// MAIN
// ============================================================
async function run() {
  try {
    let connected = await isChromeListening();
    if (!connected) {
      connected = await launchChromeRemote();
    }

    console.log('Connecting Playwright to Chrome via CDP...');
    const browser = await chromium.connectOverCDP(CDP_URL);
    console.log('Connected successfully!');

    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      ignoreHTTPSErrors: true,
    });

    // Run both audits
    const clientResults = await auditClientWebsite(context);
    const adminResults = await auditAdminDashboard(context);

    const allResults = [...clientResults, ...adminResults];

    // ============================================================
    // FINAL REPORT
    // ============================================================
    console.log('\n' + '='.repeat(60));
    console.log('📊  REPORTE FINAL DE AUDITORÍA COMPLETA');
    console.log('='.repeat(60));

    const oks = allResults.filter(r => r.status === 'OK').length;
    const warnings = allResults.filter(r => r.status === 'WARNING' || r.status === 'INFO').length;
    const issues = allResults.filter(r => r.status === 'ISSUE').length;
    const errors = allResults.filter(r => r.status === 'ERROR').length;

    console.log(`\n  ✅ Pasaron (OK): ${oks}`);
    console.log(`  ⚠️  Advertencias: ${warnings}`);
    console.log(`  ❌ Problemas: ${issues}`);
    console.log(`  💥 Errores: ${errors}`);
    console.log(`  📋 Total tests: ${allResults.length}\n`);

    // Detail table
    console.log('  ' + '-'.repeat(56));
    for (const r of allResults) {
      const icon = r.status === 'OK' ? '✅' : r.status === 'WARNING' || r.status === 'INFO' ? '⚠️' : '❌';
      console.log(`  ${icon} ${r.test.padEnd(30)} ${r.detail}`);
    }
    console.log('  ' + '-'.repeat(56));

    const verdict = errors === 0 && issues === 0 ? '🎉 VEREDICTO: APROBADO ✓' : '⚠️ VEREDICTO: REQUIERE ATENCIÓN';
    console.log(`\n  ${verdict}\n`);

    // Save report as markdown
    const reportLines = [
      '# 🧪 Reporte de Auditoría Visual Completa — Isafer Boutique',
      `*Generado automáticamente el ${new Date().toLocaleString('es-ES')}*\n`,
      '## Resumen',
      `| Métrica | Cantidad |`,
      `|---|---|`,
      `| ✅ Tests pasados | ${oks} |`,
      `| ⚠️ Advertencias | ${warnings} |`,
      `| ❌ Problemas | ${issues} |`,
      `| 💥 Errores | ${errors} |`,
      `| 📋 Total | ${allResults.length} |\n`,
      '## Detalle de Tests\n',
      '### 🛍️ Web de Clientes\n',
      '| Test | Estado | Detalle |',
      '|---|---|---|',
      ...clientResults.map(r => `| ${r.test} | ${r.status === 'OK' ? '✅' : '⚠️'} ${r.status} | ${r.detail} |`),
      '',
      '### 👑 Dashboard Admin (Camila)\n',
      '| Test | Estado | Detalle |',
      '|---|---|---|',
      ...adminResults.map(r => `| ${r.test} | ${r.status === 'OK' ? '✅' : '⚠️'} ${r.status} | ${r.detail} |`),
      '',
      `## Veredicto Final\n`,
      verdict,
      '',
      '## Capturas de Pantalla',
      `Todas las capturas se han guardado en: \`carpeta de referencia/audit/\``,
    ];

    fs.writeFileSync('/Users/musa/Downloads/sopisafer/docs/VISUAL_AUDIT_REPORT.md', reportLines.join('\n'));
    console.log('📄 Reporte guardado en docs/VISUAL_AUDIT_REPORT.md');

    await context.close();
    await browser.close();

  } catch (error) {
    console.error('Error during audit:', error);
    process.exit(1);
  }
}

run();
