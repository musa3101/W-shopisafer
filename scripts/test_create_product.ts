import { insforge } from "../src/lib/insforge.ts";

async function testProductCreation() {
  console.log("🔍 Probando inserción de producto simulado en InsForge...");

  const testProduct = {
    id: crypto.randomUUID(),
    name: "Vestido Barbie Luxe Simulado",
    slug: `vestido-barbie-luxe-simulado-${Date.now()}`,
    description: "Vestido ajustado de prueba con licra moldeadora",
    price: 89.99,
    stock: 15,
    category: "Vestidos",
    badge: "PRUEBA SIMULADA",
    images: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80"]
  };

  try {
    const { data, error } = await insforge.database
      .from("products")
      .insert([testProduct]);

    if (error) {
      console.error("❌ Error de InsForge al insertar producto:", error);
    } else {
      console.log("✅ ¡Producto insertado con éxito en InsForge!", data);
    }
  } catch (err) {
    console.error("❌ Excepción al insertar producto:", err);
  }
}

testProductCreation();
