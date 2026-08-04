import { useState } from "react";
import { LogIn, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoogleSignIn: () => Promise<{ success: boolean; error?: string }>;
  onAdminLogin: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  onSuccessAdmin: () => void;
}

export function AuthDialog({
  open,
  onOpenChange,
  onGoogleSignIn,
  onAdminLogin,
  onSuccessAdmin,
}: AuthDialogProps) {
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleClick = async () => {
    setIsLoading(true);
    const res = await onGoogleSignIn();
    setIsLoading(false);
    if (!res.success) {
      toast.error(res.error || "No se pudo iniciar sesión con Google.");
    } else {
      toast.success("Redirigiendo a Google Auth...");
      onOpenChange(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail || !adminPassword) {
      toast.error("Por favor completa el email y la contraseña.");
      return;
    }

    setIsLoading(true);
    const res = await onAdminLogin(adminEmail, adminPassword);
    setIsLoading(false);

    if (res.success) {
      toast.success("¡Bienvenida al Panel de Administración!");
      onOpenChange(false);
      onSuccessAdmin();
    } else {
      toast.error(res.error || "Credenciales de administración incorrectas.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] bg-background border-border shadow-2xl p-6 rounded-2xl">
        <DialogHeader className="text-center sm:text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center border border-rose-200">
            <User className="w-6 h-6 text-rose-600" />
          </div>
          <DialogTitle className="text-2xl font-serif text-foreground">
            Mi Cuenta · Rossé Boutique
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Accede a tu historial de pedidos o entra al panel de administración de la tienda.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="client" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted p-1">
            <TabsTrigger value="client" className="rounded-lg text-xs font-medium py-2">
              <User className="w-3.5 h-3.5 mr-1.5" /> Clientas (Google)
            </TabsTrigger>
            <TabsTrigger value="admin" className="rounded-lg text-xs font-medium py-2">
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Dueña / Admin
            </TabsTrigger>
          </TabsList>

          <TabsContent value="client" className="space-y-4 pt-4">
            <div className="text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                Inicia sesión rápidamente con tu cuenta de Google para consultar el estado de tus compras y pedidos realizados.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={handleGoogleClick}
              className="w-full py-6 rounded-xl border border-input hover:bg-slate-50 transition-all font-medium text-sm flex items-center justify-center gap-3 shadow-sm hover:shadow"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoading ? "Conectando..." : "Iniciar sesión con Google"}</span>
            </Button>
          </TabsContent>

          <TabsContent value="admin" className="space-y-4 pt-4">
            <form onSubmit={handleAdminSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Email de Administración</label>
                <Input
                  type="email"
                  placeholder="admin@rosseboutique.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Contraseña</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="rounded-xl"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-5 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-all flex items-center justify-center gap-2 mt-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{isLoading ? "Iniciando..." : "Entrar al Panel de Control"}</span>
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
