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
          setUser({
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
            avatar_url: data.user.user_metadata?.avatar_url,
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

    // Listen for Auth changes
    const { data: authListener } = insforge.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
          avatar_url: session.user.user_metadata?.avatar_url,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
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

  const signInWithPassword = async (email: string, password: string) => {
    try {
      const { data, error } = await insforge.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (data?.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
          avatar_url: data.user.user_metadata?.avatar_url,
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

  return {
    user,
    loading,
    signInWithGoogle,
    signInWithPassword,
    signOut,
  };
}
