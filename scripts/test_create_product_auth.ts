import { insforge } from "../src/lib/insforge.ts";

async function testAuthProductCreation() {
  console.log("🔑 Iniciando sesión como admin en InsForge...");
  
  const loginRes = await insforge.auth.signInWithPassword({
    email: "admin@isaferboutique.com",
    password: "admin"
  });

  if (loginRes.error) {
    console.error("❌ Error al iniciar sesión en InsForge:", loginRes.error);
    return;
  }

  console.log("✅ Sesión iniciada como Admin en InsForge!", loginRes.data?.user?.email);

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

  const { data, error } = await insforge.database
    .from("products")
    .insert([testProduct]);

  if (error) {
    console.error("❌ Error al insertar producto autenticado:", error);
  } else {
    console.log("🎉 ¡PRODUCTO CREADO CON ÉXITO EN INSFORGE!", data);
  }
}

testAuthProductCreation();
