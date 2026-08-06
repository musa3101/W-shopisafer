import { createFileRoute, Outlet, useNavigate, useLocation, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { IsaferLogo } from "@/components/IsaferLogo";
import { Loader2, LayoutDashboard, ShoppingBag, Package, Settings, LogOut, Menu, X } from "lucide-react";
import { insforge } from "@/lib/insforge";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "Admin Isafer" },
      { name: "theme-color", content: "#fafafa" }
    ],
    links: [
      { rel: "manifest", href: "/admin-manifest.json" },
      { rel: "apple-touch-icon", href: "/favicon.png" }
    ]
  }),
  component: AdminLayout,
});

const NAV_ITEMS = [
  { label: "Resumen", icon: LayoutDashboard, to: "/admin" },
  { label: "Pedidos", icon: ShoppingBag, to: "/admin/pedidos" },
  { label: "Catálogo", icon: Package, to: "/admin/catalogo" },
  { label: "Ajustes", icon: Settings, to: "/admin/ajustes" },
];

function AdminLayout() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoginPage = location.pathname === "/admin/login";

  useEffect(() => {
    if (!loading) {
      if (!user && !isLoginPage) {
        navigate({ to: "/admin/login", replace: true });
      } else if (user && !isAdmin && !isLoginPage) {
        navigate({ to: "/", replace: true });
      } else if (user && isAdmin && isLoginPage) {
        navigate({ to: "/admin", replace: true });
      }
    }
  }, [user, loading, isAdmin, isLoginPage, navigate]);

  // Registrar Service Worker para notificaciones Push PWA
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator && user && isAdmin) {
      navigator.serviceWorker.register("/sw.js")
        .then((reg) => console.log("✓ Service Worker registrado para Admin PWA:", reg.scope))
        .catch((err) => console.error("❌ Error al registrar el Service Worker:", err));
    }
  }, [user, isAdmin]);

  const handleLogout = async () => {
    await insforge.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-zinc-50">
        <Loader2 className="mb-4 size-10 animate-spin text-zinc-900" />
        <p className="text-sm font-semibold text-zinc-600 animate-pulse">Autenticando...</p>
      </div>
    );
  }

  if (isLoginPage) {
    return <Outlet />;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full bg-zinc-50 font-sans text-zinc-900">
      {/* Sidebar Desktop */}
      <aside className="hidden w-64 flex-col border-r border-zinc-200 bg-white md:flex z-20">
        <div className="flex h-16 items-center px-6 border-b border-zinc-100">
          <IsaferLogo variant="header" size="sm" />
        </div>
        
        <div className="p-5 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-zinc-900 text-white font-bold">
              C
            </div>
            <div>
              <p className="text-sm font-extrabold text-zinc-900 tracking-tight">Camila</p>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
                Conectada
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {NAV_ITEMS.map((item) => (
             <Link
               key={item.label}
               to={item.to}
               className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-zinc-500 hover:bg-zinc-100/50 hover:text-zinc-900 transition-colors [&.active]:bg-zinc-900 [&.active]:text-white shadow-sm [&.active]:shadow-md"
               activeProps={{ className: "active" }}
             >
               <item.icon className="size-4.5" />
               {item.label}
             </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-zinc-100">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-zinc-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
          >
            <LogOut className="size-4.5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 md:hidden z-30 sticky top-0 shadow-sm">
          <IsaferLogo variant="header" size="sm" />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-md p-2 text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </header>

        {/* Mobile Menu Backdrop & Nav */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 top-16 z-20 flex flex-col bg-zinc-50 md:hidden animate-in fade-in slide-in-from-top-2">
            <nav className="flex-1 space-y-2 p-6">
              {NAV_ITEMS.map((item) => (
                 <Link
                   key={item.label}
                   to={item.to}
                   onClick={() => setMobileMenuOpen(false)}
                   className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-extrabold text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 [&.active]:bg-zinc-900 [&.active]:text-white shadow-sm"
                 >
                   <item.icon className="size-5" />
                   {item.label}
                 </Link>
              ))}
            </nav>
            <div className="p-6 border-t border-zinc-200 pb-12">
              <button 
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-3 rounded-xl px-4 py-3.5 text-base font-black text-white bg-red-600 hover:bg-red-700 shadow-md cursor-pointer"
              >
                <LogOut className="size-5" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
