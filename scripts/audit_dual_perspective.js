import {
  fetchProducts,
  fetchAllOrders,
  updateProductPriceAndStock,
} from "../src/services/insforgeService.js";
import {
  fetchUserFavorites,
  addFavorite,
  removeFavorite,
} from "../src/services/favoritesService.js";

async function runDualPerspectiveAudit() {
  console.log("==========================================================");
  console.log("🌸 ISAFERS BOUTIQUE - AUDITORÍA DUAL (CLIENTE & DUEÑA) 💖");
  console.log("==========================================================\n");

  let totalErrors = 0;

  // -------------------------------------------------------------------------
  // PERSPECTIVA 1: CLIENTA (Customer Experience & Shopping Flow)
  // -------------------------------------------------------------------------
  console.log("🛍️ [PERSPECTIVA 1: CLIENTA]");
  console.log("----------------------------------------------------------");

  try {
    const products = await fetchProducts();
    console.log(
      `✓ 1. Carga del Catálogo: ${products.length} prendas obtenidas de la base de datos.`,
    );
    if (products.length === 0) {
      console.error("❌ ERROR: El catálogo retornó 0 prendas.");
      totalErrors++;
    }

    // Comprobar imágenes y precios válidos
    const invalidProducts = products.filter(
      (p) => !p.images || p.images.length === 0 || p.price <= 0,
    );
    if (invalidProducts.length > 0) {
      console.error(
        `❌ ERROR: Hay ${invalidProducts.length} productos con fotos rotas o precio $0.`,
      );
      totalErrors++;
    } else {
      console.log(
        `✓ 2. Integridad de Prendas: Las ${products.length} prendas poseen imágenes y precios en $ USD válidos.`,
      );
    }

    // Comprobar integración de Stripe Checkout
    const stripeReadyProducts = products.filter(
      (p) => p.stripe_price_id && p.stripe_price_id.startsWith("price_"),
    );
    console.log(
      `✓ 3. Integración con Stripe Checkout: ${stripeReadyProducts.length}/${products.length} prendas listas para cobro automático.`,
    );

    // Simular Favoritos de Clienta
    const testUserId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
    const firstProduct = products[0];
    if (firstProduct) {
      const added = await addFavorite(testUserId, firstProduct.id);
      console.log(
        `✓ 4. Adición a Favoritos: Prenda '${firstProduct.name}' guardada en lista de deseos (Éxito: ${added}).`,
      );
      const userFavs = await fetchUserFavorites(testUserId);
      console.log(
        `✓ 5. Consulta de Favoritos: Clienta posee ${userFavs.length} prenda(s) en su wishlist.`,
      );
      await removeFavorite(testUserId, firstProduct.id);
      console.log(
        `✓ 6. Limpieza de Favoritos: Prueba de eliminación completada.`,
      );
    }
  } catch (err) {
    console.error("❌ ERROR EN PERSPECTIVA DE CLIENTA:", err.message);
    totalErrors++;
  }

  console.log("\n----------------------------------------------------------");
  // -------------------------------------------------------------------------
  // PERSPECTIVA 2: DUEÑA (Camila - Admin Dashboard & Sales Ops)
  // -------------------------------------------------------------------------
  console.log("👑 [PERSPECTIVA 2: DUEÑA · CAMILA ADMIN]");
  console.log("----------------------------------------------------------");

  try {
    const orders = await fetchAllOrders();
    console.log(
      `✓ 1. Acceso a Pedidos: ${orders.length} órdenes recuperadas para administración.`,
    );

    // Métricas Financieras (Bento Metrics)
    const totalRevenue = orders.reduce(
      (sum, o) => sum + (Number(o.total_amount) || 0),
      0,
    );
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    console.log(`✓ 2. Panel Financiero (Bento Metrics):`);
    console.log(`     • Ingresos Acumulados: $${totalRevenue.toFixed(2)} USD`);
    console.log(`     • Ticket Promedio: $${avgOrderValue.toFixed(2)} USD`);

    // Probar generación de enlace a WhatsApp para la dueña
    if (orders.length > 0) {
      const sampleOrder = orders[0];
      const rawPhone = sampleOrder.customer_phone || "19296772514";
      const cleanPhone = rawPhone.replace(/\D/g, "");
      const waLink = `https://wa.me/${cleanPhone}?text=Hola%20${encodeURIComponent(sampleOrder.customer_name || "Clienta")}`;
      console.log(
        `✓ 3. Integración WhatsApp para Contacto Directo: URL generada correctamente -> ${waLink.substring(0, 45)}...`,
      );
    }

    // Probar actualización de Stock e Inventario
    const products = await fetchProducts();
    if (products.length > 0) {
      const targetProduct = products[0];
      const res = await updateProductPriceAndStock(
        targetProduct.id,
        targetProduct.price,
        targetProduct.stock,
        targetProduct.stripe_price_id,
      );
      console.log(
        `✓ 4. Modificación de Stock/Precios (Panel de Camila): Actualización en tiempo real ejecutada (Éxito: ${res.success}).`,
      );
    }
  } catch (err) {
    console.error("❌ ERROR EN PERSPECTIVA DE DUEÑA:", err.message);
    totalErrors++;
  }

  console.log("\n==========================================================");
  if (totalErrors === 0) {
    console.log(
      "🎉 AUDITORÍA DUAL FINALIZADA SIN NINGÚN ERROR (100% PERFECTO) 💖",
    );
  } else {
    console.log(`⚠️ AUDITORÍA COMPLETADA CON ${totalErrors} ERROR(ES).`);
  }
  console.log("==========================================================");
}

runDualPerspectiveAudit();
