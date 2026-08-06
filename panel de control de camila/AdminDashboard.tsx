import { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  LayoutDashboard, 
  PackageSearch, 
  ShoppingBag, 
  PlusCircle, 
  RefreshCw, 
  X,
  ShieldCheck,
  ArrowLeft,
  Volume2,
  VolumeX,
  ChevronRight
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
import { audioNotifier } from "../src/lib/audioNotifier";

interface AdminDashboardProps {
  onClose: () => void;
  onProductsUpdated?: () => void;
}

export function AdminDashboard({ onClose, onProductsUpdated }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "inventory" | "orders" | "add_product">("inventory");
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [soundOn, setSoundOn] = useState(audioNotifier.isEnabled());

  // Ref to compare past orders for new incoming order audio & visual alerts
  const prevOrdersRef = useRef<BackendOrder[] | null>(null);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [prodsData, ordersData] = await Promise.all([
        fetchProducts(),
        fetchAllOrders(),
      ]);
      setProducts(prodsData || []);
      
      const newOrders = ordersData || [];
      
      // Detect new incoming valid orders
      if (prevOrdersRef.current !== null) {
        const prevValidIds = new Set(
          prevOrdersRef.current
            .filter((o) => o.status !== "pending" && o.status !== "cancelled")
            .map((o) => o.id)
        );
        const currentValidOrders = newOrders.filter(
          (o) => o.status !== "pending" && o.status !== "cancelled"
        );

        const brandNewOrders = currentValidOrders.filter((o) => o.id && !prevValidIds.has(o.id));

        if (brandNewOrders.length > 0) {
          const latestOrder = brandNewOrders[0];
          audioNotifier.playChime();
          toast.success(
            `🛍️ ¡NUEVA VENTA EN LA BOUTIQUE! Cliente: ${latestOrder.customer_name || 'Cliente'} — $${(Number(latestOrder.total_amount) || 0).toFixed(2)} USD`,
            { duration: 8000 }
          );
        }
      }
      
      prevOrdersRef.current = newOrders;
      setOrders(newOrders);

      if (!silent) toast.success("Panel de Camila actualizado en tiempo real 💖");
    } catch (err) {
      toast.error("Error de conexión al cargar datos de la boutique.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Initial load and polling every 15s for live notifications
  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      loadData(true);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleProductsUpdated = () => {
    loadData(true);
    if (onProductsUpdated) onProductsUpdated();
  };

  const toggleSound = () => {
    const newState = audioNotifier.toggleSound();
    setSoundOn(newState);
    if (newState) {
      toast.success("🔊 Alertas sonoras de pedidos ACTIVADAS.");
    } else {
      toast.info("🔇 Alertas sonoras SILENCIADAS.");
    }
  };

  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

  type TabId = "summary" | "inventory" | "orders" | "add_product";
  const tabs: { id: TabId; label: string; icon: typeof LayoutDashboard; badge?: number }[] = [
    { id: "summary", label: "Resumen", icon: LayoutDashboard },
    { id: "inventory", label: "Inventario", icon: PackageSearch },
    { id: "orders", label: "Pedidos", icon: ShoppingBag, badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined },
    { id: "add_product", label: "Añadir", icon: PlusCircle },
  ];

  return (
    <div className="w-full h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row relative font-sans selection:bg-rose-500 selection:text-white overflow-hidden">
      
      {/* 1. Header Compacto Exclusivo para Móviles (< md) */}
      <header className="md:hidden sticky top-0 bg-zinc-900/98 backdrop-blur-xl border-b border-zinc-800 px-4 py-2.5 z-40 flex items-center justify-between shadow-xl shrink-0">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white active:scale-95 transition-transform"
            title="Volver a la Web"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-white leading-none flex items-center gap-1.5">
              Boutique Admin
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h2>
            <span className="text-[10px] font-bold text-rose-400 mt-0.5 block">Panel de Camila 💖</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className={`p-2 rounded-xl border transition-all active:scale-95 ${
              soundOn 
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                : 'bg-zinc-950 border-zinc-800 text-zinc-500'
            }`}
            title={soundOn ? "Silenciar notificaciones" : "Activar sonido de pedidos"}
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-rose-500" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
          </button>

          <button
            onClick={() => loadData()}
            disabled={loading}
            className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-rose-400 active:scale-95 transition-all"
            title="Sincronizar DB"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-rose-500' : ''}`} />
          </button>
          
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-black uppercase tracking-wider transition-all shadow-md shadow-rose-500/20 active:scale-95"
          >
            Cerrar
          </button>
        </div>
      </header>

      {/* 2. Menú de Navegación Inferior Flotante Táctil Exclusivo para Móviles (< md) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-900/98 backdrop-blur-2xl border-t border-zinc-800 py-2 px-3 flex items-center justify-around shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer select-none active:scale-95 ${
                isActive 
                  ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white font-black shadow-lg shadow-rose-500/25 scale-105' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
                {tab.badge !== undefined && (
                  <span className="absolute -top-2 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-450 text-black text-[10px] font-black flex items-center justify-center shadow-md">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider mt-1">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* 3. Sidebar Lateral Siempre Visible en Tablet & Escritorio (md+) */}
      <aside className="hidden md:flex w-64 lg:w-72 bg-zinc-900 border-r border-zinc-800 flex-col justify-between shrink-0 p-6 h-full overflow-y-auto z-30">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/25">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm lg:text-base font-black uppercase tracking-widest text-white leading-none">Boutique Admin</h2>
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
                  className={`flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/20' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-850/80'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className="w-4.5 h-4.5" />
                    {tab.label}
                  </div>
                  {tab.badge !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      isActive ? 'bg-white text-rose-600' : 'bg-amber-450 text-black'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-col gap-2.5 pt-6 border-t border-zinc-850">
          <button
            onClick={toggleSound}
            className={`flex items-center justify-between w-full py-3 px-4 rounded-2xl text-xs font-bold transition-all border cursor-pointer ${
              soundOn 
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                : 'bg-zinc-950 border-zinc-800 text-zinc-400'
            }`}
          >
            <div className="flex items-center gap-2">
              {soundOn ? <Volume2 className="w-4 h-4 text-rose-500" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
              <span>Notificaciones Sonoras</span>
            </div>
            <span className="text-[10px] font-mono uppercase font-black">{soundOn ? "ON" : "OFF"}</span>
          </button>

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
            className="w-full py-3 bg-zinc-850 hover:bg-zinc-800 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-colors border border-zinc-800 cursor-pointer flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la Web
          </button>
        </div>
      </aside>

      {/* 4. Área Principal de Contenido (Móvil, Tablet y Escritorio) */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* Encabezado Superior para Tablet & Escritorio (md+) */}
        <header className="hidden md:flex bg-zinc-950/90 backdrop-blur-md border-b border-zinc-850 px-8 py-5 items-center justify-between shrink-0 z-20">
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

          <div className="flex items-center gap-3">
            <button
              onClick={toggleSound}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                soundOn 
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500'
              }`}
              title="Sonido de Notificaciones"
            >
              {soundOn ? <Volume2 className="w-4 h-4 text-rose-500" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
              <span className="hidden xl:inline">{soundOn ? "Sonido Activo" : "Silenciado"}</span>
            </button>

            <button 
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all cursor-pointer"
              title="Cerrar panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Viewport Contenedor con Scroll Limpio (Con padding inferior para el menú móvil) */}
        <section className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8">
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
