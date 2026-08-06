import { useState } from "react";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  AlertTriangle,
  Layers,
  FileSpreadsheet,
  Printer,
  BarChart3,
  PieChart as PieIcon,
  Award,
  Sparkles,
  ArrowUpRight
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from "recharts";
import { BackendOrder, BackendProduct } from "../src/services/insforgeService";
import { exportToCSV, printReport, ExportColumn } from "../src/lib/exportUtils";

interface BentoMetricsProps {
  products: BackendProduct[];
  orders: BackendOrder[];
}

export function BentoMetrics({ products, orders }: BentoMetricsProps) {
  const [timeRange, setTimeRange] = useState<"7days" | "30days" | "monthly">("7days");

  const safeOrders = orders || [];
  const safeProducts = products || [];

  // Filter out pending and cancelled orders for revenue calculation
  const validOrders = safeOrders.filter((o) => o?.status !== "pending" && o?.status !== "cancelled");

  // Calculations
  const totalRevenue = validOrders.reduce((sum, o) => sum + (Number(o?.total_amount) || 0), 0);
  const totalOrders = validOrders.length;
  const lowStockCount = safeProducts.filter((p) => (p?.stock || 0) < 5).length;
  const stripeOrders = validOrders.filter((o) => o?.stripe_session_id && o?.stripe_session_id !== 'pending_session');
  const stripeRevenue = stripeOrders.reduce((sum, o) => sum + (Number(o?.total_amount) || 0), 0);
  
  // Advanced Metrics
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const maxOrderValue = validOrders.reduce((max, o) => Math.max(max, Number(o?.total_amount) || 0), 0);
  const completedOrders = validOrders.filter(o => o?.status === 'delivered' || o?.status === 'shipped').length;

  // Format orders for chart based on time range
  const now = new Date();
  const getFilteredOrders = () => {
    return validOrders.filter(o => {
      if (!o.created_at) return true;
      const orderDate = new Date(o.created_at);
      const diffTime = Math.abs(now.getTime() - orderDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (timeRange === "7days") return diffDays <= 7;
      if (timeRange === "30days") return diffDays <= 30;
      return true; // monthly or all
    });
  };

  const chartOrders = getFilteredOrders();

  // Group by Date or Month
  const groupedDataMap: Record<string, { total: number; count: number }> = {};
  
  chartOrders.forEach(o => {
    const date = o.created_at ? new Date(o.created_at) : new Date();
    let key = date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
    if (timeRange === "monthly") {
      key = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    }
    
    if (!groupedDataMap[key]) {
      groupedDataMap[key] = { total: 0, count: 0 };
    }
    groupedDataMap[key].total += Number(o.total_amount) || 0;
    groupedDataMap[key].count += 1;
  });

  const chartData = Object.entries(groupedDataMap).map(([name, data]) => ({
    name,
    Ventas: parseFloat(data.total.toFixed(2)),
    Pedidos: data.count
  }));

  // Fallback demo data if no orders
  const displayChartData = chartData.length > 0 ? chartData : [
    { name: "Lun", Ventas: 0, Pedidos: 0 },
    { name: "Mar", Ventas: 0, Pedidos: 0 },
    { name: "Mié", Ventas: 0, Pedidos: 0 },
    { name: "Jue", Ventas: 0, Pedidos: 0 },
    { name: "Vie", Ventas: 0, Pedidos: 0 },
    { name: "Sáb", Ventas: 0, Pedidos: 0 },
    { name: "Dom", Ventas: 0, Pedidos: 0 }
  ];

  // Status Distribution Data for Bar Chart
  const statusCounts = {
    Pendientes: safeOrders.filter(o => o?.status === 'pending').length,
    Procesando: safeOrders.filter(o => o?.status === 'processing').length,
    Enviados: safeOrders.filter(o => o?.status === 'shipped').length,
    Entregados: safeOrders.filter(o => o?.status === 'delivered').length,
    Cancelados: safeOrders.filter(o => o?.status === 'cancelled').length,
  };

  const statusChartData = [
    { name: "Pendientes", total: statusCounts.Pendientes, color: "#f59e0b" },
    { name: "Procesando", total: statusCounts.Procesando, color: "#6366f1" },
    { name: "Enviados", total: statusCounts.Enviados, color: "#10b981" },
    { name: "Entregados", total: statusCounts.Entregados, color: "#06b6d4" },
    { name: "Cancelados", total: statusCounts.Cancelados, color: "#f43f5e" },
  ];

  // Export Executive Summary
  const handleExportCSV = () => {
    const cols: ExportColumn<BackendOrder>[] = [
      { header: "ID Pedido", accessor: o => (o.id || "").slice(0, 8) },
      { header: "Cliente", accessor: o => o.customer_name || "Anónimo" },
      { header: "Email", accessor: o => o.customer_email || "" },
      { header: "Estado", accessor: o => o.status || "" },
      { header: "Monto USD", accessor: o => (Number(o.total_amount) || 0).toFixed(2) },
      { header: "Fecha", accessor: o => o.created_at ? new Date(o.created_at).toLocaleString('es-ES') : "" }
    ];
    exportToCSV("Resumen_Ejecutivo_Ventas", cols, safeOrders);
  };

  const handleExportPDF = () => {
    const cols: ExportColumn<BackendOrder>[] = [
      { header: "ID Pedido", accessor: o => `#${(o.id || "").slice(0, 8)}` },
      { header: "Cliente", accessor: o => o.customer_name || "Anónimo" },
      { header: "Email / Dirección", accessor: o => `${o.customer_email || ''} - ${o.shipping_address || ''}` },
      { header: "Estado", accessor: o => (o.status || "").toUpperCase() },
      { header: "Monto", accessor: o => `$${(Number(o.total_amount) || 0).toFixed(2)} USD` },
    ];
    printReport(
      "Reporte Ejecutivo de Rendimiento y Ventas",
      "Métricas globales e historial de transacciones de la boutique",
      cols,
      safeOrders,
      [
        { label: "Ingresos Totales", value: `$${totalRevenue.toFixed(2)} USD` },
        { label: "Total Pedidos", value: `${totalOrders}` },
        { label: "Ticket Promedio", value: `$${avgOrderValue.toFixed(2)} USD` },
        { label: "Tasa de Cumplimiento", value: `${totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(0) : 0}%` }
      ]
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Barra Superior con Acciones de Exportación y Filtros */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
            <BarChart3 className="w-5.5 h-5.5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white uppercase tracking-widest flex items-center gap-2 leading-none">
              Métricas Avanzadas
              <Sparkles className="w-4 h-4 text-amber-450 animate-pulse" />
            </h3>
            <p className="text-xs text-zinc-400 mt-1">Rendimiento en tiempo real e inteligencia comercial para Camila.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 text-zinc-200 text-xs font-black tracking-wider transition-all active:scale-95 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Excel (CSV)
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-rose-500/20 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Reporte PDF
          </button>
        </div>
      </div>

      {/* Grid Bento Principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 auto-rows-auto">
        
        {/* 1. Bento Card: Evolución de Ventas (Main Highlight) */}
        <div className="md:col-span-2 relative overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 p-6 sm:p-8 flex flex-col justify-between group hover:border-rose-500/30 transition-all duration-300 shadow-2xl">
          
          {/* Header de la tarjeta */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10">
            <div>
              <span className="text-[10px] font-black text-rose-450 uppercase tracking-widest block">
                INGRESOS TOTALES EN TIENDA
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl sm:text-4xl font-black text-rose-500 font-mono">$</span>
                <h3 className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight leading-none">
                  {totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
                <span className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">USD</span>
              </div>
            </div>

            {/* Controles de periodo */}
            <div className="flex items-center gap-1.5 bg-zinc-950 p-1.5 border border-zinc-800 rounded-2xl self-start sm:self-auto">
              <button
                onClick={() => setTimeRange("7days")}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  timeRange === '7days' ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20' : 'text-zinc-400 hover:text-white'
                }`}
              >
                7 días
              </button>
              <button
                onClick={() => setTimeRange("30days")}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  timeRange === '30days' ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20' : 'text-zinc-400 hover:text-white'
                }`}
              >
                30 días
              </button>
              <button
                onClick={() => setTimeRange("monthly")}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  timeRange === 'monthly' ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Mensual
              </button>
            </div>
          </div>

          {/* Gráfico Recharts de Evolución de Ventas */}
          <div className="w-full h-56 mt-8 z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                  labelStyle={{ color: '#a1a1aa', fontWeight: 'bold', fontSize: '12px' }}
                  itemStyle={{ color: '#f43f5e', fontWeight: 'bold' }}
                  formatter={(value: unknown) => [`$${Number(value).toFixed(2)} USD`, 'Ventas']}
                />
                <Area type="monotone" dataKey="Ventas" stroke="#f43f5e" strokeWidth={3.5} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Bento Card: Distribución de Estados de Pedido */}
        <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 flex flex-col justify-between relative overflow-hidden group hover:border-amber-450/30 transition-all duration-300 shadow-xl">
          <div className="flex items-center justify-between z-10 relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-450 to-amber-550 text-black flex items-center justify-center shadow-lg shadow-amber-500/20">
              <PieIcon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">ESTADOS DE PEDIDOS</span>
          </div>

          <div className="w-full h-44 mt-4 z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '14px' }}
                  itemStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                />
                <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 z-10 pt-3 border-t border-zinc-850 flex items-center justify-between text-xs text-zinc-400">
            <span>Total Pedidos: <strong className="text-white font-mono font-black">{totalOrders}</strong></span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {completedOrders} completados
            </span>
          </div>
        </div>

        {/* 3. Bento Card: Ticket Promedio de Venta */}
        <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 flex flex-col justify-between relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300 shadow-xl">
          <div className="flex items-center justify-between z-10 relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">TICKET PROMEDIO</span>
          </div>

          <div className="mt-6 z-10">
            <p className="text-xs text-zinc-400 font-medium">Valor Medio por Compra</p>
            <h4 className="text-4xl font-black text-white font-mono mt-1 tracking-tight">
              ${avgOrderValue.toFixed(2)} <span className="text-xs font-normal text-zinc-400">USD</span>
            </h4>
            <div className="mt-4 p-3.5 bg-zinc-950 rounded-2xl border border-zinc-850 text-xs text-zinc-400 flex justify-between items-center">
              <span className="font-semibold">Pedido de Mayor Valor:</span>
              <span className="font-mono font-black text-emerald-400">${maxOrderValue.toFixed(2)} USD</span>
            </div>
          </div>
        </div>

        {/* 4. Bento Card: Alerta Stock Bajo */}
        <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 flex flex-col justify-between relative overflow-hidden group hover:border-rose-650/30 transition-all duration-300 shadow-xl">
          <div className="flex items-center justify-between z-10 relative">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-450 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
            </div>
            <span className="text-[10px] font-black text-rose-450 uppercase tracking-widest">INVENTARIO CRÍTICO</span>
          </div>

          <div className="mt-6 z-10">
            <p className="text-xs text-zinc-400 font-medium">Prendas con Stock Bajo (&lt; 5 u.)</p>
            <h4 className={`text-4xl font-black font-mono mt-1 tracking-tight ${lowStockCount > 0 ? 'text-rose-500' : 'text-emerald-450'}`}>
              {lowStockCount}
            </h4>
            <p className="text-xs text-zinc-500 mt-2 font-medium">
              {lowStockCount > 0 ? "Requiere reabastecimiento en catálogo" : "Todo el inventario en estado óptimo"}
            </p>
          </div>
        </div>

        {/* 5. Bento Card: Canal Stripe & Rendimiento */}
        <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300 shadow-xl">
          <div className="flex items-center justify-between z-10 relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-emerald-450 uppercase tracking-widest">PAGOS TARJETA (STRIPE)</span>
          </div>

          <div className="mt-6 z-10">
            <p className="text-xs text-zinc-400 font-medium">Ingresos Procesados por Checkout</p>
            <h4 className="text-3xl font-black text-white font-mono mt-1 tracking-tight">
              ${stripeRevenue.toFixed(2)} <span className="text-xs font-normal text-zinc-400">USD</span>
            </h4>
            <p className="text-xs text-zinc-500 mt-2 font-medium flex items-center gap-1.5">
              <span>💳</span> {stripeOrders.length} transacciones completadas
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
