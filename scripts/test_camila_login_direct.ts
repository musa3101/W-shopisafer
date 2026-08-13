import { insforge } from "../src/lib/insforge.ts";

async function testCamilaDirectLogin() {
  console.log("🔑 Probando la función signInWithPassword con 'camila' / 'camila'...");

  // Simular la lógica de useAuth
  let cleanEmail = "camila".trim().toLowerCase();
  let cleanPass = "camila".trim();

  if (
    cleanEmail === "camila" ||
    cleanEmail === "camila@isaferboutique.com" ||
    cleanEmail === "admin" ||
    cleanEmail === "admin@isaferboutique.com"
  ) {
    cleanEmail = "admin@isaferboutique.com";
    if (cleanPass === "camila" || cleanPass === "admin") {
      cleanPass = "admin";
    }
  }

  const { data, error } = await insforge.auth.signInWithPassword({
    email: cleanEmail,
    password: cleanPass,
  });

  if (error) {
    console.error("❌ Error de autenticación:", error);
  } else {
    console.log("🎉 ¡INICIO DE SESIÓN EXITOSO EN INSFORGE! Usuario autenticado:", data.user?.email);
  }
}

testCamilaDirectLogin();
