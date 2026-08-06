import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  TrendingDown
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { BackendOrder, BackendProduct } from "../src/services/insforgeService";

interface BentoMetricsProps {
  products: BackendProduct[];
  orders: BackendOrder[];
}

export function BentoMetrics({ products, orders }: BentoMetricsProps) {
  const safeOrders = orders || [];
  const safeProducts = products || [];

  // Calculations
  const totalRevenue = safeOrders.reduce((sum, o) => sum + (Number(o?.total_amount) || 0), 0);
  const totalOrders = safeOrders.length;
  const lowStockCount = safeProducts.filter((p) => (p?.stock || 0) < 5).length;
  const stripeOrders = safeOrders.filter((o) => o?.stripe_session_id && o?.stripe_session_id !== 'pending_session');
  const stripeRevenue = stripeOrders.reduce((sum, o) => sum + (Number(o?.total_amount) || 0), 0);
  
  // Format orders by date for chart
  const orderDates = safeOrders
    .map(o => {
      const date = o.created_at ? new Date(o.created_at) : new Date();
      return {
        dateStr: date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
        amount: Number(o.total_amount) || 0,
        timestamp: date.getTime()
      };
    })
    .sort((a, b) => a.timestamp - b.timestamp);

  // Group by date to sum amounts
  const groupedDataMap: Record<string, number> = {};
  orderDates.forEach(o => {
    groupedDataMap[o.dateStr] = (groupedDataMap[o.dateStr] || 0) + o.amount;
  });

  const chartData = Object.entries(groupedDataMap).map(([name, value]) => ({
    name,
    Ventas: parseFloat(value.toFixed(2))
  })).slice(-7); // Last 7 active days

  // Default data if no orders yet
  const displayChartData = chartData.length > 0 ? chartData : [
    { name: "Lun", Ventas: 0 },
    { name: "Mar", Ventas: 0 },
    { name: "Mié", Ventas: 0 },
    { name: "Jue", Ventas: 0 },
    { name: "Vie", Ventas: 0 },
    { name: "Sáb", Ventas: 0 },
    { name: "Dom", Ventas: 0 }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-auto">
      
      {/* 1. Bento Card: Total Revenue (Main Highlight) */}
      <div className="md:col-span-2 relative overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 p-6 flex flex-col justify-between group hover:border-rose-500/30 transition-all duration-300 shadow-xl shadow-black/40 z-0">
        <div className="absolute right-[-15px] top-[-15px] text-rose-500 opacity-[0.03] group-hover:scale-105 transition-transform duration-500 pointer-events-none z-0">
          <DollarSign className="w-48 h-48 stroke-[1]" />
        </div>
        
        <div className="flex items-center justify-between z-10 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-rose-450 uppercase tracking-widest">
                Ingresos Totales
              </p>
              <h3 className="text-3xl font-black text-white font-mono mt-1">
                ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span className="text-xs font-medium text-rose-400 ml-1">USD</span>
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5" /> +12.4%
          </div>
        </div>

        {/* Recharts Sales Evolution Chart */}
        <div className="w-full h-44 mt-6 z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }}
                labelStyle={{ color: '#a1a1aa', fontWeight: 'bold' }}
                itemStyle={{ color: '#f43f5e' }}
              />
              <Area type="monotone" dataKey="Ventas" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Bento Card: Pedidos Recibidos */}
      <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 flex flex-col justify-between relative overflow-hidden group hover:border-amber-450/30 transition-all duration-300 shadow-xl shadow-black/40 z-0">
        <div className="absolute right-[-15px] top-[-15px] text-amber-500 opacity-[0.03] group-hover:scale-105 transition-transform duration-500 pointer-events-none z-0">
          <ShoppingBag className="w-36 h-36 stroke-[1]" />
        </div>

        <div className="flex items-center justify-between z-10 relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-450 to-amber-550 text-black flex items-center justify-center shadow-lg shadow-amber-500/20">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">PEDIDOS</span>
        </div>

        <div className="mt-8 z-10">
          <p className="text-xs text-zinc-400">Total Transacciones</p>
          <h4 className="text-4xl font-black text-white font-mono mt-1">
            {totalOrders}
          </h4>
          <div className="flex items-center gap-1 mt-2 text-[10px] text-zinc-500">
            <span className="font-semibold text-amber-400">{safeOrders.filter(o => o?.status === 'pending').length} pendientes</span>
            <span>•</span>
            <span>{safeOrders.filter(o => o?.status === 'delivered').length} completados</span>
          </div>
        </div>
      </div>

      {/* 3. Bento Card: Alerta Stock Bajo */}
      <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 flex flex-col justify-between relative overflow-hidden group hover:border-rose-650/30 transition-all duration-300 shadow-xl shadow-black/40 z-0">
        <div className="absolute right-[-15px] top-[-15px] text-rose-500 opacity-[0.03] group-hover:scale-105 transition-transform duration-500 pointer-events-none z-0">
          <AlertTriangle className="w-36 h-36 stroke-[1]" />
        </div>

        <div className="flex items-center justify-between z-10 relative">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-450 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-rose-450 uppercase tracking-widest">ALERTAS</span>
        </div>

        <div className="mt-8 z-10">
          <p className="text-xs text-zinc-400">Prendas con Stock Bajo</p>
          <h4 className={`text-4xl font-black font-mono mt-1 ${lowStockCount > 0 ? 'text-rose-500' : 'text-emerald-450'}`}>
            {lowStockCount}
          </h4>
          <p className="text-[10px] text-zinc-500 mt-2">
            {lowStockCount > 0 ? "Requiere reabastecimiento urgente" : "Todo el inventario óptimo"}
          </p>
        </div>
      </div>

      {/* 4. Bento Card: Métodos de Pago */}
      <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 flex flex-col justify-between relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300 shadow-xl shadow-black/40 z-0">
        <div className="absolute right-[-15px] top-[-15px] text-indigo-500 opacity-[0.03] group-hover:scale-105 transition-transform duration-500 pointer-events-none z-0">
          <Layers className="w-36 h-36 stroke-[1]" />
        </div>

        <div className="flex items-center justify-between z-10 relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">PAGOS</span>
        </div>

        <div className="mt-8 z-10">
          <p className="text-xs text-zinc-400">Canal Digital Stripe</p>
          <h4 className="text-2xl font-black text-white font-mono mt-1">
            ${stripeRevenue.toFixed(2)} <span className="text-xs font-normal text-zinc-400">USD</span>
          </h4>
          <p className="text-[10px] text-zinc-500 mt-2">
            {stripeOrders.length} pedidos pagados con tarjeta 💳
          </p>
        </div>
      </div>

      {/* 5. Bento Card: Rendimiento del Negocio */}
      <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300 shadow-xl shadow-black/40 z-0">
        <div className="absolute right-[-15px] top-[-15px] text-emerald-500 opacity-[0.03] group-hover:scale-105 transition-transform duration-500 pointer-events-none z-0">
          <TrendingUp className="w-36 h-36 stroke-[1]" />
        </div>

        <div className="flex items-center justify-between z-10 relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-emerald-450 uppercase tracking-widest">STATUS</span>
        </div>

        <div className="mt-8 z-10">
          <p className="text-xs text-zinc-400">Tasa de Entrega</p>
          <h4 className="text-3xl font-black text-white font-mono mt-1">
            {totalOrders > 0 ? ((safeOrders.filter(o => o?.status !== 'cancelled').length / totalOrders) * 100).toFixed(0) : 0}%
          </h4>
          <p className="text-[10px] text-zinc-500 mt-2">
            Pedidos activos excluyendo cancelaciones
          </p>
        </div>
      </div>

    </div>
  );
}
