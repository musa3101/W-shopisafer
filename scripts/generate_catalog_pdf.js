import { chromium } from 'playwright';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { createClient } from '@insforge/sdk';

const execAsync = promisify(exec);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const DEBUG_PORT = 9222;
const CDP_URL = `http://127.0.0.1:${DEBUG_PORT}`;
const USER_DATA_DIR = '/Users/musa/Library/Application Support/Google/ChromeDev';
const BASE_OUTPUT_DIR = '/Users/musa/Downloads/sopisafer/carpeta de referencia';

async function isChromeListening() {
  try {
    const res = await fetch(`${CDP_URL}/json/version`);
    if (res.ok) {
      const data = await res.json();
      console.log('Found Chrome listening on 9222. Version:', data.Browser);
      return true;
    }
  } catch (err) {
    // Not listening
  }
  return false;
}

async function launchChromeRemote() {
  console.log('Chrome is not running with remote debugging. Launching a new instance...');
  if (!fs.existsSync(USER_DATA_DIR)) {
    fs.mkdirSync(USER_DATA_DIR, { recursive: true });
  }

  const command = `"${CHROME_PATH}" --remote-debugging-port=${DEBUG_PORT} --user-data-dir="${USER_DATA_DIR}" --no-first-run --no-default-browser-check > /dev/null 2>&1 &`;
  console.log('Running launch command:', command);
  exec(command);

  for (let i = 0; i < 10; i++) {
    await sleep(1000);
    if (await isChromeListening()) {
      console.log('Chrome debug instance successfully launched!');
      return true;
    }
    console.log(`Waiting for Chrome to listen on port ${DEBUG_PORT}... (${i + 1}/10)`);
  }
  throw new Error('Failed to launch and connect to Chrome.');
}

async function main() {
  try {
    // 1. Asegurar que existe la carpeta de salida
    if (!fs.existsSync(BASE_OUTPUT_DIR)) {
      fs.mkdirSync(BASE_OUTPUT_DIR, { recursive: true });
    }

    // 2. Cargar los productos directamente desde la base de datos de InsForge
    const baseUrl = 'https://i5jqzbx6.us-east.insforge.app';
    const anonKey = 'anon_222bdcf4c41d9b468d8e68a8d7492f49751b42070a2ff5e74dcba8b815dfa71b';
    const insforge = createClient({ baseUrl, anonKey });

    console.log('Fetching latest products from database...');
    const { data: rawProducts, error: dbError } = await insforge.database
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (dbError) {
      throw new Error(`Error al consultar base de datos de InsForge: ${dbError.message}`);
    }

    console.log(`Loaded ${rawProducts.length} products for PDF generation.`);

    // 3. Agrupar productos por categoría
    // Lógica idéntica al frontend de la tienda
    const categories = {
      'Vestidos': [],
      'Licras': [],
      'Bodys & Corsets': [],
      'Accesorios & Glam': [],
      'Tops & Sets': []
    };

    rawProducts.forEach(bp => {
      let category = "Tops & Sets";
      const nameLower = bp.name.toLowerCase();
      if (nameLower.includes("vestido") || nameLower.includes("gown") || nameLower.includes("skirt")) {
        category = "Vestidos";
      } else if (nameLower.includes("licra") || nameLower.includes("jumpsuit") || nameLower.includes("athletic") || nameLower.includes("biker")) {
        category = "Licras";
      } else if (nameLower.includes("body")) {
        category = "Bodys & Corsets";
      } else if (nameLower.includes("bolso") || nameLower.includes("cinturón") || nameLower.includes("accesorios")) {
        category = "Accesorios & Glam";
      }
      categories[category].push(bp);
    });

    console.log('Product categorization:');
    for (const [cat, prods] of Object.entries(categories)) {
      console.log(`- ${cat}: ${prods.length} products`);
    }

    // Número de teléfono centralizado
    const OWNER_PHONE = '346673109486';

    // 4. Generar el contenido HTML
    // Usaremos rutas absolutas locales file:// para los assets locales
    const assetsDir = '/Users/musa/Downloads/sopisafer/src/assets';
    const logoHeaderPath = `file://${assetsDir}/logo-header-barbie.png`;
    const logoFooterPath = `file://${assetsDir}/logo-footer-chic.png`;
    const coverImagePath = `file://${assetsDir}/rosse-hero.jpg`;

    let htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Catálogo Isafer Boutique 2026</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Google Fonts: Playfair Display (Serif) y Outfit (Sans-Serif) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Outfit:wght@200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: 'Outfit', sans-serif;
      background-color: #f7f7f7;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      width: 210mm;
      height: 297mm;
      box-sizing: border-box;
      position: relative;
      background-color: #fffdfc;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 20mm 20mm;
      page-break-after: always;
      break-after: page;
    }
    .cover-page {
      padding: 0 !important;
      background: linear-gradient(180deg, #fffafc 0%, #fff3f6 100%);
    }
    .back-cover-page {
      padding: 0 !important;
      background: #111111;
      color: #ffffff;
    }
    .font-serif-luxury {
      font-family: 'Playfair Display', serif;
    }
  </style>
</head>
<body>

  <!-- ================= PÁGINA 1: PORTADA ================= -->
  <div class="page cover-page flex flex-col justify-between items-center text-center">
    <div class="pt-24 flex flex-col items-center">
      <!-- Badge de Colección -->
      <span class="text-[11px] tracking-[0.3em] font-extrabold text-rose-600 uppercase mb-4 bg-rose-100/60 px-4 py-1.5 rounded-full">Nueva Colección 2026</span>
      <!-- Logotipo -->
      <img src="${logoHeaderPath}" alt="ISAFÉR BOUTIQUE" class="h-16 w-auto object-contain mb-2" />
      <span class="text-[10px] tracking-[0.4em] text-zinc-500 uppercase font-light">Brooklyn, New York</span>
    </div>

    <!-- Imagen de Portada -->
    <div class="w-72 h-96 relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/80 my-8">
      <img src="${coverImagePath}" alt="Isafer Hero" class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-t from-rose-950/20 to-transparent"></div>
    </div>

    <div class="pb-24 flex flex-col items-center px-8">
      <h1 class="font-serif-luxury text-3xl font-medium tracking-wide text-zinc-800 mb-2">CATÁLOGO EXCLUSIVO</h1>
      <p class="text-zinc-500 text-xs tracking-wider max-w-sm font-light">Sexy, Elegante y Moldeadora. Descubre las piezas diseñadas para acentuar tu figura con estilo premium.</p>
      <div class="w-12 h-0.5 bg-rose-400 mt-6"></div>
    </div>
  </div>

  <!-- ================= PÁGINA 2: INTRODUCCIÓN E ÍNDICE ================= -->
  <div class="page flex flex-col justify-between">
    <!-- Header -->
    <div class="flex justify-between items-center border-b border-rose-100 pb-3">
      <span class="text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-500">ISAFÉR BOUTIQUE · BROOKLYN</span>
      <span class="text-[11px] font-serif-luxury italic text-rose-600">Catálogo de Productos 2026</span>
    </div>

    <!-- Contenido -->
    <div class="flex-grow flex flex-col justify-center py-10 px-4">
      <div class="mb-12">
        <h2 class="font-serif-luxury text-3xl text-zinc-800 mb-6">La Esencia de Isafér</h2>
        <p class="text-zinc-600 text-sm leading-relaxed font-light mb-4">
          En <strong>Isafér Boutique</strong>, creemos que la moda no es solo lo que vistes, sino cómo te hace sentir. Nuestra colección está diseñada para celebrar tu silueta, realzando tus curvas naturales con nuestras licras de compresión inteligente de alta calidad.
        </p>
        <p class="text-zinc-600 text-sm leading-relaxed font-light">
          Cada prenda es elegida con pasión para acompañarte en tus momentos especiales, haciéndote sentir sensual, elegante y segura. Gracias por dejarnos ser parte de tu estilo y tu día a día.
        </p>
        <div class="flex items-center gap-3 mt-6">
          <div class="w-8 h-8 rounded-full border border-rose-200 overflow-hidden bg-rose-50 flex items-center justify-center">
            <span class="text-[10px] font-bold text-rose-600">C</span>
          </div>
          <span class="text-xs font-semibold text-zinc-800">Camila — <span class="text-rose-500 font-light italic">Fundadora</span></span>
        </div>
      </div>

      <div>
        <h3 class="text-xs uppercase tracking-[0.2em] font-black text-rose-600 mb-6 border-b border-rose-100 pb-2">Índice del Catálogo</h3>
        <ul class="space-y-4 text-sm text-zinc-700">
          <li class="flex justify-between items-center border-b border-dashed border-zinc-200 pb-2">
            <span class="font-medium">1. Vestidos & Conjuntos Elegantes</span>
            <span class="text-rose-600 font-bold font-serif-luxury">Pág. 3 - 4</span>
          </li>
          <li class="flex justify-between items-center border-b border-dashed border-zinc-200 pb-2">
            <span class="font-medium">2. Licras & Monos de Compresión</span>
            <span class="text-rose-600 font-bold font-serif-luxury">Pág. 5</span>
          </li>
          <li class="flex justify-between items-center border-b border-dashed border-zinc-200 pb-2">
            <span class="font-medium">3. Bodys & Corsets Moldeadores</span>
            <span class="text-rose-600 font-bold font-serif-luxury">Pág. 5</span>
          </li>
          <li class="flex justify-between items-center border-b border-dashed border-zinc-200 pb-2">
            <span class="font-medium">4. Tops & Sets de Dos Piezas</span>
            <span class="text-rose-600 font-bold font-serif-luxury">Pág. 6</span>
          </li>
          <li class="flex justify-between items-center border-b border-dashed border-zinc-200 pb-2">
            <span class="font-medium">5. Accesorios & Complementos Glam</span>
            <span class="text-rose-600 font-bold font-serif-luxury">Pág. 6</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Footer -->
    <div class="flex justify-between items-center border-t border-rose-100 pt-3">
      <span class="text-[10px] text-zinc-400">Escríbenos por WhatsApp: +${OWNER_PHONE}</span>
      <span class="text-[10px] font-medium text-zinc-500">Pág. 2</span>
    </div>
  </div>

  <!-- ================= PÁGINA 3: VESTIDOS (1/2) ================= -->
  <div class="page flex flex-col justify-between">
    <!-- Header -->
    <div class="flex justify-between items-center border-b border-rose-100 pb-3">
      <span class="text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-500">1. VESTIDOS & CONJUNTOS ELEGANTES</span>
      <span class="text-[11px] font-serif-luxury italic text-rose-600">Catálogo 2026</span>
    </div>

    <!-- Grid de productos -->
    <div class="grid grid-cols-2 gap-x-8 gap-y-8 flex-grow py-6">
      ${renderProductCard(categories['Vestidos'][0], OWNER_PHONE)}
      ${renderProductCard(categories['Vestidos'][1], OWNER_PHONE)}
      ${renderProductCard(categories['Vestidos'][2], OWNER_PHONE)}
      ${renderProductCard(categories['Vestidos'][3], OWNER_PHONE)}
    </div>

    <!-- Footer -->
    <div class="flex justify-between items-center border-t border-rose-100 pt-3">
      <span class="text-[10px] text-zinc-400">Haz clic en cualquier prenda para pedirla por WhatsApp</span>
      <span class="text-[10px] font-medium text-zinc-500">Pág. 3</span>
    </div>
  </div>

  <!-- ================= PÁGINA 4: VESTIDOS (2/2) + PROMO CARD ================= -->
  <div class="page flex flex-col justify-between">
    <!-- Header -->
    <div class="flex justify-between items-center border-b border-rose-100 pb-3">
      <span class="text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-500">1. VESTIDOS & CONJUNTOS ELEGANTES</span>
      <span class="text-[11px] font-serif-luxury italic text-rose-600">Catálogo 2026</span>
    </div>

    <!-- Grid de productos -->
    <div class="grid grid-cols-2 gap-x-8 gap-y-8 flex-grow py-6">
      ${renderProductCard(categories['Vestidos'][4], OWNER_PHONE)}
      ${renderProductCard(categories['Vestidos'][5], OWNER_PHONE)}
      ${renderProductCard(categories['Vestidos'][6], OWNER_PHONE)}
      
      <!-- Promo Box Estilizada en lugar de 4to producto -->
      <div class="bg-gradient-to-br from-rose-50/60 to-rose-100/30 rounded-2xl p-6 border border-rose-100 flex flex-col justify-between h-full shadow-sm">
        <div class="flex flex-col">
          <span class="text-[9px] uppercase tracking-widest text-rose-600 font-extrabold mb-4 bg-white/80 px-3 py-1 rounded-full self-start shadow-xs">Filosofía Isafér</span>
          <p class="font-serif-luxury text-lg text-zinc-700 italic leading-relaxed">
            "La belleza comienza en el momento en que decides ser tú misma, y tu outfit es el reflejo de esa seguridad."
          </p>
        </div>
        <div class="flex items-center gap-2 mt-4">
          <div class="h-0.5 w-8 bg-rose-300"></div>
          <span class="text-[10px] tracking-widest text-zinc-500 uppercase font-medium">Isafer Boutique</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="flex justify-between items-center border-t border-rose-100 pt-3">
      <span class="text-[10px] text-zinc-400">Haz clic en cualquier prenda para pedirla por WhatsApp</span>
      <span class="text-[10px] font-medium text-zinc-500">Pág. 4</span>
    </div>
  </div>

  <!-- ================= PÁGINA 5: LICRAS & BODYS ================= -->
  <div class="page flex flex-col justify-between">
    <!-- Header -->
    <div class="flex justify-between items-center border-b border-rose-100 pb-3">
      <span class="text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-500">2. LICRAS & 3. BODYS DE COMPRESIÓN</span>
      <span class="text-[11px] font-serif-luxury italic text-rose-600">Catálogo 2026</span>
    </div>

    <!-- Grid de productos -->
    <div class="grid grid-cols-2 gap-x-8 gap-y-8 flex-grow py-6">
      ${renderProductCard(categories['Licras'][0], OWNER_PHONE, 'Licra Moldeadora')}
      ${renderProductCard(categories['Licras'][1], OWNER_PHONE, 'Licra Moldeadora')}
      ${renderProductCard(categories['Bodys & Corsets'][0], OWNER_PHONE, 'Body / Corset')}
      ${renderProductCard(categories['Bodys & Corsets'][1], OWNER_PHONE, 'Body / Corset')}
    </div>

    <!-- Footer -->
    <div class="flex justify-between items-center border-t border-rose-100 pt-3">
      <span class="text-[10px] text-zinc-400">Compresión inteligente y soporte para moldear tu figura.</span>
      <span class="text-[10px] font-medium text-zinc-500">Pág. 5</span>
    </div>
  </div>

  <!-- ================= PÁGINA 6: TOPS, SETS & ACCESORIOS ================= -->
  <div class="page flex flex-col justify-between">
    <!-- Header -->
    <div class="flex justify-between items-center border-b border-rose-100 pb-3">
      <span class="text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-500">4. TOPS, SETS & 5. ACCESORIOS</span>
      <span class="text-[11px] font-serif-luxury italic text-rose-600">Catálogo 2026</span>
    </div>

    <!-- Grid de productos -->
    <div class="grid grid-cols-2 gap-x-8 gap-y-8 flex-grow py-6">
      ${renderProductCard(categories['Tops & Sets'][0], OWNER_PHONE, 'Set / Crop Top')}
      ${renderProductCard(categories['Tops & Sets'][1], OWNER_PHONE, 'Set / Crop Top')}
      ${renderProductCard(categories['Tops & Sets'][2], OWNER_PHONE, 'Set / Crop Top')}
      ${renderProductCard(categories['Accesorios & Glam'][0], OWNER_PHONE, 'Accesorio Premium')}
    </div>

    <!-- Footer -->
    <div class="flex justify-between items-center border-t border-rose-100 pt-3">
      <span class="text-[10px] text-zinc-400">Combina y completa tu outfit ideal con nuestras prendas y accesorios.</span>
      <span class="text-[10px] font-medium text-zinc-500">Pág. 6</span>
    </div>
  </div>

  <!-- ================= PÁGINA 7: CONTRA PORTADA (CONTACTO) ================= -->
  <div class="page back-cover-page flex flex-col justify-between items-center text-center p-12">
    <!-- Decoración Superior -->
    <div class="w-16 h-1 bg-rose-500 mt-20"></div>

    <div class="flex flex-col items-center">
      <!-- Logo Circular Footer -->
      <div class="w-24 h-24 rounded-full p-2 border-2 border-rose-500 bg-zinc-950 overflow-hidden flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(244,63,94,0.4)]">
        <img src="${logoFooterPath}" alt="ISAFÉR BOUTIQUE" class="w-full h-full object-cover rounded-full" />
      </div>

      <h2 class="font-serif-luxury text-3xl font-bold tracking-widest text-white mb-2">ISAFÉR BOUTIQUE</h2>
      <p class="text-rose-500 text-xs tracking-[0.3em] font-semibold uppercase mb-8">Sexy, Elegante y Moldeadora</p>
      
      <div class="space-y-6 max-w-sm">
        <div>
          <h3 class="text-[10px] tracking-widest uppercase font-bold text-zinc-400 mb-2">Cómo realizar tu Pedido</h3>
          <p class="text-zinc-300 text-xs leading-relaxed font-light">
            Haz clic en el enlace de cualquier producto en este PDF para abrir WhatsApp con un mensaje personalizado. También puedes escribirnos directamente indicando la prenda de tu preferencia.
          </p>
        </div>

        <div class="h-px bg-zinc-800 w-1/2 mx-auto"></div>

        <div class="space-y-3">
          <a href="https://wa.me/${OWNER_PHONE}" class="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-6 rounded-full text-xs shadow-md transition-colors w-64 mx-auto">
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 001.37 5.016L2 22l5.13-1.346a9.92 9.92 0 004.882 1.28h.005c5.507 0 9.99-4.478 9.99-9.985 0-2.667-1.04-5.176-2.929-7.062A9.924 9.924 0 0012.012 2zm5.79 13.918c-.318.9-1.572 1.637-2.185 1.708-.544.062-1.25.105-3.69-.885-3.123-1.267-5.115-4.412-5.27-4.62-.153-.207-1.246-1.638-1.246-3.128 0-1.49.778-2.22 1.056-2.522.28-.302.61-.378.815-.378H8.5c.162 0 .385.06.59.553.208.502.71 1.71.77 1.836.062.126.104.272.02.44-.083.17-.125.276-.25.424-.126.147-.265.33-.377.443-.127.126-.26.262-.112.515.147.25.656 1.072 1.408 1.737.97.857 1.782 1.123 2.036 1.25.253.125.402.103.553-.07.15-.175.657-.756.833-1.014.177-.257.354-.216.598-.126.244.09 1.545.717 1.81.848.267.13.444.197.51.312.067.115.067.668-.25 1.568z"/></svg>
            Chatear en WhatsApp
          </a>
          <p class="text-[10px] text-zinc-500 font-light">Teléfono oficial: +${OWNER_PHONE}</p>
        </div>
      </div>
    </div>

    <!-- Footer Copyright -->
    <div class="pb-16 text-center space-y-2">
      <p class="text-[10px] tracking-wider text-zinc-500 uppercase font-light">© 2026 Isafer Boutique. Todos los derechos reservados.</p>
      <p class="text-[9px] text-zinc-600">Brooklyn, NY · Creado por <span class="text-rose-500 font-bold">MYNEXT</span></p>
    </div>
  </div>

</body>
</html>
    `;

    // 5. Guardar el HTML temporal
    const tempHtmlPath = path.join('/Users/musa/Downloads/sopisafer/scripts', 'catalog_preview.html');
    fs.writeFileSync(tempHtmlPath, htmlContent, 'utf8');
    console.log(`Generated template HTML at: ${tempHtmlPath}`);

    // 6. Conectar a Chrome y procesar el PDF
    let connected = await isChromeListening();
    if (!connected) {
      connected = await launchChromeRemote();
    }

    console.log('Connecting Playwright to Chrome via CDP...');
    const browser = await chromium.connectOverCDP(CDP_URL);
    console.log('Connected to Chrome debug session!');

    const desktopContext = await browser.newContext({
      viewport: { width: 1200, height: 1700 }, // Aspect ratio similar a A4
      deviceScaleFactor: 2, // Mayor densidad para mejores capturas
    });
    
    const page = await desktopContext.newPage();
    console.log(`Opening catalog HTML file in Chrome...`);
    await page.goto(`file://${tempHtmlPath}`, { waitUntil: 'networkidle', timeout: 60000 });
    
    console.log('Waiting additional 6 seconds for Google Fonts and network images to fully render...');
    await sleep(6000);

    // 7. Generar el PDF final
    const pdfOutputPath = path.join(BASE_OUTPUT_DIR, 'catalogo_productos.pdf');
    console.log(`Generating PDF: ${pdfOutputPath}`);
    await page.pdf({
      path: pdfOutputPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '0px', bottom: '0px', left: '0px', right: '0px' }
    });
    console.log('✓ PDF catalog generated successfully!');

    // 8. Tomar capturas de cada página individual .page para la carpeta de referencia (Previsualizaciones del cliente)
    console.log('Taking high-resolution PNG page screenshots for user reference folder...');
    const pageLocators = page.locator('.page');
    const pageCount = await pageLocators.count();
    console.log(`Found ${pageCount} catalog pages to capture.`);

    for (let i = 0; i < pageCount; i++) {
      const pageSelector = pageLocators.nth(i);
      const imgPath = path.join(BASE_OUTPUT_DIR, `catalogo_pagina_${i + 1}.png`);
      console.log(`- Capture page ${i + 1} of ${pageCount} to ${imgPath}`);
      await pageSelector.screenshot({ path: imgPath });
    }

    // 9. Limpieza
    await desktopContext.close();
    await browser.close();
    console.log('✓ Done! All assets saved in: ', BASE_OUTPUT_DIR);

  } catch (err) {
    console.error('CRITICAL ERROR generating catalog PDF:', err);
    process.exit(1);
  }
}

// Función auxiliar para renderizar cada tarjeta de producto de forma dinámica
function renderProductCard(product, phone, displayCategory = '') {
  if (!product) {
    return `
      <!-- Card vacía (Reserva de diseño) -->
      <div class="border border-zinc-100/60 rounded-2xl aspect-[4/5] flex flex-col items-center justify-center p-8 bg-zinc-50/50">
        <span class="text-[10px] tracking-widest text-zinc-400 uppercase font-medium">Próximamente</span>
      </div>
    `;
  }

  const name = product.name || 'Prenda Exclusiva';
  const desc = product.description || 'Prenda de alta calidad con ajuste perfecto para realzar tu silueta.';
  const price = Number(product.price).toFixed(2);
  const badge = product.badge || 'Destacado';
  const imageUrl = product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80';
  const displayCat = displayCategory || 'Colección Exclusiva';

  // Codificar mensaje de WhatsApp dinámico para el enlace directo
  const messageText = `Hola Isafer Boutique, vi el producto "${name}" en el catálogo PDF y me gustaría consultar disponibilidad en talla y método de envío. 💖`;
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(messageText)}`;

  return `
    <a href="${whatsappUrl}" target="_blank" class="flex flex-col h-full bg-white rounded-2xl border border-zinc-100 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 group block cursor-pointer text-current no-underline">
      <!-- Contenedor de Imagen -->
      <div class="relative aspect-[4/5] bg-zinc-50 overflow-hidden shrink-0">
        <img src="${imageUrl}" alt="${name}" class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out" />
        <!-- Badge Superior Izquierdo -->
        <span class="absolute top-3 left-3 bg-rose-600 text-white text-[8px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm z-10">${badge}</span>
      </div>
      <!-- Info del Producto -->
      <div class="p-4 flex flex-col justify-between flex-grow">
        <div>
          <!-- Categoría chica -->
          <span class="text-[8px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">${displayCat}</span>
          <!-- Nombre -->
          <h3 class="font-serif-luxury text-sm font-semibold text-zinc-800 tracking-wide line-clamp-1 leading-snug group-hover:text-rose-600 transition-colors">${name}</h3>
          <!-- Descripción -->
          <p class="text-[10px] text-zinc-400 font-light mt-1.5 leading-relaxed line-clamp-2">${desc}</p>
        </div>
        
        <!-- Pie de tarjeta: Precio, Tallas y Disponibilidad -->
        <div class="mt-4 pt-3 border-t border-zinc-100 flex flex-col gap-2">
          <div class="flex justify-between items-center">
            <span class="text-[9px] text-zinc-400">Tallas: S / M / L</span>
            <span class="text-sm font-black text-rose-600 font-serif-luxury">$${price} USD</span>
          </div>
          <!-- Botón de Acción simulado -->
          <div class="flex items-center justify-center gap-1.5 w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg py-1.5 transition-colors mt-1">
            <svg class="w-3 h-3 fill-current text-emerald-600" viewBox="0 0 24 24"><path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 001.37 5.016L2 22l5.13-1.346a9.92 9.92 0 004.882 1.28h.005c5.507 0 9.99-4.478 9.99-9.985 0-2.667-1.04-5.176-2.929-7.062A9.924 9.924 0 0012.012 2zm5.79 13.918c-.318.9-1.572 1.637-2.185 1.708-.544.062-1.25.105-3.69-.885-3.123-1.267-5.115-4.412-5.27-4.62-.153-.207-1.246-1.638-1.246-3.128 0-1.49.778-2.22 1.056-2.522.28-.302.61-.378.815-.378H8.5c.162 0 .385.06.59.553.208.502.71 1.71.77 1.836.062.126.104.272.02.44-.083.17-.125.276-.25.424-.126.147-.265.33-.377.443-.127.126-.26.262-.112.515.147.25.656 1.072 1.408 1.737.97.857 1.782 1.123 2.036 1.25.253.125.402.103.553-.07.15-.175.657-.756.833-1.014.177-.257.354-.216.598-.126.244.09 1.545.717 1.81.848.267.13.444.197.51.312.067.115.067.668-.25 1.568z"/></svg>
            <span class="text-[9px] font-bold">Consultar por WhatsApp</span>
          </div>
        </div>
      </div>
    </a>
  `;
}

main();
