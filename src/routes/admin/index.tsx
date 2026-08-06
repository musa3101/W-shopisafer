import { createFileRoute } from "@tanstack/react-router";
import { DollarSign, ShoppingBag, AlertTriangle, Layers, Clock, CheckCircle2, XCircle, MoreHorizontal } from "lucide-react";
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
      <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-600 border border-amber-200/50">
        <Clock className="size-3" /> Pendiente
      </span>
    );
  }
  if (status === "shipped" || status === "delivered") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600 border border-emerald-200/50">
        <CheckCircle2 className="size-3" /> Completado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 border border-red-200/50">
      <XCircle className="size-3" /> Cancelado
    </span>
  );
}

function AdminDashboard() {
  const { products, orders } = Route.useLoaderData();

  // Cálculos Reales
  const validOrders = (orders || []).filter(o => o.status !== "pending" && o.status !== "cancelled");
  const totalRevenue = validOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  const pendingOrders = (orders || []).filter(o => o.status === "pending" || o.status === "processing").length;
  const lowStockCount = (products || []).filter(p => (p.stock || 0) < 5).length;
  const totalProducts = (products || []).length;
  
  // Últimos pedidos reales
  const recentOrders = (orders || []).slice(0, 8);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-2">
          Dashboard <span className="text-rose-500">✨</span>
        </h1>
        <p className="text-zinc-500 font-medium">Métricas clave e inteligencia comercial en tiempo real.</p>
      </div>
      
      {/* Bento Grid: Métricas Reales */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Card: Ventas */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-zinc-200 flex flex-col justify-between group hover:border-zinc-300 transition-colors">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Ingresos Totales</p>
            <div className="size-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700 group-hover:bg-zinc-200 transition-colors">
              <DollarSign className="size-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-zinc-900 tracking-tight font-mono">
              ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1">
              Basado en {validOrders.length} pedidos completados
            </p>
          </div>
        </div>

        {/* Card: Pedidos Pendientes */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-zinc-200 flex flex-col justify-between group hover:border-zinc-300 transition-colors">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Pedidos Pendientes</p>
            <div className="size-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700 group-hover:bg-zinc-200 transition-colors">
              <ShoppingBag className="size-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-zinc-900 tracking-tight font-mono">{pendingOrders}</p>
            <p className="text-xs font-semibold text-zinc-500 mt-1">
              Requieren envío o procesamiento
            </p>
          </div>
        </div>

        {/* Card: Inventario Crítico */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-zinc-200 flex flex-col justify-between group hover:border-zinc-300 transition-colors">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Stock Crítico</p>
            <div className="size-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 group-hover:bg-rose-100 transition-colors">
              <AlertTriangle className="size-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className={`text-3xl font-black tracking-tight font-mono ${lowStockCount > 0 ? 'text-rose-600' : 'text-zinc-900'}`}>
              {lowStockCount}
            </p>
            <p className="text-xs font-semibold text-zinc-500 mt-1">
              Productos con menos de 5 u.
            </p>
          </div>
        </div>

        {/* Card: Catálogo */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-zinc-200 flex flex-col justify-between group hover:border-zinc-300 transition-colors">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Catálogo Total</p>
            <div className="size-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700 group-hover:bg-zinc-200 transition-colors">
              <Layers className="size-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-zinc-900 tracking-tight font-mono">{totalProducts}</p>
            <p className="text-xs font-semibold text-zinc-500 mt-1">
              Productos registrados en Insforge
            </p>
          </div>
        </div>

      </div>

      {/* Tabla de Datos Reales */}
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wide">Pedidos Recientes</h2>
          <span className="text-xs font-semibold text-rose-500 bg-rose-50 px-2.5 py-1 rounded-md">En vivo</span>
        </div>
        <div className="overflow-x-auto">
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-zinc-500 font-medium">No hay pedidos recientes en la base de datos.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 text-zinc-500 text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-6 py-3 border-b border-zinc-100">ID</th>
                  <th className="px-6 py-3 border-b border-zinc-100">Cliente</th>
                  <th className="px-6 py-3 border-b border-zinc-100">Fecha</th>
                  <th className="px-6 py-3 border-b border-zinc-100">Monto</th>
                  <th className="px-6 py-3 border-b border-zinc-100">Estado</th>
                  <th className="px-6 py-3 border-b border-zinc-100 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-50 transition-colors group">
                    <td className="px-6 py-3.5 font-mono text-xs font-bold text-zinc-900">
                      #{order.id.slice(0, 6).toUpperCase()}
                    </td>
                    <td className="px-6 py-3.5 text-xs font-semibold text-zinc-700">
                      {order.customer_name}
                      <span className="block text-[10px] font-normal text-zinc-400">{order.customer_email}</span>
                    </td>
                    <td className="px-6 py-3.5 text-xs font-medium text-zinc-500">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('es-ES') : "Reciente"}
                    </td>
                    <td className="px-6 py-3.5 text-xs font-black text-zinc-900 font-mono">
                      ${Number(order.total_amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button className="text-zinc-400 hover:text-zinc-900 transition-colors p-1.5 rounded-md hover:bg-zinc-100 opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer">
                        <MoreHorizontal className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

