import { createFileRoute, Outlet, useNavigate, useLocation, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { IsaferLogo } from "@/components/IsaferLogo";
import { Loader2, LayoutDashboard, ShoppingBag, Package, Settings, LogOut, Menu, X } from "lucide-react";
import { insforge } from "@/lib/insforge";

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ location }) => {
    if (location.pathname === "/admin/login") return;
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      const stored = localStorage.getItem("isafer_admin_session");
      if (!stored) {
        throw redirect({
          to: "/admin/login",
          replace: true,
        });
      }
    }
  },
  head: () => ({
    meta: [
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "Admin Isafer" },
      { name: "theme-color", content: "#fafafa" }
    ],
    links: [
      { rel: "manifest", href: "/admin-manifest.json" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" }
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
    } else if (!user && typeof window !== "undefined" && typeof localStorage !== "undefined" && !localStorage.getItem("isafer_admin_session") && !isLoginPage) {
      navigate({ to: "/admin/login", replace: true });
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

  if (isLoginPage) {
    return <Outlet />;
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-zinc-50">
        <Loader2 className="mb-4 size-10 animate-spin text-zinc-900" />
        <p className="text-sm font-semibold text-zinc-600 animate-pulse">Autenticando...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-rose-50/30 via-zinc-50 to-pink-50/20 font-sans text-zinc-900 selection:bg-rose-500/20">
      {/* Sidebar Desktop */}
      <aside className="hidden w-64 flex-col border-r border-rose-100/60 bg-white/90 backdrop-blur-xl md:flex z-20 shadow-[4px_0_24px_rgba(244,63,94,0.03)]">
        <div className="flex h-20 items-center justify-between px-6 border-b border-zinc-100/80">
          <IsaferLogo variant="header" size="sm" />
          <span className="text-[10px] font-black tracking-widest text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full uppercase border border-rose-200/50">
            PRO
          </span>
        </div>
        
        <div className="p-5 border-b border-zinc-100/80 bg-gradient-to-r from-rose-50/40 to-transparent">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 text-white font-extrabold shadow-md shadow-zinc-900/10 border border-zinc-700/50">
              C
            </div>
            <div>
              <p className="text-sm font-extrabold text-zinc-900 tracking-tight">Camila</p>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></span>
                Panel Activo
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 p-4">
          <p className="px-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Menú Principal</p>
          {NAV_ITEMS.map((item) => (
             <Link
               key={item.label}
               to={item.to}
               className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-extrabold text-zinc-500 hover:bg-rose-50/60 hover:text-rose-600 transition-all active:scale-95 [&.active]:bg-gradient-to-r [&.active]:from-zinc-900 [&.active]:to-zinc-800 [&.active]:text-white [&.active]:shadow-lg [&.active]:shadow-zinc-900/15"
               activeProps={{ className: "active" }}
             >
               <item.icon className="size-4.5" />
               {item.label}
             </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-zinc-100/80 space-y-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200/80 bg-rose-50/50 px-3 py-2.5 text-xs font-black uppercase tracking-wider text-rose-600 hover:bg-rose-100/70 transition-all active:scale-95 shadow-2xs"
          >
            Ver Tienda en Vivo ✨
          </a>
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer"
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
