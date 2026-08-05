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

  // Local state for edits
  const [editState, setEditState] = useState<
    Record<string, { price: number; stock: number; stripe_price_id: string }>
  >({});

  const getProductState = (productId: string, defaultProd: BackendProduct) => {
    return editState[productId] || {
      price: defaultProd.price,
      stock: defaultProd.stock,
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

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
    
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
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar prendas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/50 transition-colors"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-2xl">
          <button
            onClick={() => setFilterType("all")}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${filterType === "all" ? "bg-rose-500 text-white" : "text-zinc-400 hover:text-zinc-200"}`}
          >
            Todas ({products.length})
          </button>
          <button
            onClick={() => setFilterType("low")}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${filterType === "low" ? "bg-amber-450 text-black" : "text-zinc-400 hover:text-zinc-200"}`}
          >
            Stock Bajo ({products.filter(p => p.stock > 0 && p.stock < 5).length})
          </button>
          <button
            onClick={() => setFilterType("out")}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${filterType === "out" ? "bg-rose-600 text-white" : "text-zinc-400 hover:text-zinc-200"}`}
          >
            Sin Stock ({products.filter(p => p.stock === 0).length})
          </button>
        </div>
      </div>

      {/* Grid container / List of items */}
      <div className="space-y-3">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/40 border border-zinc-800/60 rounded-3xl text-zinc-500">
            <Package className="w-12 h-12 stroke-[1.2] mx-auto mb-2 text-zinc-650" />
            <p className="text-sm">No se encontraron prendas con los filtros actuales</p>
          </div>
        ) : (
          filteredProducts.map((p) => {
            const state = getProductState(p.id, p);
            const isSaving = savingId === p.id;
            
            // Stock level configurations
            let stockColor = "bg-emerald-500/10 border-emerald-500/20 text-emerald-450";
            let stockLabel = "Disponible";
            if (state.stock === 0) {
              stockColor = "bg-rose-500/10 border-rose-500/20 text-rose-450";
              stockLabel = "Agotado";
            } else if (state.stock < 5) {
              stockColor = "bg-amber-450/10 border-amber-450/20 text-amber-500";
              stockLabel = `Bajo: ${state.stock} u.`;
            }

            return (
              <div 
                key={p.id} 
                className="relative overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 group hover:border-zinc-700 transition-colors shadow-lg shadow-black/10"
              >
                {/* Visual indicator bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${state.stock === 0 ? 'bg-rose-500' : state.stock < 5 ? 'bg-amber-450' : 'bg-emerald-500'}`} />

                {/* Left side: Product photo & basic info */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-zinc-850 flex-shrink-0 border border-zinc-800 shadow-inner">
                    <img 
                      src={p.images && p.images[0] ? p.images[0] : 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80'} 
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-black text-white truncate max-w-[200px] sm:max-w-xs">{p.name}</h4>
                      {p.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-[9px] font-black text-rose-400 uppercase tracking-widest">
                          {p.badge}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-[10px] text-zinc-500 truncate max-w-[250px]">{p.description || "Sin descripción"}</p>
                    
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${stockColor}`}>
                        {stockLabel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Center/Right side: Fast edit tools */}
                <div className="flex flex-wrap items-center gap-4 justify-between md:justify-end border-t border-zinc-800/80 pt-4 md:pt-0 md:border-0">
                  
                  {/* Price adjustment */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Precio USD</label>
                    <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1">
                      <span className="text-zinc-650 text-xs font-bold mr-1">$</span>
                      <input 
                        type="number"
                        step="0.01"
                        value={state.price}
                        onChange={(e) => handleUpdateLocal(p.id, { price: parseFloat(e.target.value) || 0 }, p)}
                        className="w-16 bg-transparent text-sm font-black text-white focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Stock quick buttons */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Unidades Stock</label>
                    <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl p-0.5">
                      <button 
                        onClick={() => handleUpdateLocal(p.id, { stock: Math.max(0, state.stock - 1) }, p)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input 
                        type="number"
                        value={state.stock}
                        onChange={(e) => handleUpdateLocal(p.id, { stock: parseInt(e.target.value, 10) || 0 }, p)}
                        className="w-10 bg-transparent text-center text-sm font-black text-white focus:outline-none font-mono"
                      />
                      <button 
                        onClick={() => handleUpdateLocal(p.id, { stock: state.stock + 1 }, p)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Stripe Price ID (optional config) */}
                  <div className="flex flex-col gap-1 w-full sm:w-auto">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Stripe Price ID</label>
                    <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1">
                      <CreditCard className="w-3.5 h-3.5 text-zinc-650 mr-1.5" />
                      <input 
                        type="text"
                        placeholder="prod_..."
                        value={state.stripe_price_id}
                        onChange={(e) => handleUpdateLocal(p.id, { stripe_price_id: e.target.value }, p)}
                        className="w-full sm:w-28 bg-transparent text-xs font-mono text-zinc-300 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Control actions */}
                  <div className="flex items-center gap-2 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => handleSave(p)}
                      disabled={isSaving}
                      className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                        isSaving 
                          ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                          : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/10'
                      }`}
                    >
                      <Save className="w-3.5 h-3.5" />
                      {isSaving ? "Guardando..." : "Guardar"}
                    </button>
                    
                    <button
                      onClick={() => handleDelete(p)}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-rose-500 hover:border-rose-500/30 transition-colors"
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
