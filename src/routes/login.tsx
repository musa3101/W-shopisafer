import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/lib/i18n";
import { toast } from "sonner";
import { IsaferLogo } from "@/components/IsaferLogo";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginComponent,
});

function LoginComponent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signInWithGoogle, signInWithApple } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await signInWithGoogle();
      if (!res.success) {
        toast.error(res.error || "No se pudo iniciar sesión con Google.");
      } else {
        toast.success("Redirigiendo a Google Auth...");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al conectar con Google.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await signInWithApple();
      if (!res.success) {
        toast.error(res.error || "No se pudo iniciar sesión con Apple.");
      } else {
        toast.success("Redirigiendo a Apple Auth...");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al conectar con Apple.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#fff8fa] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Fondo decorativo Barbie Luxe */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-rose-100/40 blur-3xl -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-pink-100/50 blur-3xl -z-10" />

      {/* Botón Volver flotante en esquina superior izquierda */}
      <button
        onClick={() => navigate({ to: "/" })}
        className="absolute top-6 left-6 px-4 py-2 border-3 border-zinc-900 bg-white shadow-[3px_3px_0px_#0f172a] rounded-xl text-xs font-black uppercase tracking-wider text-zinc-900 flex items-center gap-2 hover:bg-rose-50 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#0f172a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#0f172a] transition-all cursor-pointer z-20"
      >
        <ArrowLeft className="size-4" />
        Volver a la Tienda
      </button>

      {/* Formulario Uiverse Brutalista con Logo Elevado */}
      <div className="w-full flex flex-col items-center gap-6 mt-16 sm:mt-0 animate-in fade-in zoom-in-95 duration-500">
        {/* Logo de Isafer Boutique en tarjeta blanca elevada */}
        <div className="flex items-center justify-center p-3 px-6 rounded-2xl bg-white border-3 border-zinc-900 shadow-[4px_4px_0px_#18181b] hover:scale-105 transition-transform duration-300">
          <IsaferLogo variant="header" size="md" />
        </div>

        <form className="form">
          <p>
            Welcome,<span>sign in to continue to your account</span>
          </p>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={isLoading}
            className="oauthButton"
          >
            <svg className="icon" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              ></path>
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              ></path>
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              ></path>
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              ></path>
              <path d="M1 1h22v22H1z" fill="none"></path>
            </svg>
            Continue with Google
          </button>

          {/* Apple Button */}
          <button
            type="button"
            onClick={handleAppleClick}
            disabled={isLoading}
            className="oauthButton"
          >
            {/* SVG de Apple */}
            <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.62.71-1.16 1.85-1.01 2.96 1.12.09 2.27-.57 2.94-1.39z" />
            </svg>
            Continue with Apple
          </button>
        </form>
      </div>
    </div>
  );
}
