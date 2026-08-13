import { useEffect, useState } from "react";
import { insforge } from "@/lib/insforge";

export interface UserProfile {
  id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
  role?: string;
}

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUserProfile = async (): Promise<UserProfile | null> => {
    try {
      const { data, error } = await insforge.auth.getCurrentUser();
      if (data?.user && !error) {
        const userRecord = data.user as Record<string, unknown>;
        const profile = (userRecord.profile as Record<string, string>) || {};
        const meta = (userRecord.metadata as Record<string, string>) || {};
        const role =
          profile.role ||
          meta.role ||
          (data.user.email?.toLowerCase() === "admin@isaferboutique.com"
            ? "admin"
            : "customer");
        const isAdminUser =
          role === "admin" ||
          data.user.email?.toLowerCase() === "admin@isaferboutique.com";

        return {
          id: data.user.id,
          email: data.user.email,
          name:
            profile.name ||
            meta.full_name ||
            (isAdminUser
              ? "Dueña · Isafer Boutique"
              : data.user.email?.split("@")[0]),
          avatar_url: profile.avatar_url || meta.avatar_url,
          role,
        };
      }
      return null;
    } catch (err) {
      console.error("Error al obtener la sesión de usuario:", err);
      return null;
    }
  };

  useEffect(() => {
    let active = true;

    async function getInitialSession() {
      try {
        const profile = await fetchUserProfile();
        if (active) {
          setUser(profile);
        }
      } catch (err) {
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    getInitialSession();

    const unsubscribe = insforge.auth.onAuthStateChange(
      async (event: string) => {
        if (!active) return;
        if (event === "SIGNED_OUT") {
          setUser(null);
          setLoading(false);
          return;
        }
        try {
          const profile = await fetchUserProfile();
          if (active) setUser(profile);
        } catch (err) {
          if (active) setUser(null);
        } finally {
          if (active) setLoading(false);
        }
      },
    );

    return () => {
      active = false;
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await insforge.auth.signInWithOAuth({
        provider: "google",
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      return { success: true, data };
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Error con Google Auth";
      console.error("Error al iniciar sesión con Google:", err);
      return { success: false, error: errorMsg };
    }
  };

  const signInWithApple = async () => {
    try {
      const { data, error } = await insforge.auth.signInWithOAuth({
        provider: "apple",
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      return { success: true, data };
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Error con Apple Auth";
      console.error("Error al iniciar sesión con Apple:", err);
      return { success: false, error: errorMsg };
    }
  };

  const signInWithPassword = async (email: string, password: string) => {
    let cleanEmail = email.trim().toLowerCase();
    let cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      return { success: false, error: "Introduce correo y contraseña válidos" };
    }

    // Mapear credenciales de administradora ("camila", "camila@isaferboutique.com", "admin")
    if (
      cleanEmail === "camila" ||
      cleanEmail === "camila@isaferboutique.com" ||
      cleanEmail === "admin" ||
      cleanEmail === "admin@isaferboutique.com" ||
      cleanEmail === "isafer@admin.com"
    ) {
      cleanEmail = "admin@isaferboutique.com";
      if (cleanPass === "camila" || cleanPass === "admin") {
        cleanPass = "admin";
      }
    }

    try {
      const { data, error } = await insforge.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPass,
      });
      if (error) throw error;

      const profile = await fetchUserProfile();
      setUser(profile);

      return { success: true, data };
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Credenciales incorrectas";
      return {
        success: false,
        error: errorMsg,
      };
    }
  };

  const signOut = async () => {
    try {
      await insforge.auth.signOut();
      setUser(null);
      return { success: true };
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Error al cerrar sesión";
      console.error("Error al cerrar sesión:", err);
      return { success: false, error: errorMsg };
    }
  };

  const isAdmin =
    !!user &&
    (user.role === "admin" ||
      user.email?.toLowerCase() === "admin@isaferboutique.com");
  const isCustomer = !!user && !isAdmin;

  return {
    user,
    loading,
    isAdmin,
    isCustomer,
    signInWithGoogle,
    signInWithApple,
    signInWithPassword,
    signOut,
  };
}
