import { createClient } from "@insforge/sdk";

const baseUrl = "https://i5jqzbx6.us-east.insforge.app";
const anonKey =
  "anon_222bdcf4c41d9b468d8e68a8d7492f49751b42070a2ff5e74dcba8b815dfa71b";

const insforge = createClient({
  baseUrl,
  anonKey,
});

async function checkRLS() {
  const email = "admin@rosseboutique.com";
  const password = "admin123";

  console.log(`🔐 Iniciando sesión como admin (${email}) para auditar RLS...`);
  const { data: authData, error: authError } =
    await insforge.auth.signInWithPassword({
      email,
      password,
    });

  if (authError) {
    console.error("❌ Error de autenticación en script:", authError.message);
    return;
  }

  console.log(
    "✅ Autenticado correctamente con ID de usuario:",
    authData.user.id,
  );

  // Crear un nuevo cliente con la sesión activa (o usar el mismo cliente, ya que el SDK maneja la persistencia de la cabecera Auth)
  console.log('\n--- 1. Probando lectura de la tabla "products" ---');
  const { data: products, error: prodError } = await insforge.database
    .from("products")
    .select("*");
  if (prodError) {
    console.error("❌ Error al leer products:", prodError.message);
  } else {
    console.log(
      `✅ Lectura de products exitosa! Se obtuvieron ${products.length} productos.`,
    );
  }

  console.log('\n--- 2. Probando lectura de la tabla "orders" ---');
  const { data: orders, error: orderError } = await insforge.database
    .from("orders")
    .select("*");
  if (orderError) {
    console.error("❌ Error al leer orders:", orderError.message);
  } else {
    console.log(
      `✅ Lectura de orders exitosa! Se obtuvieron ${orders.length} órdenes.`,
    );
  }

  if (products && products.length > 0) {
    const testProd = products[0];
    console.log(
      `\n--- 3. Probando actualización de producto (ID: ${testProd.id}) ---`,
    );
    const originalPrice = testProd.price;
    const { data: updateData, error: updateError } = await insforge.database
      .from("products")
      .update({ price: originalPrice }) // Actualizar al mismo precio para no romper datos
      .eq("id", testProd.id);

    if (updateError) {
      console.error(
        "❌ Error de RLS al actualizar producto:",
        updateError.message,
      );
    } else {
      console.log(
        "✅ Actualización de producto exitosa! Las políticas RLS de admin funcionan.",
      );
    }
  } else {
    console.log("\n⚠️ No hay productos para probar actualización.");
  }
}

checkRLS();
