import { useEffect, useState } from 'react';
import { insforge } from '@/lib/insforge';

export interface UserProfile {
  id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
}

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;

    // Check active session on mount
    async function getInitialSession() {
      try {
        if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
          const storedAdmin = localStorage.getItem("isafer_admin_session");
          if (storedAdmin) {
            setUser(JSON.parse(storedAdmin));
            if (active) setLoading(false);
            return;
          }
        }

        const { data, error } = await insforge.auth.getCurrentUser();
        if (!active) return;
        if (data?.user && !error) {
          const profile = (data.user as any).profile || {};
          const meta = (data.user as any).metadata || {};
          const isAdminUser = data.user.email === "admin@isaferboutique.com" || data.user.email === "admin";
          setUser({
            id: data.user.id,
            email: data.user.email,
            name: isAdminUser ? "Dueña · Isafer Boutique" : (profile.name || meta.full_name || data.user.email?.split('@')[0]),
            avatar_url: profile.avatar_url || meta.avatar_url,
          });
        } else {
          setUser(null);
        }
      } catch (err) {
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    getInitialSession();

    // Suscribirse a cambios de sesión de forma reactiva
    const unsubscribe = insforge.auth.onAuthStateChange(async (event: any) => {
      if (!active) return;
      if (event === 'SIGNED_OUT') {
        setUser(null);
        if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
          localStorage.removeItem("isafer_admin_session");
        }
        return;
      }
      try {
        const { data, error } = await insforge.auth.getCurrentUser();
        if (data?.user && !error) {
          const profile = (data.user as any).profile || {};
          const meta = (data.user as any).metadata || {};
          const isAdminUser = data.user.email === "admin@isaferboutique.com" || data.user.email === "admin";
          setUser({
            id: data.user.id,
            email: data.user.email,
            name: isAdminUser ? "Dueña · Isafer Boutique" : (profile.name || meta.full_name || data.user.email?.split('@')[0]),
            avatar_url: profile.avatar_url || meta.avatar_url,
          });
        }
      } catch (err) {
        setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    });

    return () => {
      active = false;
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await insforge.auth.signInWithOAuth({
        provider: 'google',
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      console.error('Error al iniciar sesión con Google:', err);
      return { success: false, error: err.message || 'Error con Google Auth' };
    }
  };

  const signInWithApple = async () => {
    try {
      const { data, error } = await insforge.auth.signInWithOAuth({
        provider: 'apple',
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      console.error('Error al iniciar sesión con Apple:', err);
      return { success: false, error: err.message || 'Error con Apple Auth' };
    }
  };

  const signInWithPassword = async (email: string, password: string) => {
    let cleanEmail = email.trim().toLowerCase();
    let cleanPass = password.trim();

    // Mapear atajos de administrador a la cuenta real en PostgreSQL de InsForge
    if (cleanEmail === "admin" || cleanEmail === "isafer@admin.com" || cleanEmail === "admin@rosseboutique.com") {
      cleanEmail = "admin@isaferboutique.com";
    }

    try {
      const { data, error } = await insforge.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPass,
      });
      if (error) throw error;
      if (data?.user) {
        const profile = (data.user as any).profile || {};
        const meta = (data.user as any).metadata || {};
        const isAdminUser = cleanEmail === "admin@isaferboutique.com";
        
        const userObj = {
          id: data.user.id,
          email: data.user.email,
          name: isAdminUser ? "Dueña · Isafer Boutique" : (profile.name || meta.full_name || data.user.email?.split('@')[0]),
          avatar_url: profile.avatar_url || meta.avatar_url,
        };
        setUser(userObj);
        if (isAdminUser && typeof window !== "undefined" && typeof localStorage !== "undefined") {
          localStorage.setItem("isafer_admin_session", JSON.stringify(userObj));
        }
      }
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message || 'Credenciales incorrectas' };
    }
  };

  const signOut = async () => {
    try {
      await insforge.auth.signOut();
      setUser(null);
      if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
        localStorage.removeItem("isafer_admin_session");
      }
      return { success: true };
    } catch (err: any) {
      console.error('Error al cerrar sesión:', err);
      return { success: false, error: err.message };
    }
  };

  const hasAdminSession = typeof window !== "undefined" && typeof localStorage !== "undefined" && !!localStorage.getItem("isafer_admin_session");
  const storedProfile = typeof window !== "undefined" && typeof localStorage !== "undefined" ? localStorage.getItem("isafer_admin_profile") : null;
  const customAdminEmail = storedProfile ? JSON.parse(storedProfile).email : "admin@isaferboutique.com";

  const isAdmin = hasAdminSession || user?.email === customAdminEmail || user?.email === "admin@isaferboutique.com" || user?.email === "admin" || user?.id === "45706904-cda3-4f28-9d05-0e60176dcaae";
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
