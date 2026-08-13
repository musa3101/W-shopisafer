import { createClient } from "@insforge/sdk";

const baseUrl = "https://i5jqzbx6.us-east.insforge.app";
const anonKey =
  "anon_222bdcf4c41d9b468d8e68a8d7492f49751b42070a2ff5e74dcba8b815dfa71b";

const insforge = createClient({
  baseUrl,
  anonKey,
});

async function runTest() {
  const email = "admin@rosseboutique.com";
  const password = "admin123";

  console.log(`Intentando iniciar sesión como admin (${email})...`);
  try {
    const { data, error } = await insforge.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log("❌ Falló el login del administrador:", error.message);

      console.log("Intentando registrar al administrador en InsForge...");
      const signUpResult = await insforge.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: "Dueña · Isafer Boutique",
            role: "admin",
          },
        },
      });

      if (signUpResult.error) {
        console.log(
          "❌ Falló también el registro del administrador:",
          signUpResult.error.message,
        );
      } else {
        console.log(
          "✅ Administrador registrado exitosamente en el backend de InsForge!",
        );
        console.log("Detalles del usuario registrado:", signUpResult.data.user);
      }
    } else {
      console.log("✅ Login exitoso. El usuario ya existe en InsForge!");
      console.log("Detalles del usuario:", data.user);
    }
  } catch (err) {
    console.error("Error durante la ejecución:", err);
  }
}

runTest();
