import { useState, useEffect } from "react";
import { 
  Sparkles, 
  LayoutDashboard, 
  PackageSearch, 
  ShoppingBag, 
  PlusCircle, 
  RefreshCw, 
  X,
  ShieldCheck
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

interface AdminDashboardProps {
  onClose: () => void;
  onProductsUpdated?: () => void;
}

export function AdminDashboard({ onClose, onProductsUpdated }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "inventory" | "orders" | "add_product">("summary");
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
      setProducts(prodsData);
      setOrders(ordersData);
      if (!silent) toast.success("Panel de datos actualizado en tiempo real.");
    } catch (err) {
      toast.error("Error de conexión al cargar datos del backend.");
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
    { id: "add_product", label: "Añadir Prenda", icon: PlusCircle },
  ] as const;

  return (
    <div className="w-full h-full min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row relative">
      
      {/* 1. Desktop Sidebar / Left panel */}
      <aside className="w-full md:w-64 bg-zinc-900 border-b md:border-b-0 md:border-r border-zinc-850 flex flex-col justify-between shrink-0 p-5 md:h-screen md:sticky md:top-0 z-30">
        <div className="space-y-6">
          
          {/* Logo & Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/20">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-white leading-none">Boutique Admin</h2>
                <span className="text-[9px] font-bold text-rose-400 mt-1 block">Panel de Camila 💖</span>
              </div>
            </div>
            
            {/* Close Button on Mobile Header */}
            <button 
              onClick={onClose}
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex flex-col gap-1.5 pt-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
                    isActive 
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/10' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Desktop Footer Actions */}
        <div className="hidden md:flex flex-col gap-2 pt-6 border-t border-zinc-850">
          <button
            onClick={() => loadData()}
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 text-zinc-400 hover:text-zinc-200 text-xs font-bold rounded-xl transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sincronizar DB
          </button>
          
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-zinc-850 hover:bg-zinc-800 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-colors border border-zinc-800"
          >
            Volver a la Web
          </button>
        </div>
      </aside>

      {/* 2. Main content viewport */}
      <main className="flex-1 flex flex-col min-w-0 md:h-screen md:overflow-y-auto">
        
        {/* Top Header details */}
        <header className="sticky top-0 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-850/80 px-6 py-4 flex items-center justify-between z-20">
          <div>
            <h1 className="text-xl font-serif font-black tracking-tight text-white flex items-center gap-2">
              {activeTab === 'summary' && "Resumen General"}
              {activeTab === 'inventory' && "Inventario de la Web"}
              {activeTab === 'orders' && "Pedidos de Clientas"}
              {activeTab === 'add_product' && "Añadir Nueva Prenda"}
              <Sparkles className="w-4 h-4 text-rose-450 animate-pulse" />
            </h1>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              {activeTab === 'summary' && "Panel de rendimiento y métricas del negocio."}
              {activeTab === 'inventory' && "Ajusta existencias y actualiza precios en tiempo real."}
              {activeTab === 'orders' && "Historial de transacciones y estados de envío."}
              {activeTab === 'add_product' && "Crea y publica nuevos artículos en el catálogo."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadData(true)}
              disabled={loading}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white"
              title="Refrescar datos"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            <button 
              onClick={onClose}
              className="hidden md:flex w-9 h-9 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white transition-colors"
              title="Cerrar panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* View render area */}
        <section className="flex-1 p-4 sm:p-6 pb-24 md:pb-6 max-w-6xl w-full mx-auto">
          {loading ? (
            <div className="w-full h-96 flex flex-col items-center justify-center text-zinc-500">
              <RefreshCw className="w-10 h-10 animate-spin text-rose-500 mb-3" />
              <p className="text-sm font-bold uppercase tracking-widest text-zinc-400">Sincronizando con InsForge...</p>
            </div>
          ) : (
            <>
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
            </>
          )}
        </section>
      </main>

      {/* 3. Mobile Navigation Bottom Bar (Floating Neo-brutalist Premium) */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 bg-zinc-900/96 backdrop-blur-xl border border-zinc-800/80 p-2.5 flex justify-between items-center z-[100] shadow-[0_12px_40px_rgba(0,0,0,0.5)] rounded-2xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-0 flex flex-col items-center gap-1.5 py-1.5 rounded-xl transition-all active:scale-95 cursor-pointer ${
                isActive ? 'text-rose-500 font-bold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'scale-110 text-rose-500' : ''}`} />
              <span className="text-[8px] font-black uppercase tracking-widest truncate w-full text-center">{tab.label}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
