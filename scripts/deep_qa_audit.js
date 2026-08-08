import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5173';
const REPORT_DIR = '/Users/musa/Downloads/sopisafer/carpeta de referencia/qa_report';

if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

const issues = [];

function recordIssue({ id, component, summary, steps, expected, actual, severity }) {
  issues.push({ id, component, summary, steps, expected, actual, severity });
  console.log(`\n❌ [${severity}] ${id} (${component}): ${summary}`);
  console.log(`   Pasos: ${steps}`);
  console.log(`   Esperado: ${expected}`);
  console.log(`   Obtenido: ${actual}\n`);
}

async function runAudit() {
  console.log('🚀 Iniciando Auditoría QA Exhaustiva de Isafer Boutique...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const consoleLogs = [];
  const networkErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleLogs.push(msg.text());
    }
  });

  page.on('response', res => {
    if (res.status() >= 400) {
      networkErrors.push({ url: res.url(), status: res.status() });
    }
  });

  // 1. CARGA INICIAL Y HOME
  console.log('\n--- 1. Probando Homepage y Carga ---');
  await page.goto(BASE_URL);
  await page.waitForTimeout(3500); // Esperar InitialLoader

  // Ver si el loader bloquea la pantalla demasiado tiempo o parpadea
  const loaderStillVisible = await page.locator('.isafer-loader-wrapper').isVisible().catch(() => false);
  // Esperar que la gestión de imágenes de React procese fallback de onError
  await page.waitForTimeout(2500);

  // Comprobar imágenes rotas
  const images = await page.$$eval('img', imgs => 
    imgs.map(img => ({ src: img.src, alt: img.alt, complete: img.complete, naturalWidth: img.naturalWidth }))
  );
  
  const brokenImages = images.filter(img => !img.complete || img.naturalWidth === 0);
  if (brokenImages.length > 0) {
    recordIssue({
      id: 'BUG-002',
      component: 'Imágenes / Assets',
      summary: `${brokenImages.length} imágenes rotas detectadas en la Homepage`,
      steps: '1. Cargar la homepage\n2. Inspeccionar elementos <img> cargados',
      expected: 'Todas las imágenes deben cargar correctamente con naturalWidth > 0',
      actual: `Imágenes rotas: ${brokenImages.map(i => i.src).slice(0, 3).join(', ')}`,
      severity: 'Alta'
    });
  }

  // Imágenes sin alt
  const missingAlt = images.filter(img => !img.alt || img.alt.trim() === '');
  if (missingAlt.length > 0) {
    recordIssue({
      id: 'BUG-003',
      component: 'Accesibilidad / SEO',
      summary: `${missingAlt.length} imágenes carecen de atributo alt descriptivo`,
      steps: '1. Inspeccionar el HTML de las imágenes',
      expected: 'Todas las imágenes contienen un alt descriptivo',
      actual: `${missingAlt.length} imágenes tienen alt vacío`,
      severity: 'Baja'
    });
  }

  // 2. HERO CTA
  console.log('\n--- 2. Probando Hero CTA ---');
  const heroCta = page.locator('a:has-text("EXPLORAR")').first();
  if (await heroCta.isVisible().catch(() => false)) {
    await heroCta.click();
    await page.waitForTimeout(1000);
    const scrollY = await page.evaluate(() => window.scrollY);
    if (scrollY < 50) {
      recordIssue({
        id: 'BUG-004',
        component: 'Hero CTA',
        summary: 'El botón CTA "Explorar Colección" no desplaza suavemente al catálogo',
        steps: '1. Cargar Homepage\n2. Hacer click en el botón "EXPLORAR COLECCIÓN ✦"',
        expected: 'Scroll a la sección #coleccion',
        actual: `Posición scrollY tras click: ${scrollY}px`,
        severity: 'Media'
      });
    }
  }

  // 3. CARRITO DE COMPRAS
  console.log('\n--- 3. Probando Carrito de Compras ---');
  const cartBtn = page.locator('header button').filter({ has: page.locator('svg.lucide-shopping-bag') }).first();
  if (await cartBtn.isVisible().catch(() => false)) {
    await cartBtn.click();
    await page.waitForTimeout(800);

    const cartSheet = page.locator('[role="dialog"]');
    const isCartVisible = await cartSheet.isVisible().catch(() => false);
    if (isCartVisible) {
      const emptyCartBtn = cartSheet.locator('button:has-text("Explorar Colección")');
      if (await emptyCartBtn.isVisible().catch(() => false)) {
        await emptyCartBtn.click();
        await page.waitForTimeout(500);
        const isOpenAfterClick = await cartSheet.isVisible().catch(() => false);
        if (isOpenAfterClick) {
          recordIssue({
            id: 'BUG-007',
            component: 'Carrito Vacío',
            summary: 'El botón "Explorar Colección" dentro del carrito vacío no cierra el modal',
            steps: '1. Abrir carrito vacío\n2. Hacer click en "Explorar Colección"',
            expected: 'El carrito se cierra y redirige/desplaza a productos',
            actual: 'El carrito permanece abierto sobre la pantalla',
            severity: 'Media'
          });
        }
      }
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
  }

  // 4. PRODUCT MODAL & AÑADIR AL CARRITO
  console.log('\n--- 4. Probando Selección de Producto y Añadir al Carrito ---');
  await page.evaluate(() => window.scrollTo(0, 1000));
  await page.waitForTimeout(1000);

  const firstProductCard = page.locator('article[class*="group"]').first();
  if (await firstProductCard.isVisible().catch(() => false)) {
    await firstProductCard.click();
    await page.waitForTimeout(1000);

    const productModal = page.locator('[role="dialog"]');
    if (!(await productModal.isVisible().catch(() => false))) {
      recordIssue({
        id: 'BUG-008',
        component: 'Modal Producto',
        summary: 'Al hacer click en la card de un producto no se abre el modal de detalles',
        steps: '1. Hacer click en la imagen/card de un producto en el catálogo',
        expected: 'Se abre el modal ProductDetailModal con información del producto',
        actual: 'No se abre ningún modal',
        severity: 'Alta'
      });
    } else {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
  }

  // 5. AUTH DIALOG & LOGIN ADMIN
  console.log('\n--- 5. Probando Autenticación y Modal Login ---');
  const userIconBtn = page.locator('header button').filter({ has: page.locator('svg.lucide-user') }).first();
  if (await userIconBtn.isVisible().catch(() => false)) {
    await userIconBtn.click();
    await page.waitForTimeout(800);

    const authDialog = page.locator('[role="dialog"]');
    if (await authDialog.isVisible().catch(() => false)) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
  }

  // 6. RUTA /admin/login
  console.log('\n--- 6. Probando Ruta /admin/login ---');
  await page.goto(`${BASE_URL}/admin/login`);
  await page.waitForTimeout(2000);

  const adminHeading = await page.textContent('body');
  if (!adminHeading.toLowerCase().includes('camila') && !adminHeading.toLowerCase().includes('accede') && !adminHeading.toLowerCase().includes('panel')) {
    recordIssue({
      id: 'BUG-010',
      component: 'Admin Route',
      summary: 'La ruta /admin/login no muestra el formulario de inicio de sesión de administrador esperado',
      steps: '1. Navegar a http://localhost:5173/admin/login',
      expected: 'Pantalla de Login de Administrador',
      actual: 'Contenido inesperado o pantalla en blanco',
      severity: 'Media'
    });
  }

  // 7. RESPONSIVE / MÓVIL
  console.log('\n--- 7. Probando Layout Móvil (375x667) ---');
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto(BASE_URL);
  await page.waitForTimeout(3000);

  // Verificar desbordamientos horizontales
  const hasHorizontalScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });

  if (hasHorizontalScroll) {
    recordIssue({
      id: 'BUG-011',
      component: 'Responsive / CSS',
      summary: 'Desbordamiento horizontal (overflow-x) detectado en vista móvil (375px)',
      steps: '1. Redimensionar viewport a 375px de ancho\n2. Inspeccionar scroll horizontal',
      expected: 'Sin scrollbar horizontal en dispositivos móviles',
      actual: 'Existe desbordamiento horizontal en el body/documento',
      severity: 'Media'
    });
  }

  // 8. ERRORES DE RED Y CONSOLA
  console.log('\n--- 8. Analizando Errores de Red y Consola ---');
  if (networkErrors.length > 0) {
    const error401 = networkErrors.filter(e => e.status === 401);
    const error404 = networkErrors.filter(e => e.status === 404);
    const error500 = networkErrors.filter(e => e.status >= 500);

    if (error401.length > 0) {
      recordIssue({
        id: 'BUG-012',
        component: 'Backend / Autenticación',
        summary: `Se detectaron respuestas HTTP 401 (No autorizado) en peticiones de fondo`,
        steps: '1. Abrir DevTools red\n2. Navegar por la app',
        expected: 'Sin peticiones 401 en flujos públicos',
        actual: `Peticiones 401 a: ${error401.map(e => e.url).join(', ')}`,
        severity: 'Baja'
      });
    }

    if (error404.length > 0) {
      recordIssue({
        id: 'BUG-013',
        component: 'Assets / API',
        summary: `Peticiones HTTP 404 (Recurso no encontrado)`,
        steps: '1. Cargar la app',
        expected: 'Todos los assets y endpoints devuelven HTTP 200',
        actual: `Recursos 404: ${error404.map(e => e.url).join(', ')}`,
        severity: 'Media'
      });
    }

    if (error500.length > 0) {
      recordIssue({
        id: 'BUG-014',
        component: 'Backend / Server Error',
        summary: `Errores HTTP 500 del servidor`,
        steps: '1. Interactuar con las funciones de InsForge/API',
        expected: 'Sin errores 500',
        actual: `Errores 500 en: ${error500.map(e => e.url).join(', ')}`,
        severity: 'Alta'
      });
    }
  }

  await browser.close();

  console.log('\n' + '='.repeat(60));
  console.log(`📋 AUDITORÍA QA COMPLETADA. Se encontraron ${issues.length} observaciones.`);
  console.log('='.repeat(60));

  // Guardar en JSON
  fs.writeFileSync(path.join(REPORT_DIR, 'issues.json'), JSON.stringify(issues, null, 2));
}

runAudit().catch(err => {
  console.error('Error durante la auditoría QA:', err);
  process.exit(1);
});
