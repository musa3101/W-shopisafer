import { chromium } from "playwright";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { createClient } from "@insforge/sdk";

const execAsync = promisify(exec);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const CHROME_PATH =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const DEBUG_PORT = 9222;
const CDP_URL = `http://127.0.0.1:${DEBUG_PORT}`;
const USER_DATA_DIR =
  "/Users/musa/Library/Application Support/Google/ChromeDev";
const BASE_OUTPUT_DIR = "/Users/musa/Downloads/sopisafer/carpeta de referencia";

async function isChromeListening() {
  try {
    const res = await fetch(`${CDP_URL}/json/version`);
    if (res.ok) {
      const data = await res.json();
      return true;
    }
  } catch (err) {
    // Not listening
  }
  return false;
}

async function launchChromeRemote() {
  console.log(
    "Chrome is not running with remote debugging. Launching a new instance...",
  );
  if (!fs.existsSync(USER_DATA_DIR)) {
    fs.mkdirSync(USER_DATA_DIR, { recursive: true });
  }

  const command = `"${CHROME_PATH}" --remote-debugging-port=${DEBUG_PORT} --user-data-dir="${USER_DATA_DIR}" --no-first-run --no-default-browser-check > /dev/null 2>&1 &`;
  console.log("Running launch command:", command);
  exec(command);

  for (let i = 0; i < 10; i++) {
    await sleep(1000);
    if (await isChromeListening()) {
      console.log("Chrome debug instance successfully launched!");
      return true;
    }
  }
  throw new Error("Failed to launch and connect to Chrome.");
}

async function main() {
  try {
    if (!fs.existsSync(BASE_OUTPUT_DIR)) {
      fs.mkdirSync(BASE_OUTPUT_DIR, { recursive: true });
    }

    // 1. Cargar los productos desde InsForge
    const baseUrl = "https://i5jqzbx6.us-east.insforge.app";
    const anonKey =
      "anon_222bdcf4c41d9b468d8e68a8d7492f49751b42070a2ff5e74dcba8b815dfa71b";
    const insforge = createClient({ baseUrl, anonKey });

    console.log("Fetching products from database...");
    const { data: rawProducts, error: dbError } = await insforge.database
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (dbError) {
      throw new Error(`Error fetching products: ${dbError.message}`);
    }

    console.log(`Loaded ${rawProducts.length} products for inventory list.`);

    // 2. Calcular estadísticas generales
    const totalProducts = rawProducts.length;
    let totalStock = 0;
    let totalValue = 0;
    let productsWithStripe = 0;

    rawProducts.forEach((p) => {
      const stock = Number(p.stock) || 0;
      const price = Number(p.price) || 0;
      totalStock += stock;
      totalValue += stock * price;
      if (p.stripe_price_id) {
        productsWithStripe++;
      }
    });

    const formattedDate = new Date().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // 3. Dividir productos en páginas para un salto de página limpio en PDF (ej. 8 en pág 1, 7 en pág 2)
    const page1Products = rawProducts.slice(0, 8);
    const page2Products = rawProducts.slice(8);

    // Assets locales
    const assetsDir = "/Users/musa/Downloads/sopisafer/src/assets";
    const logoFooterPath = `file://${assetsDir}/logo-footer-chic.png`;

    // 4. Generar HTML del Reporte de Stock
    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Control de Stock - Isafer Boutique</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;1,600&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: 'Outfit', sans-serif;
      background-color: #f3f4f6;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      width: 210mm;
      height: 297mm;
      box-sizing: border-box;
      position: relative;
      background-color: #ffffff;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 15mm 15mm;
      page-break-after: always;
      break-after: page;
    }
  </style>
</head>
<body>

  <!-- ================= PÁGINA 1: AUDITORÍA DE INVENTARIO (PARTE 1) ================= -->
  <div class="page text-zinc-800">
    <!-- Header -->
    <div>
      <div class="flex justify-between items-start border-b-2 border-zinc-900 pb-4 mb-6">
        <div>
          <h1 class="text-xl font-extrabold uppercase tracking-wider text-zinc-900">Control de Inventario y Stock</h1>
          <p class="text-xs text-zinc-500 mt-1">Isafer Boutique · Brooklyn Showroom · Nueva York</p>
        </div>
        <div class="text-right">
          <span class="text-xs bg-zinc-100 font-bold px-3 py-1 rounded-full uppercase tracking-wider text-zinc-700">Panel de Control</span>
          <p class="text-[10px] text-zinc-400 mt-1.5">${formattedDate}</p>
        </div>
      </div>

      <!-- Resumen Estadístico -->
      <div class="grid grid-cols-4 gap-4 mb-6">
        <div class="border border-zinc-200 rounded-xl p-3 bg-zinc-50">
          <span class="text-[9px] uppercase tracking-wider text-zinc-400 font-bold">Total Artículos</span>
          <p class="text-xl font-extrabold text-zinc-900 mt-1">${totalProducts}</p>
        </div>
        <div class="border border-zinc-200 rounded-xl p-3 bg-zinc-50">
          <span class="text-[9px] uppercase tracking-wider text-zinc-400 font-bold">Stock Físico (DB)</span>
          <p class="text-xl font-extrabold text-zinc-900 mt-1">${totalStock} <span class="text-xs text-zinc-450 font-normal">uds</span></p>
        </div>
        <div class="border border-zinc-200 rounded-xl p-3 bg-zinc-50">
          <span class="text-[9px] uppercase tracking-wider text-zinc-400 font-bold">Valor Inventario</span>
          <p class="text-xl font-extrabold text-rose-600 mt-1">$${totalValue.toLocaleString("en-US")}</p>
        </div>
        <div class="border border-zinc-200 rounded-xl p-3 bg-zinc-50">
          <span class="text-[9px] uppercase tracking-wider text-zinc-400 font-bold">Stripe Integrado</span>
          <p class="text-xl font-extrabold text-emerald-600 mt-1">${productsWithStripe} <span class="text-[10px] text-zinc-400 font-normal">/ ${totalProducts}</span></p>
        </div>
      </div>

      <!-- Tabla de Control 1 -->
      <div>
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-zinc-900 text-white uppercase text-[9px] tracking-wider font-extrabold">
              <th class="py-2 px-3 rounded-l-lg">Imagen</th>
              <th class="py-2 px-2">Nombre del Producto</th>
              <th class="py-2 px-2">ID / Referencia DB</th>
              <th class="py-2 px-2 text-center">Precio</th>
              <th class="py-2 px-2 text-center bg-zinc-800 rounded-xs">Stock DB</th>
              <th class="py-2 px-2 text-center">Físico</th>
              <th class="py-2 px-2 text-center">Dif</th>
              <th class="py-2 px-3 rounded-r-lg text-center">Stripe</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-200">
            ${page1Products.map((p) => renderTableRow(p)).join("")}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Footer -->
    <div class="flex justify-between items-center border-t border-zinc-200 pt-3 text-[10px] text-zinc-400">
      <span>* Planilla administrativa para auditoría interna física en Showroom. No comercial.</span>
      <span class="font-medium text-zinc-500">Página 1 de 2</span>
    </div>
  </div>

  <!-- ================= PÁGINA 2: AUDITORÍA DE INVENTARIO (PARTE 2) ================= -->
  <div class="page text-zinc-800">
    <!-- Header -->
    <div>
      <div class="flex justify-between items-start border-b-2 border-zinc-900 pb-4 mb-6">
        <div>
          <h1 class="text-xl font-extrabold uppercase tracking-wider text-zinc-900">Control de Inventario y Stock</h1>
          <p class="text-xs text-zinc-500 mt-1">Isafer Boutique · Brooklyn Showroom · Nueva York</p>
        </div>
        <div class="text-right">
          <span class="text-xs bg-zinc-100 font-bold px-3 py-1 rounded-full uppercase tracking-wider text-zinc-700">Panel de Control</span>
          <p class="text-[10px] text-zinc-400 mt-1.5">${formattedDate}</p>
        </div>
      </div>

      <!-- Tabla de Control 2 -->
      <div>
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-zinc-900 text-white uppercase text-[9px] tracking-wider font-extrabold">
              <th class="py-2 px-3 rounded-l-lg">Imagen</th>
              <th class="py-2 px-2">Nombre del Producto</th>
              <th class="py-2 px-2">ID / Referencia DB</th>
              <th class="py-2 px-2 text-center">Precio</th>
              <th class="py-2 px-2 text-center bg-zinc-800 rounded-xs">Stock DB</th>
              <th class="py-2 px-2 text-center">Físico</th>
              <th class="py-2 px-2 text-center">Dif</th>
              <th class="py-2 px-3 rounded-r-lg text-center">Stripe</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-200">
            ${page2Products.map((p) => renderTableRow(p)).join("")}
          </tbody>
        </table>
      </div>

      <!-- Sección de Firmas y Notas -->
      <div class="mt-8 border border-zinc-200 rounded-2xl p-6 bg-zinc-50/60 grid grid-cols-12 gap-6">
        <div class="col-span-7 space-y-3">
          <h3 class="text-xs uppercase font-extrabold text-zinc-700 tracking-wider">Notas de la Auditoría</h3>
          <div class="border-b border-zinc-350 h-5"></div>
          <div class="border-b border-zinc-350 h-5"></div>
          <div class="border-b border-zinc-350 h-5"></div>
          <div class="border-b border-zinc-350 h-5"></div>
        </div>
        <div class="col-span-5 flex flex-col justify-end items-center text-center space-y-6 pt-4">
          <!-- Logo Chic en miniatura -->
          <div class="w-12 h-12 rounded-full border border-zinc-300 p-1 bg-zinc-900 overflow-hidden flex items-center justify-center">
            <img src="${logoFooterPath}" class="w-full h-full object-cover rounded-full" />
          </div>
          <div class="w-full border-t border-zinc-400 mt-12 pt-1">
            <p class="text-[10px] font-bold text-zinc-700 uppercase tracking-wide">Firma del Administrador</p>
            <p class="text-[9px] text-zinc-400 mt-0.5">Control de Inventario Interno</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="flex justify-between items-center border-t border-zinc-200 pt-3 text-[10px] text-zinc-400">
      <span>* Planilla administrativa para auditoría interna física en Showroom. No comercial.</span>
      <span class="font-medium text-zinc-500">Página 2 de 2</span>
    </div>
  </div>

</body>
</html>
    `;

    // 5. Guardar HTML temporal
    const tempHtmlPath = path.join(
      "/Users/musa/Downloads/sopisafer/scripts",
      "stock_preview.html",
    );
    fs.writeFileSync(tempHtmlPath, htmlContent, "utf8");

    // 6. Conectar y renderizar
    let connected = await isChromeListening();
    if (!connected) {
      connected = await launchChromeRemote();
    }

    console.log("Connecting Playwright to Chrome via CDP...");
    const browser = await chromium.connectOverCDP(CDP_URL);

    const desktopContext = await browser.newContext({
      viewport: { width: 1200, height: 1700 },
      deviceScaleFactor: 2,
    });

    const page = await desktopContext.newPage();
    await page.goto(`file://${tempHtmlPath}`, {
      waitUntil: "networkidle",
      timeout: 60000,
    });
    await sleep(4000); // Esperar renderizado

    // Generar PDF
    const pdfPath = path.join(BASE_OUTPUT_DIR, "control_inventario.pdf");
    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      margin: { top: "0px", bottom: "0px", left: "0px", right: "0px" },
    });
    console.log(`✓ PDF control de inventario generado: ${pdfPath}`);

    // Capturar páginas
    const pageLocators = page.locator(".page");
    const pageCount = await pageLocators.count();
    for (let i = 0; i < pageCount; i++) {
      const imgPath = path.join(
        BASE_OUTPUT_DIR,
        `control_inventario_pagina_${i + 1}.png`,
      );
      await pageLocators.nth(i).screenshot({ path: imgPath });
      console.log(`✓ Captura guardada: ${imgPath}`);
    }

    await desktopContext.close();
    await browser.close();
    console.log("✓ Proceso de planilla de stock completado.");
  } catch (err) {
    console.error("ERROR generating inventory PDF:", err);
    process.exit(1);
  }
}

function renderTableRow(product) {
  const name = product.name || "Sin nombre";
  const id = product.id ? product.id.slice(0, 8) + "..." : "Sin ID";
  const slug = product.slug || "sin-slug";
  const price = Number(product.price).toFixed(2);
  const stock = product.stock !== undefined ? product.stock : 0;
  const image =
    product.images && product.images[0]
      ? product.images[0]
      : "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=80&q=80";

  // Categoría formateada rápida
  let category = "Tops & Sets";
  const nameLower = name.toLowerCase();
  if (
    nameLower.includes("vestido") ||
    nameLower.includes("gown") ||
    nameLower.includes("skirt")
  ) {
    category = "Vestido";
  } else if (
    nameLower.includes("licra") ||
    nameLower.includes("jumpsuit") ||
    nameLower.includes("athletic") ||
    nameLower.includes("biker")
  ) {
    category = "Licra";
  } else if (nameLower.includes("body")) {
    category = "Body";
  } else if (
    nameLower.includes("bolso") ||
    nameLower.includes("cinturón") ||
    nameLower.includes("accesorios")
  ) {
    category = "Accesorios";
  }

  // Estado de Stripe
  const stripeStatus = product.stripe_price_id
    ? `<span class="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
        <svg class="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
        Sí
       </span>`
    : `<span class="inline-flex items-center gap-1 text-[10px] text-rose-500 font-semibold italic">
        Pendiente
       </span>`;

  return `
    <tr class="hover:bg-zinc-50/50 align-middle">
      <td class="py-2.5 px-3">
        <div class="w-10 h-12 rounded-lg bg-zinc-100 border border-zinc-200 overflow-hidden shadow-xs">
          <img src="${image}" class="w-full h-full object-cover" />
        </div>
      </td>
      <td class="py-2.5 px-2">
        <p class="font-bold text-zinc-900 text-xs">${name}</p>
        <span class="text-[9px] uppercase tracking-widest text-zinc-400 font-semibold mt-0.5 block">${category}</span>
      </td>
      <td class="py-2.5 px-2">
        <p class="font-mono text-[9px] text-zinc-400" title="${product.id || ""}">${id}</p>
        <span class="text-[9px] text-zinc-500 block font-mono mt-0.5">${slug}</span>
      </td>
      <td class="py-2.5 px-2 text-center font-bold text-zinc-800">$${price}</td>
      <td class="py-2.5 px-2 text-center font-extrabold text-zinc-900 bg-zinc-50/60 font-mono text-sm">${stock}</td>
      <td class="py-2.5 px-2 text-center">
        <div class="w-12 h-6 border border-zinc-300 rounded-md bg-white mx-auto flex items-center justify-center text-[11px] font-mono text-zinc-300 font-light">______</div>
      </td>
      <td class="py-2.5 px-2 text-center">
        <div class="w-6 h-6 border border-zinc-300 rounded-md bg-white mx-auto flex items-center justify-center text-[10px] font-mono text-zinc-300 font-light">+/-</div>
      </td>
      <td class="py-2.5 px-3 text-center">${stripeStatus}</td>
    </tr>
  `;
}

main();
