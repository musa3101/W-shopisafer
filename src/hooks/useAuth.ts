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
    // Check active session on mount
    async function getInitialSession() {
      try {
        const { data, error } = await insforge.auth.getCurrentUser();
        if (data?.user && !error) {
          const profile = (data.user as any).profile || {};
          const meta = (data.user as any).metadata || {};
          setUser({
            id: data.user.id,
            email: data.user.email,
            name: profile.name || meta.full_name || data.user.email?.split('@')[0],
            avatar_url: profile.avatar_url || meta.avatar_url,
          });
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error al obtener usuario actual de InsForge:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    getInitialSession();
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

  const signInWithPassword = async (email: string, password: string) => {
    let cleanEmail = email.trim().toLowerCase();
    let cleanPass = password.trim();

    // Mapear atajos de administrador a la cuenta real en PostgreSQL de InsForge
    if (cleanEmail === "admin" || cleanEmail === "isafer@admin.com") {
      cleanEmail = "admin@rosseboutique.com";
    }
    if (cleanPass === "admin" || cleanPass === "123456") {
      cleanPass = "admin123";
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
        const isAdminUser = cleanEmail === "admin@rosseboutique.com";
        
        setUser({
          id: data.user.id,
          email: data.user.email,
          name: isAdminUser ? "Dueña · Isafer Boutique" : (profile.name || meta.full_name || data.user.email?.split('@')[0]),
          avatar_url: profile.avatar_url || meta.avatar_url,
        });
      }
      return { success: true, data };
    } catch (err: any) {
      console.error('Error en login con contraseña:', err);
      return { success: false, error: err.message || 'Credenciales incorrectas' };
    }
  };

  const signOut = async () => {
    try {
      await insforge.auth.signOut();
      setUser(null);
      return { success: true };
    } catch (err: any) {
      console.error('Error al cerrar sesión:', err);
      return { success: false, error: err.message };
    }
  };

  const isAdmin = user?.email?.includes("admin") || user?.id === "owner-admin-id";
  const isCustomer = !!user && !isAdmin;

  return {
    user,
    loading,
    isAdmin,
    isCustomer,
    signInWithGoogle,
    signInWithPassword,
    signOut,
  };
}
