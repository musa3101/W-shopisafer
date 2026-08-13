import { insforge } from "../src/lib/insforge.ts";

async function testFetch() {
  console.log("🔍 Probando insforge.database.from('products').select('*')...");

  const { data, error } = await insforge.database
    .from("products")
    .select("*");

  if (error) {
    console.error("❌ Error de SELECT en products:", error);
  } else {
    console.log(`✅ SELECT exitoso! Se obtuvieron ${data?.length} productos:`);
    console.log(data?.map((p: any) => ({ id: p.id, name: p.name, price: p.price, created_at: p.created_at })));
  }
}

testFetch();
