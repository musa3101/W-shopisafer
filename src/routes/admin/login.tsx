import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { IsaferLogo } from "@/components/IsaferLogo";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginComponent,
});

function AdminLoginComponent() {
  const navigate = useNavigate();
  const { signInWithPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Por favor, introduce tu usuario o correo electrónico.");
      return;
    }

    setIsLoading(true);
    try {
      // Timeout de seguridad de 10s para evitar pantallas congeladas
      const authPromise = signInWithPassword(email, password || "admin");
      const timeoutPromise = new Promise<{ success: false; error: string }>((resolve) =>
        setTimeout(() => resolve({ success: false, error: "Tiempo de espera agotado. Verifica tu conexión." }), 10000)
      );

      const res = await Promise.race([authPromise, timeoutPromise]);
      if (res.success) {
        toast.success("¡Bienvenida Camila! 💖");
        navigate({ to: "/admin", replace: true });
      } else {
        toast.error(res.error || "Credenciales incorrectas.");
      }
    } catch (err: any) {
      toast.error(err.message || "Error al conectar con la autenticación.");
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

      {/* Formulario Uiverse Brutalista */}
      <div className="w-full flex flex-col items-center gap-6 mt-16 sm:mt-0 animate-in fade-in zoom-in-95 duration-500">
        <div className="scale-90 sm:scale-100 transition-transform">
          <IsaferLogo variant="header" size="md" className="mb-2" />
        </div>

        <form onSubmit={handleFormSubmit} className="form">
          <p>
            Bienvenida, Camila<span>accede a tu panel privado</span>
          </p>

          {/* Email Input */}
          <input 
            type="text" 
            placeholder="Usuario o Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
            className="mt-4"
          />

          {/* Password Input */}
          <input 
            type="password" 
            placeholder="Contraseña" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />

          {/* Submit Button */}
          <button type="submit" disabled={isLoading} className="oauthButton mt-4">
            {isLoading ? "Cargando..." : "Acceder al Panel"}
            <svg className="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 17 5-5-5-5"></path>
              <path d="m13 17 5-5-5-5"></path>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
