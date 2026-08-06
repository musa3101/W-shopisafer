import { useState } from "react";
import { 
  Package, 
  Search, 
  Trash2, 
  Save, 
  Plus, 
  Minus,
  Sparkles,
  AlertCircle,
  TrendingUp,
  CreditCard
} from "lucide-react";
import { toast } from "sonner";
import { BackendProduct, updateProductPriceAndStock, deleteProduct } from "../src/services/insforgeService";

interface StockManagerProps {
  products: BackendProduct[];
  onProductsUpdated: () => void;
}

export function StockManager({ products, onProductsUpdated }: StockManagerProps) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "low" | "out">("all");
  const [savingId, setSavingId] = useState<string | null>(null);

  // Estado local para ediciones inmediatas
  const [editState, setEditState] = useState<
    Record<string, { price: number; stock: number; stripe_price_id: string }>
  >({});

  const getProductState = (productId: string, defaultProd: BackendProduct) => {
    return editState[productId] || {
      price: Number(defaultProd.price) || 0,
      stock: Number(defaultProd.stock) || 0,
      stripe_price_id: defaultProd.stripe_price_id || ""
    };
  };

  const handleUpdateLocal = (productId: string, fields: Partial<{ price: number; stock: number; stripe_price_id: string }>, defaultProd: BackendProduct) => {
    const currentState = getProductState(productId, defaultProd);
    setEditState((prev) => ({
      ...prev,
      [productId]: { ...currentState, ...fields }
    }));
  };

  const handleSave = async (product: BackendProduct) => {
    const state = getProductState(product.id, product);
    setSavingId(product.id);
    
    try {
      const res = await updateProductPriceAndStock(
        product.id, 
        Number(state.price), 
        Number(state.stock), 
        state.stripe_price_id
      );

      if (res.success) {
        toast.success(`'${product.name}' actualizado: $${state.price} USD | Stock: ${state.stock}`);
        onProductsUpdated();
      } else {
        toast.error(res.error || "No se pudo guardar el producto");
      }
    } catch (err) {
      toast.error("Error de conexión al guardar");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (product: BackendProduct) => {
    if (!confirm(`¿Estás segura de que deseas eliminar la prenda '${product.name}' de la web?`)) return;
    
    try {
      const res = await deleteProduct(product.id);
      if (res.success) {
        toast.success(`Prenda '${product.name}' eliminada con éxito.`);
        onProductsUpdated();
      } else {
        toast.error(res.error || "Error al eliminar la prenda");
      }
    } catch (err) {
      toast.error("Error al conectar con la base de datos");
    }
  };

  // Filtrado ultra seguro
  const safeProducts = products || [];
  const filteredProducts = safeProducts.filter((p) => {
    if (!p) return false;
    const name = (p.name || "").toLowerCase();
    const desc = (p.description || "").toLowerCase();
    const query = (search || "").toLowerCase();
    const matchesSearch = name.includes(query) || desc.includes(query);
    
    const state = getProductState(p.id, p);
    if (filterType === "out") {
      return matchesSearch && state.stock === 0;
    }
    if (filterType === "low") {
      return matchesSearch && state.stock > 0 && state.stock < 5;
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-5">
      {/* Barra de Búsqueda y Filtros Adaptables */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch">
        
        {/* Input de Búsqueda */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar prendas por nombre o detalles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/50 transition-colors"
          />
        </div>

        {/* Botones de Filtro en Carrusel Horizontal Scrollable */}
        <div className="flex bg-zinc-900 border border-zinc-800 p-1.5 rounded-2xl overflow-x-auto whitespace-nowrap scrollbar-none gap-1">
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              filterType === "all" ? "bg-rose-500 text-white shadow-md shadow-rose-500/20" : "text-zinc-400 hover:text-white"
            }`}
          >
            Todas ({safeProducts.length})
          </button>
          <button
            onClick={() => setFilterType("low")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              filterType === "low" ? "bg-amber-450 text-black font-black" : "text-zinc-400 hover:text-white"
            }`}
          >
            Stock Bajo ({safeProducts.filter(p => (p?.stock || 0) > 0 && (p?.stock || 0) < 5).length})
          </button>
          <button
            onClick={() => setFilterType("out")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              filterType === "out" ? "bg-rose-600 text-white font-black" : "text-zinc-400 hover:text-white"
            }`}
          >
            Sin Stock ({safeProducts.filter(p => (p?.stock || 0) === 0).length})
          </button>
        </div>
      </div>

      {/* Lista / Grid de Prendas */}
      <div className="space-y-4">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/40 border border-zinc-850/60 rounded-3xl text-zinc-500 space-y-2">
            <Package className="w-12 h-12 stroke-[1.2] mx-auto text-zinc-600" />
            <p className="text-sm font-bold text-zinc-400">No se encontraron prendas en el inventario</p>
            <p className="text-xs text-zinc-600">Prueba ajustando los términos de búsqueda o añade un nuevo producto.</p>
          </div>
        ) : (
          filteredProducts.map((p) => {
            const state = getProductState(p.id, p);
            const isSaving = savingId === p.id;
            
            // Configuración de indicadores visuales de stock
            let stockBadge = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
            let stockText = `Disponible (${state.stock} u.)`;
            if (state.stock === 0) {
              stockBadge = "bg-rose-500/10 border-rose-500/20 text-rose-450";
              stockText = "Agotado";
            } else if (state.stock < 5) {
              stockBadge = "bg-amber-450/10 border-amber-450/20 text-amber-400";
              stockText = `Stock Bajo: ${state.stock} u.`;
            }

            return (
              <div 
                key={p.id} 
                className="relative overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 p-4 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 group hover:border-zinc-700 transition-all shadow-xl"
              >
                {/* Indicador de estado en el borde izquierdo */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${state.stock === 0 ? 'bg-rose-500' : state.stock < 5 ? 'bg-amber-450' : 'bg-emerald-500'}`} />

                {/* Sección Izquierda: Foto & Información Principal */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-zinc-950 flex-shrink-0 border border-zinc-800 shadow-inner">
                    <img 
                      src={p.images && p.images[0] ? p.images[0] : 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80'} 
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-black text-white truncate max-w-xs">{p.name || "Prenda Isafer"}</h4>
                      {p.badge && (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-[10px] font-black text-rose-400 uppercase tracking-widest">
                          {p.badge}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-zinc-400 line-clamp-1">{p.description || "Sin descripción"}</p>
                    
                    <div className="flex items-center gap-2 pt-1">
                      <span className={`px-2.5 py-1 rounded-xl border text-[10px] font-black uppercase tracking-wider ${stockBadge}`}>
                        {stockText}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sección Derecha: Herramientas de Edición Táctiles */}
                <div className="flex flex-wrap items-center gap-4 justify-between lg:justify-end border-t border-zinc-800/80 pt-4 lg:pt-0 lg:border-0">
                  
                  {/* Ajuste de Precio USD */}
                  <div className="flex flex-col gap-1 flex-1 sm:flex-none">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Precio ($ USD)</label>
                    <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-2xl px-3 py-2">
                      <span className="text-zinc-500 text-sm font-black mr-1.5">$</span>
                      <input 
                        type="number"
                        step="0.01"
                        value={state.price}
                        onChange={(e) => handleUpdateLocal(p.id, { price: parseFloat(e.target.value) || 0 }, p)}
                        className="w-20 bg-transparent text-sm font-black text-white focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Controles Táctiles de Stock (+ y -) */}
                  <div className="flex flex-col gap-1 flex-1 sm:flex-none">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Stock (Unidades)</label>
                    <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-2xl p-1">
                      <button 
                        type="button"
                        onClick={() => handleUpdateLocal(p.id, { stock: Math.max(0, state.stock - 1) }, p)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white active:scale-95 transition-all cursor-pointer"
                        title="Reducir stock"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input 
                        type="number"
                        value={state.stock}
                        onChange={(e) => handleUpdateLocal(p.id, { stock: parseInt(e.target.value, 10) || 0 }, p)}
                        className="w-12 bg-transparent text-center text-sm font-black text-white focus:outline-none font-mono"
                      />
                      <button 
                        type="button"
                        onClick={() => handleUpdateLocal(p.id, { stock: state.stock + 1 }, p)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white active:scale-95 transition-all cursor-pointer"
                        title="Aumentar stock"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Stripe Price ID */}
                  <div className="flex flex-col gap-1 w-full sm:w-auto">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Stripe Price ID</label>
                    <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-2xl px-3 py-2">
                      <CreditCard className="w-4 h-4 text-zinc-600 mr-2 shrink-0" />
                      <input 
                        type="text"
                        placeholder="price_..."
                        value={state.stripe_price_id}
                        onChange={(e) => handleUpdateLocal(p.id, { stripe_price_id: e.target.value }, p)}
                        className="w-full sm:w-32 bg-transparent text-xs font-mono text-zinc-300 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Botones de Acción */}
                  <div className="flex items-center gap-2.5 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => handleSave(p)}
                      disabled={isSaving}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg cursor-pointer ${
                        isSaving 
                          ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                          : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20 active:scale-95'
                      }`}
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? "Guardando..." : "Guardar"}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleDelete(p)}
                      className="p-2.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-rose-500 hover:border-rose-500/30 active:scale-95 transition-all cursor-pointer"
                      title="Eliminar prenda"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
