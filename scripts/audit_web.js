import * as fs from 'fs';
import { createClient } from '@insforge/sdk';

const TARGET_URL = 'https://isafer.mynextbymusa.workers.dev';
const INSFORGE_API = 'https://i5jqzbx6.us-east.insforge.app';

// Cargar variables de forma robusta desde .env.local
let anonKey = '';
let baseUrl = '';
try {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const matchKey = envContent.match(/NEXT_PUBLIC_INSFORGE_ANON_KEY=(.*)/);
  if (matchKey && matchKey[1]) {
    anonKey = matchKey[1].trim();
  }
  const matchUrl = envContent.match(/NEXT_PUBLIC_INSFORGE_URL=(.*)/);
  if (matchUrl && matchUrl[1]) {
    baseUrl = matchUrl[1].trim();
  }
} catch (e) {
  console.warn('Advertencia: No se pudo leer .env.local, se intentará usar process.env');
}

async function runAudit() {
  console.log(`🚀 Iniciando Auditoría Automatizada en: ${TARGET_URL}\n`);
  
  const report = [];
  report.push(`# Reporte de Auditoría Técnica — Isafer Boutique 🧪`);
  report.push(`*Generado automáticamente el ${new Date().toLocaleString('es-ES')}*\n`);
  
  let totalErrors = 0;
  let totalWarnings = 0;

  // 1. Verificar Páginas Clave
  report.push(`## 🖥️ 1. Disponibilidad de Páginas`);
  const pages = [
    { name: 'Página de Inicio (Home)', path: '/' },
    { name: 'Pantalla de Login Brutalista', path: '/login' }
  ];

  for (const page of pages) {
    try {
      const start = Date.now();
      const res = await fetch(`${TARGET_URL}${page.path}`);
      const duration = Date.now() - start;
      
      if (res.ok) {
        report.push(`- **${page.name}** (${page.path}): ✓ **OK (HTTP ${res.status})** en ${duration}ms`);
      } else {
        report.push(`- **${page.name}** (${page.path}): ❌ **FALLÓ (HTTP ${res.status})**`);
        totalErrors++;
      }
    } catch (err) {
      report.push(`- **${page.name}** (${page.path}): ❌ **ERROR DE CONEXIÓN** (${err.message})`);
      totalErrors++;
    }
  }
  report.push('');

  // 2. Verificar Conexión de API con InsForge
  report.push(`## 🛢️ 2. Conectividad con el Backend (InsForge)`);
  try {
    const start = Date.now();
    const finalUrl = baseUrl || 'https://i5jqzbx6.us-east.insforge.app';
    const finalKey = anonKey || 'anon_222bdcf4c41d9b468d8e68a8d7492f49751b42070a2ff5e74dcba8b815dfa71b';
    
    // Inicializar cliente SDK oficial de InsForge
    const insforgeClient = createClient({
      baseUrl: finalUrl,
      anonKey: finalKey
    });

    const { data: products, error } = await insforgeClient.database
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    const duration = Date.now() - start;

    if (!error && products) {
      report.push(`- **Catálogo de Productos**: ✓ **Conectado vía SDK** en ${duration}ms`);
      report.push(`  - Total de productos registrados: **${products.length}**`);
      
      // 3. Verificar Imágenes de los Productos
      report.push(`\n### 🖼️ 3. Auditoría de Imágenes de Catálogo`);
      let imagesChecked = 0;
      let brokenImages = 0;

      for (const prod of products) {
        if (prod.images && prod.images.length > 0) {
          const imgUrl = prod.images[0];
          imagesChecked++;
          try {
            const imgRes = await fetch(imgUrl, { method: 'HEAD' });
            if (imgRes.ok) {
              report.push(`  - Prenda *"${prod.name}"*: ✓ Imagen en línea (HTTP 200)`);
            } else {
              report.push(`  - Prenda *"${prod.name}"*: ❌ **IMAGEN ROTA (HTTP ${imgRes.status})** en URL: ${imgUrl}`);
              brokenImages++;
              totalErrors++;
            }
          } catch (e) {
            report.push(`  - Prenda *"${prod.name}"*: ❌ **IMAGEN INACCESIBLE** (Error de red) en URL: ${imgUrl}`);
            brokenImages++;
            totalErrors++;
          }
        } else {
          report.push(`  - Prenda *"${prod.name}"*: ⚠️ **Sin imagen de producto configurada**`);
          totalWarnings++;
        }
      }
      report.push(`\n- Resumen de imágenes: **${imagesChecked} comprobadas**, **${brokenImages} rotas**.`);
    } else {
      report.push(`- **Catálogo de Productos**: ❌ **ERROR DE CONEXIÓN CON INSFORGE (SDK Error: ${error?.message || 'Desconocido'})**`);
      totalErrors++;
    }
  } catch (err) {
    report.push(`- **Conexión InsForge**: ❌ **ERROR DE RED AL CONECTAR AL BACKEND** (${err.message})`);
    totalErrors++;
  }
  report.push('');

  // 4. Verificar Enlaces de Canales y Redes Sociales
  report.push(`## 📱 4. Validación de Enlaces de Redes`);
  const socialLinks = [
    { name: 'Instagram Oficial', url: 'https://instagram.com/shopisafer' },
    { name: 'WhatsApp de Camila (Dueña)', url: 'https://wa.me/19296772514' }
  ];

  for (const link of socialLinks) {
    try {
      const res = await fetch(link.url, { method: 'GET', headers: { 'User-Agent': 'Mozilla/5.0' } });
      // Muchas redes bloquean peticiones automatizadas (ej: HTTP 400/403/302), por lo que si responde o redirige, consideramos que está vivo
      if (res.status < 500) {
        report.push(`- **${link.name}** (${link.url}): ✓ Enlace vivo (HTTP ${res.status})`);
      } else {
        report.push(`- **${link.name}** (${link.url}): ❌ **ALERTA (HTTP ${res.status})**`);
        totalWarnings++;
      }
    } catch (e) {
      report.push(`- **${link.name}** (${link.url}): ❌ **ENLACE CAÍDO** (${e.message})`);
      totalErrors++;
    }
  }
  report.push('');

  // Resumen Final
  report.push(`## 📊 Resumen del Reporte`);
  report.push(`- Errores graves (enlaces rotos/caídas): **${totalErrors}**`);
  report.push(`- Advertencias de diseño o datos: **${totalWarnings}**`);
  
  if (totalErrors === 0) {
    report.push(`\n🎉 **¡La boutique está en perfecto estado técnico y lista para producción!** Todos los endpoints y recursos están respondiendo de inmediato.`);
  } else {
    report.push(`\n⚠️ **Se encontraron algunos detalles que requieren atención antes del lanzamiento definitivo.** Revisa el listado superior.`);
  }

  const reportContent = report.join('\n');
  fs.writeFileSync('docs/AUDIT_REPORT.md', reportContent);
  console.log('✓ Auditoría finalizada. Reporte guardado en docs/AUDIT_REPORT.md');
}

runAudit();
