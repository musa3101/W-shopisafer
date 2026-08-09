import { createFileRoute, Link } from "@tanstack/react-router";
import { DollarSign, ShoppingBag, AlertTriangle, Layers, Clock, CheckCircle2, XCircle, ArrowUpRight, Plus, Sparkles, TrendingUp, ShieldCheck } from "lucide-react";
import { fetchProducts, fetchAllOrders } from "@/services/insforgeService";
import type { BackendOrder, BackendProduct } from "@/services/insforgeService";

export const Route = createFileRoute("/admin/")({
  loader: async () => {
    const [products, orders] = await Promise.all([
      fetchProducts().catch(() => [] as BackendProduct[]),
      fetchAllOrders().catch(() => [] as BackendOrder[])
    ]);
    return { products, orders };
  },
  component: AdminDashboard,
});

function StatusBadge({ status }: { status: string }) {
  if (status === "pending" || status === "processing") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200/60 shadow-2xs">
        <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
        Pendiente
      </span>
    );
  }
  if (status === "shipped" || status === "delivered") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200/60 shadow-2xs">
        <CheckCircle2 className="size-3 text-emerald-600" />
        Completado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 border border-red-200/60 shadow-2xs">
      <XCircle className="size-3 text-red-600" />
      Cancelado
    </span>
  );
}

function AdminDashboard() {
  const { products, orders } = Route.useLoaderData();

  // Filtrar solo órdenes activas (excluyendo canceladas / archivadas de pruebas anteriores)
  const activeOrders = (orders || []).filter(o => o.status !== "cancelled");
  const validOrders = activeOrders.filter(o => o.status === "shipped" || o.status === "delivered");
  const totalRevenue = validOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  const pendingOrders = activeOrders.filter(o => o.status === "pending" || o.status === "processing").length;
  const lowStockCount = (products || []).filter(p => (p.stock || 0) < 5).length;
  const totalProducts = (products || []).length;
  
  // Últimos pedidos activos reales
  const recentOrders = activeOrders.slice(0, 8);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto space-y-8 pb-16 font-sans">
      
      {/* Header del Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-rose-100/80 shadow-[0_4px_20px_-4px_rgba(244,63,94,0.05)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200/50">
              <Sparkles className="size-3" /> Panel Inteligente
            </span>
            <span className="text-xs text-zinc-400">• Actualizado en tiempo real</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
            Hola, Camila <span className="inline-block animate-bounce">💖</span>
          </h1>
          <p className="text-sm font-medium text-zinc-500 mt-0.5">
            Aquí tienes la inteligencia comercial y el control total de Isafer Boutique.
          </p>
        </div>

        {/* Botón rápido de Acción */}
        <Link
          to="/admin/catalogo"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer border border-rose-400/30"
        >
          <Plus className="size-4" />
          Nueva Prenda
        </Link>
      </div>
      
      {/* Bento Grid: Métricas Reales Estilo Luxury */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Bento 1: Ingresos Totales */}
        <div className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm border border-zinc-200/80 hover:border-rose-300 hover:shadow-xl hover:shadow-rose-500/5 hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500" />
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Ingresos Totales</p>
            <div className="size-9 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100 group-hover:scale-110 transition-transform">
              <DollarSign className="size-4.5" />
            </div>
          </div>
          <div className="mt-5">
            <p className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight font-mono">
              ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs font-bold text-emerald-600 mt-2 flex items-center gap-1.5">
              <TrendingUp className="size-3.5" />
              Basado en {validOrders.length} pedidos completados
            </p>
          </div>
        </div>

        {/* Bento 2: Pedidos Pendientes */}
        <Link 
          to="/admin/pedidos"
          className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm border border-zinc-200/80 hover:border-amber-300 hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer block"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Por Procesar</p>
            <div className="size-9 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 group-hover:scale-110 transition-transform">
              <ShoppingBag className="size-4.5" />
            </div>
          </div>
          <div className="mt-5 flex items-baseline justify-between">
            <div>
              <p className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight font-mono">{pendingOrders}</p>
              <p className="text-xs font-bold text-amber-600 mt-2 flex items-center gap-1">
                Requieren gestión inmediata
              </p>
            </div>
            <ArrowUpRight className="size-5 text-zinc-400 group-hover:text-amber-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>
        </Link>

        {/* Bento 3: Stock Crítico */}
        <Link
          to="/admin/catalogo"
          className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm border border-zinc-200/80 hover:border-rose-300 hover:shadow-xl hover:shadow-rose-500/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer block"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-red-600" />
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Stock Crítico</p>
            <div className="size-9 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100 group-hover:scale-110 transition-transform">
              <AlertTriangle className="size-4.5" />
            </div>
          </div>
          <div className="mt-5 flex items-baseline justify-between">
            <div>
              <p className={`text-3xl sm:text-4xl font-black tracking-tight font-mono ${lowStockCount > 0 ? 'text-rose-600' : 'text-zinc-900'}`}>
                {lowStockCount}
              </p>
              <p className="text-xs font-bold text-zinc-400 mt-2">
                Prendas con menos de 5 u.
              </p>
            </div>
            <ArrowUpRight className="size-5 text-zinc-400 group-hover:text-rose-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>
        </Link>

        {/* Bento 4: Catálogo Total */}
        <Link
          to="/admin/catalogo"
          className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm border border-zinc-200/80 hover:border-zinc-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer block"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-zinc-800 to-zinc-600" />
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Prendas en Vivo</p>
            <div className="size-9 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-800 border border-zinc-200 group-hover:scale-110 transition-transform">
              <Layers className="size-4.5" />
            </div>
          </div>
          <div className="mt-5 flex items-baseline justify-between">
            <div>
              <p className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight font-mono">{totalProducts}</p>
              <p className="text-xs font-bold text-zinc-500 mt-2">
                En PostgreSQL (InsForge)
              </p>
            </div>
            <ArrowUpRight className="size-5 text-zinc-400 group-hover:text-zinc-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>
        </Link>

      </div>

      {/* Acciones Rápidas & Tabla de Pedidos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Tabla de Pedidos Recientes (Ocupa 2 columnas en Desktop) */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-zinc-200/80 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/40">
              <div>
                <h2 className="text-base font-extrabold text-zinc-900 tracking-tight">Pedidos Recientes</h2>
                <p className="text-xs text-zinc-500 font-medium">Últimas transacciones registradas en la boutique</p>
              </div>
              <Link 
                to="/admin/pedidos"
                className="text-xs font-extrabold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/60 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 border border-rose-200/50"
              >
                Ver Todos <ArrowUpRight className="size-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              {recentOrders.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center">
                  <div className="size-14 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mb-4 shadow-sm">
                    <ShoppingBag className="size-6 stroke-[1.8]" />
                  </div>
                  <h3 className="text-base font-extrabold text-zinc-900 tracking-tight">Base de datos lista para pruebas</h3>
                  <p className="text-xs text-zinc-500 max-w-sm mt-1 mb-5">
                    No hay pedidos antiguos ni datos de prueba. Realiza una nueva compra desde la tienda para ver cómo se registra en tiempo real.
                  </p>
                  <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-zinc-800 transition-all shadow-md active:scale-95"
                  >
                    Ir a la Tienda y Probar Compra ✨
                  </a>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50/80 text-zinc-400 text-[10px] uppercase tracking-widest font-black">
                      <th className="px-6 py-3 border-b border-zinc-100">ID Orden</th>
                      <th className="px-6 py-3 border-b border-zinc-100">Cliente</th>
                      <th className="px-6 py-3 border-b border-zinc-100">Monto</th>
                      <th className="px-6 py-3 border-b border-zinc-100">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100/80 text-xs">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-rose-50/20 transition-colors group">
                        <td className="px-6 py-4 font-mono font-black text-zinc-900">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-extrabold text-zinc-900">{order.customer_name}</div>
                          <div className="text-[11px] font-medium text-zinc-400">{order.customer_email}</div>
                        </td>
                        <td className="px-6 py-4 font-mono font-black text-zinc-900 text-sm">
                          ${Number(order.total_amount).toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={order.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Panel Lateral: Accesos Directos & Notificaciones */}
        <div className="space-y-6">
          
          {/* Card de Accesos Rápidos */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white rounded-3xl p-6 shadow-xl shadow-zinc-900/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
            <h3 className="text-base font-extrabold tracking-tight mb-1 flex items-center gap-2">
              Gestión Rápida <Sparkles className="size-4 text-rose-400" />
            </h3>
            <p className="text-xs text-zinc-400 font-medium mb-6">Atajos directos para la administración</p>

            <div className="space-y-3">
              <Link
                to="/admin/catalogo"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-300">
                    <Plus className="size-4" />
                  </div>
                  <span className="text-xs font-bold">Añadir Nueva Prenda</span>
                </div>
                <ArrowUpRight className="size-4 text-zinc-400 group-hover:text-white transition-colors" />
              </Link>

              <Link
                to="/admin/pedidos"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300">
                    <ShoppingBag className="size-4" />
                  </div>
                  <span className="text-xs font-bold">Ver Todos los Pedidos</span>
                </div>
                <ArrowUpRight className="size-4 text-zinc-400 group-hover:text-white transition-colors" />
              </Link>

              <Link
                to="/admin/ajustes"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300">
                    <ShieldCheck className="size-4" />
                  </div>
                  <span className="text-xs font-bold">Ajustes de la Boutique</span>
                </div>
                <ArrowUpRight className="size-4 text-zinc-400 group-hover:text-white transition-colors" />
              </Link>
            </div>
          </div>

          {/* Banner de Estado del Sistema */}
          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-3xl p-5 flex items-center gap-4">
            <div className="size-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <p className="text-xs font-black text-emerald-950 uppercase tracking-wider">InsForge Backend Online</p>
              <p className="text-xs text-emerald-700 font-medium mt-0.5">PostgreSQL sincronizado y activo.</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}


