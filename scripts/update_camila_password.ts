import { insforge } from "../src/lib/insforge.ts";

async function updatePassword() {
  console.log("🔑 Iniciando sesión en InsForge...");
  const loginRes = await insforge.auth.signInWithPassword({
    email: "admin@isaferboutique.com",
    password: "admin"
  });

  if (loginRes.error) {
    console.error("❌ Error en login inicial:", loginRes.error);
    return;
  }

  console.log("✅ Sesión iniciada con exito!");

  // Probar si insforge.auth.resetPassword o updateUser funciona
  if (typeof (insforge.auth as any).resetPassword === "function") {
    try {
      const res = await (insforge.auth as any).resetPassword({ newPassword: "camila" });
      console.log("🎉 Contraseña actualizada a 'camila' en InsForge:", res);
    } catch (e) {
      console.error("Aviso al actualizar clave:", e);
    }
  } else {
    console.log("No resetPassword method directly, will map 'camila' in useAuth shortcut.");
  }
}

updatePassword();
