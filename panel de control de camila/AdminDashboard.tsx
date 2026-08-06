import { useState, useEffect } from "react";
import { 
  Sparkles, 
  LayoutDashboard, 
  PackageSearch, 
  ShoppingBag, 
  PlusCircle, 
  RefreshCw, 
  X,
  ShieldCheck,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { 
  BackendOrder, 
  BackendProduct, 
  fetchProducts, 
  fetchAllOrders 
} from "../src/services/insforgeService";
import { BentoMetrics } from "./BentoMetrics";
import { StockManager } from "./StockManager";
import { OrderManager } from "./OrderManager";
import { ProductCreator } from "./ProductCreator";
import { AdminErrorBoundary } from "./AdminErrorBoundary";

interface AdminDashboardProps {
  onClose: () => void;
  onProductsUpdated?: () => void;
}

export function AdminDashboard({ onClose, onProductsUpdated }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "inventory" | "orders" | "add_product">("inventory");
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [prodsData, ordersData] = await Promise.all([
        fetchProducts(),
        fetchAllOrders(),
      ]);
      setProducts(prodsData || []);
      setOrders(ordersData || []);
      if (!silent) toast.success("Panel de Camila actualizado en tiempo real 💖");
    } catch (err) {
      toast.error("Error de conexión al cargar datos de la boutique.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleProductsUpdated = () => {
    loadData(true);
    if (onProductsUpdated) onProductsUpdated();
  };

  const tabs = [
    { id: "summary", label: "Resumen", icon: LayoutDashboard },
    { id: "inventory", label: "Inventario", icon: PackageSearch },
    { id: "orders", label: "Pedidos", icon: ShoppingBag },
    { id: "add_product", label: "Añadir", icon: PlusCircle },
  ] as const;

  return (
    <div className="w-full min-h-screen bg-zinc-950 text-zinc-100 flex flex-col lg:flex-row relative font-sans selection:bg-rose-500 selection:text-white">
      
      {/* 1. Header Fijo para Móviles y Tablets */}
      <header className="lg:hidden sticky top-0 bg-zinc-900/98 backdrop-blur-xl border-b border-zinc-800 px-4 py-3 z-50 flex flex-col gap-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white active:scale-95 transition-transform"
              title="Volver a la Web"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white leading-none flex items-center gap-1.5">
                Boutique Admin
                <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
              </h2>
              <span className="text-[10px] font-bold text-rose-400 mt-0.5 block">Panel de Camila 💖</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadData()}
              disabled={loading}
              className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-rose-400 active:scale-95 transition-all"
              title="Sincronizar DB"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-rose-500' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-rose-500/20"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* Móvil & Tablet Pestañas Superiores Táctiles */}
        <nav className="grid grid-cols-4 gap-1.5 p-1 bg-zinc-950 border border-zinc-850 rounded-2xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all cursor-pointer select-none active:scale-95 ${
                  isActive 
                    ? 'bg-rose-500 text-white font-black shadow-md shadow-rose-500/20' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[9px] font-bold uppercase tracking-wider truncate w-full text-center">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </header>

      {/* 2. Sidebar Lateral para Escritorio (lg+) */}
      <aside className="hidden lg:flex w-64 bg-zinc-900 border-r border-zinc-850 flex-col justify-between shrink-0 p-6 min-h-screen sticky top-0 z-30">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/25">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-widest text-white leading-none">Boutique Admin</h2>
              <span className="text-xs font-bold text-rose-400 mt-1 block">Panel de Camila 💖</span>
            </div>
          </div>

          <nav className="flex flex-col gap-2 pt-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/20' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-850/80'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-col gap-2.5 pt-6 border-t border-zinc-850">
          <button
            onClick={() => loadData()}
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full py-3 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-bold rounded-2xl transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-rose-500' : ''}`} />
            Sincronizar DB
          </button>
          
          <button
            onClick={onClose}
            className="w-full py-3 bg-zinc-850 hover:bg-zinc-800 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-colors border border-zinc-800 cursor-pointer"
          >
            Volver a la Web
          </button>
        </div>
      </aside>

      {/* 3. Área Principal de Contenido (Móvil, Tablet y Escritorio) */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Subencabezado Desktop */}
        <header className="hidden lg:flex sticky top-0 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-850 px-8 py-5 items-center justify-between z-20">
          <div>
            <h1 className="text-2xl font-serif font-black tracking-tight text-white flex items-center gap-2.5">
              {activeTab === 'summary' && "Resumen General"}
              {activeTab === 'inventory' && "Inventario de la Web"}
              {activeTab === 'orders' && "Pedidos de Clientas"}
              {activeTab === 'add_product' && "Añadir Nueva Prenda"}
              <Sparkles className="w-5 h-5 text-rose-450 animate-pulse" />
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              {activeTab === 'summary' && "Panel de rendimiento y métricas del negocio."}
              {activeTab === 'inventory' && "Ajusta existencias y actualiza precios en tiempo real."}
              {activeTab === 'orders' && "Historial de transacciones y estados de envío."}
              {activeTab === 'add_product' && "Crea y publica nuevos artículos en el catálogo."}
            </p>
          </div>

          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all cursor-pointer"
            title="Cerrar panel"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Viewport Contenedor con Scroll Fluido */}
        <section className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {loading ? (
            <div className="w-full min-h-[400px] flex flex-col items-center justify-center text-zinc-500 py-16">
              <RefreshCw className="w-12 h-12 animate-spin text-rose-500 mb-4" />
              <p className="text-sm font-black uppercase tracking-widest text-zinc-300">Cargando Datos de la Boutique...</p>
            </div>
          ) : (
            <AdminErrorBoundary onReset={() => loadData(true)}>
              {activeTab === "summary" && <BentoMetrics products={products} orders={orders} />}
              {activeTab === "inventory" && <StockManager products={products} onProductsUpdated={handleProductsUpdated} />}
              {activeTab === "orders" && <OrderManager orders={orders} onOrderUpdated={handleProductsUpdated} />}
              {activeTab === "add_product" && (
                <ProductCreator 
                  onProductCreated={() => {
                    handleProductsUpdated();
                    setActiveTab("inventory");
                  }} 
                  onCancel={() => setActiveTab("inventory")}
                />
              )}
            </AdminErrorBoundary>
          )}
        </section>
      </main>

    </div>
  );
}
