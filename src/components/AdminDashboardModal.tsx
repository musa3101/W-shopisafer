import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Check,
  DollarSign,
  Package,
  Plus,
  RefreshCw,
  Save,
  ShoppingBag,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import {
  BackendOrder,
  BackendProduct,
  createProduct,
  deleteProduct,
  fetchAllOrders,
  fetchProducts,
  updateOrderStatus,
  updateProductPriceAndStock,
} from "@/services/insforgeService";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AdminDashboardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductsUpdated?: () => void;
}

export function AdminDashboardModal({
  open,
  onOpenChange,
  onProductsUpdated,
}: AdminDashboardModalProps) {
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [loading, setLoading] = useState(false);

  // Editable price, stock & Stripe ID map: productId -> { price, stock, stripe_price_id }
  const [editState, setEditState] = useState<Record<string, { price: number; stock: number; stripe_price_id: string }>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  // New product form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdStock, setNewProdStock] = useState("");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdBadge, setNewProdBadge] = useState("");
  const [newProdStripePriceId, setNewProdStripePriceId] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodsData, ordersData] = await Promise.all([
        fetchProducts(),
        fetchAllOrders(),
      ]);
      setProducts(prodsData);
      setOrders(ordersData);

      // Populate editState
      const initialMap: Record<string, { price: number; stock: number; stripe_price_id: string }> = {};
      prodsData.forEach((p) => {
        initialMap[p.id] = { price: p.price, stock: p.stock, stripe_price_id: p.stripe_price_id || "" };
      });
      setEditState(initialMap);
    } catch (err) {
      toast.error("Error al cargar datos del panel de control");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const handlePriceChange = (id: string, value: string) => {
    const num = parseFloat(value) || 0;
    setEditState((prev) => ({
      ...prev,
      [id]: { ...prev[id], price: num },
    }));
  };

  const handleStockChange = (id: string, value: string) => {
    const num = parseInt(value, 10) || 0;
    setEditState((prev) => ({
      ...prev,
      [id]: { ...prev[id], stock: num },
    }));
  };

  const handleStripePriceIdChange = (id: string, value: string) => {
    setEditState((prev) => ({
      ...prev,
      [id]: { ...prev[id], stripe_price_id: value },
    }));
  };

  const handleSaveProduct = async (product: BackendProduct) => {
    const target = editState[product.id];
    if (!target) return;

    setSavingId(product.id);
    const res = await updateProductPriceAndStock(product.id, target.price, target.stock, target.stripe_price_id);
    setSavingId(null);

    if (res.success) {
      toast.success(`'${product.name}' actualizado: $${target.price} USD | Stock: ${target.stock} | Stripe: ${target.stripe_price_id || "Ninguno"}`);
      if (onProductsUpdated) onProductsUpdated();
    } else {
      toast.error(res.error || "No se pudo actualizar el producto");
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) {
      toast.error("El nombre y el precio son obligatorios");
      return;
    }

    const res = await createProduct({
      name: newProdName,
      price: parseFloat(newProdPrice) || 0,
      stock: parseInt(newProdStock, 10) || 0,
      description: newProdDesc,
      badge: newProdBadge,
      stripe_price_id: newProdStripePriceId,
    });

    if (res.success) {
      toast.success(`Producto '${newProdName}' creado con éxito.`);
      setNewProdName("");
      setNewProdPrice("");
      setNewProdStock("");
      setNewProdDesc("");
      setNewProdBadge("");
      setNewProdStripePriceId("");
      setShowAddForm(false);
      loadData();
      if (onProductsUpdated) onProductsUpdated();
    } else {
      toast.error(res.error || "No se pudo crear el producto");
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`¿Estás segura de que deseas eliminar '${name}'?`)) return;

    const res = await deleteProduct(id);
    if (res.success) {
      toast.success(`Producto '${name}' eliminado.`);
      loadData();
      if (onProductsUpdated) onProductsUpdated();
    } else {
      toast.error(res.error || "Error al eliminar producto");
    }
  };

  const handleStatusChange = async (orderId: string, status: BackendOrder["status"]) => {
    const res = await updateOrderStatus(orderId, status);
    if (res.success) {
      toast.success("Estado del pedido actualizado");
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    } else {
      toast.error("Error al actualizar pedido");
    }
  };

  // Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  const lowStockCount = products.filter((p) => p.stock < 5).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] max-w-[850px] bg-background border-border shadow-2xl p-4 sm:p-6 rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between border-b border-rose-100 pb-4">
            <div>
              <DialogTitle className="text-2xl font-serif font-extrabold tracking-tight text-foreground bg-gradient-to-r from-rose-600 to-amber-500 bg-clip-text text-transparent">
                Panel de Camila · Isafer Boutique 💖
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                ¡Hola Camila! Aquí tienes el rendimiento en tiempo real y el control de tu boutique en Brooklyn.
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={loading}
              className="rounded-xl text-xs flex items-center gap-1.5 border-rose-200 text-rose-700 hover:bg-rose-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refrescar
            </Button>
          </div>
        </DialogHeader>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {/* Card 1: Ventas */}
          <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-rose-50/60 to-rose-100/30 border border-rose-100/85 flex items-center gap-4 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
            <div className="absolute right-[-10px] top-[-10px] text-rose-250/10 group-hover:scale-110 transition-transform duration-500">
              <DollarSign className="w-24 h-24 stroke-[1.2]" />
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-200/50">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-rose-800 uppercase tracking-widest">
                Ventas Totales
              </p>
              <p className="text-2xl font-black text-rose-950 font-mono mt-1">
                ${totalRevenue.toFixed(2)} <span className="text-xs font-semibold text-rose-700">USD</span>
              </p>
            </div>
          </div>

          {/* Card 2: Pedidos */}
          <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-amber-50/60 to-amber-100/30 border border-amber-100/85 flex items-center gap-4 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
            <div className="absolute right-[-10px] top-[-10px] text-amber-250/10 group-hover:scale-110 transition-transform duration-500">
              <ShoppingBag className="w-24 h-24 stroke-[1.2]" />
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-200/50">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">
                Pedidos Recibidos
              </p>
              <p className="text-2xl font-black text-amber-950 font-mono mt-1">
                {orders.length} <span className="text-xs font-semibold text-amber-700">orden{orders.length !== 1 ? "es" : ""}</span>
              </p>
            </div>
          </div>

          {/* Card 3: Stock Bajo */}
          <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-zinc-50 to-zinc-100/60 border border-zinc-200/85 flex items-center gap-4 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
            <div className="absolute right-[-10px] top-[-10px] text-zinc-255/10 group-hover:scale-110 transition-transform duration-500">
              <AlertTriangle className="w-24 h-24 stroke-[1.2]" />
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${lowStockCount > 0 ? "bg-red-500 text-white shadow-red-200/50 animate-pulse" : "bg-zinc-700 text-white shadow-zinc-200/50"}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Stock Bajo (&lt; 5)
              </p>
              <p className={`text-2xl font-black font-mono mt-1 ${lowStockCount > 0 ? "text-red-600" : "text-zinc-800"}`}>
                {lowStockCount} <span className="text-xs font-semibold text-zinc-500">artículos</span>
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="products" className="w-full mt-6">
          <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted p-1">
            <TabsTrigger value="products" className="rounded-lg text-xs font-medium py-2">
              <Package className="w-3.5 h-3.5 mr-1.5" /> Inventario & Precios ({products.length})
            </TabsTrigger>
            <TabsTrigger value="orders" className="rounded-lg text-xs font-medium py-2">
              <ShoppingBag className="w-3.5 h-3.5 mr-1.5" /> Gestión de Pedidos ({orders.length})
            </TabsTrigger>
          </TabsList>

          {/* PRODUCTS TAB */}
          <TabsContent value="products" className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Edita los precios o el stock directamente y haz clic en <strong>Guardar</strong>.
              </p>
              <Button
                size="sm"
                onClick={() => setShowAddForm(!showAddForm)}
                className="rounded-xl text-xs bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> {showAddForm ? "Cancelar" : "Nuevo Producto"}
              </Button>
            </div>

            {showAddForm && (
              <form
                onSubmit={handleCreateProduct}
                className="p-4 rounded-xl border border-rose-200 bg-rose-50/30 space-y-3"
              >
                <h4 className="text-xs font-semibold text-rose-900 uppercase tracking-wider">
                  Añadir Nuevo Producto al Catálogo
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    placeholder="Nombre del producto"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    className="rounded-xl bg-white"
                    required
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Precio ($)"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="rounded-xl bg-white"
                    required
                  />
                  <Input
                    type="number"
                    placeholder="Stock inicial"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    className="rounded-xl bg-white"
                  />
                  <Input
                    placeholder="Etiqueta (ej: Nuevo, Edición Limitada)"
                    value={newProdBadge}
                    onChange={(e) => setNewProdBadge(e.target.value)}
                    className="rounded-xl bg-white"
                  />
                  <Input
                    placeholder="Stripe Price ID (ej: price_...)"
                    value={newProdStripePriceId}
                    onChange={(e) => setNewProdStripePriceId(e.target.value)}
                    className="rounded-xl bg-white sm:col-span-2"
                  />
                </div>
                <Input
                  placeholder="Descripción corta del producto..."
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  className="rounded-xl bg-white"
                />
                <Button type="submit" className="w-full rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs">
                  Guardar Producto en InsForge
                </Button>
              </form>
            )}

            {/* Mobile View: Product Cards List */}
            <div className="block md:hidden space-y-3">
              {products.map((p) => {
                const st = editState[p.id] || { price: p.price, stock: p.stock, stripe_price_id: p.stripe_price_id || "" };
                const isSaving = savingId === p.id;
                const hasChanged = st.price !== p.price || st.stock !== p.stock || st.stripe_price_id !== (p.stripe_price_id || "");

                return (
                  <div key={p.id} className="p-4 rounded-2xl border border-rose-100 bg-white/50 backdrop-blur-xs space-y-3">
                    <div className="flex items-start justify-between gap-2 border-b border-rose-50 pb-2">
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-sm text-zinc-800 truncate">{p.name}</h4>
                        {p.badge && (
                          <span className="inline-block text-[9px] px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded-md font-bold mt-1">
                            {p.badge}
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        className="h-8 w-8 p-0 rounded-xl text-rose-600 hover:bg-rose-50"
                        aria-label="Eliminar producto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Precio ($ USD)</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={st.price}
                          onChange={(e) => handlePriceChange(p.id, e.target.value)}
                          className="h-9 rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Stock</label>
                        <Input
                          type="number"
                          value={st.stock}
                          onChange={(e) => handleStockChange(p.id, e.target.value)}
                          className="h-9 rounded-xl text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Stripe Price ID</label>
                      <Input
                        type="text"
                        placeholder="Ninguno (price_...)"
                        value={st.stripe_price_id || ""}
                        onChange={(e) => handleStripePriceIdChange(p.id, e.target.value)}
                        className="h-9 rounded-xl text-xs font-mono"
                      />
                    </div>

                    <Button
                      size="sm"
                      disabled={isSaving || !hasChanged}
                      onClick={() => handleSaveProduct(p)}
                      className={`w-full h-9 rounded-xl text-xs font-semibold ${
                        hasChanged
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Save className="w-3.5 h-3.5 mr-1.5" />
                      {isSaving ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* Desktop View: Products Table */}
            <div className="hidden md:block border border-border rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted border-b border-border font-bold text-zinc-500 uppercase text-[9px] tracking-widest">
                  <tr>
                    <th className="p-3 pl-4">Producto</th>
                    <th className="p-3">Precio ($ USD)</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3">Stripe Price ID</th>
                    <th className="p-3 text-right pr-4">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.map((p) => {
                    const st = editState[p.id] || { price: p.price, stock: p.stock, stripe_price_id: p.stripe_price_id || "" };
                    const isSaving = savingId === p.id;
                    const hasChanged = st.price !== p.price || st.stock !== p.stock || st.stripe_price_id !== (p.stripe_price_id || "");

                    return (
                      <tr key={p.id} className="hover:bg-muted/30">
                        <td className="p-3 font-medium text-foreground max-w-[200px] truncate">
                          <div>{p.name}</div>
                          {p.badge && (
                            <span className="inline-block text-[10px] px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded font-normal">
                              {p.badge}
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            step="0.01"
                            value={st.price}
                            onChange={(e) => handlePriceChange(p.id, e.target.value)}
                            className="w-24 h-8 rounded-lg text-xs"
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            value={st.stock}
                            onChange={(e) => handleStockChange(p.id, e.target.value)}
                            className="w-20 h-8 rounded-lg text-xs"
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            type="text"
                            placeholder="Ninguno (price_...)"
                            value={st.stripe_price_id || ""}
                            onChange={(e) => handleStripePriceIdChange(p.id, e.target.value)}
                            className="w-36 h-8 rounded-lg text-xs font-mono"
                          />
                        </td>
                        <td className="p-3 text-right space-x-1">
                          <Button
                            size="sm"
                            disabled={isSaving || !hasChanged}
                            onClick={() => handleSaveProduct(p)}
                            className={`h-8 rounded-lg text-xs px-3 ${
                              hasChanged
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <Save className="w-3.5 h-3.5 mr-1" />
                            {isSaving ? "..." : "Guardar"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="h-8 rounded-lg text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* ORDERS TAB */}
          <TabsContent value="orders" className="space-y-4 pt-4">
            <p className="text-xs text-muted-foreground">
              Lista de todos los pedidos recibidos en la boutique.
            </p>

            <div className="space-y-3">
              {orders.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  No hay pedidos registrados en la base de datos aún.
                </div>
              ) : (
                orders.map((o) => {
                  const isStripe = o.stripe_session_id && o.stripe_session_id !== 'pending_session' && o.stripe_session_id !== '';
                  
                  return (
                    <div
                      key={o.id}
                      className="p-5 rounded-2xl border border-rose-100 bg-white/70 backdrop-blur-md space-y-4 text-xs shadow-xs hover:border-rose-200 transition-colors"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rose-100 pb-3">
                        <div className="flex items-center flex-wrap gap-2.5">
                          <span className="font-extrabold text-zinc-800 tracking-tight">
                            Pedido #{o.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span className="text-zinc-400 font-medium">|</span>
                          <span className="text-zinc-500 font-medium truncate max-w-[180px]">
                            {o.customer_name} ({o.customer_email})
                          </span>
                          
                          {/* Insignia de Método de Pago */}
                          {isStripe ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                              💳 Tarjeta (Stripe)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                              💬 WhatsApp
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Estado:</span>
                          <select
                            value={o.status}
                            onChange={(e) => handleStatusChange(o.id, e.target.value as any)}
                            className={`rounded-xl border px-3 py-1 font-bold text-[10px] uppercase tracking-wider cursor-pointer ${
                              o.status === "delivered"
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                : o.status === "shipped"
                                ? "bg-blue-50 border-blue-200 text-blue-700"
                                : o.status === "processing"
                                ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                                : o.status === "pending"
                                ? "bg-rose-50 border-rose-200 text-rose-700"
                                : "bg-zinc-100 border-zinc-200 text-zinc-700"
                            }`}
                          >
                            <option value="pending">Pendiente</option>
                            <option value="processing">Procesando</option>
                            <option value="shipped">Enviado</option>
                            <option value="delivered">Entregado</option>
                            <option value="cancelled">Cancelado</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2 text-zinc-600 font-medium">
                        {Array.isArray(o.items) &&
                          o.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                              <span className="text-zinc-700">
                                {it.quantity}x <span className="font-semibold text-zinc-900">{it.name}</span>
                              </span>
                              <span className="font-mono text-zinc-800">${(it.price * it.quantity).toFixed(2)} USD</span>
                            </div>
                          ))}
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-rose-100 font-bold text-zinc-800">
                        <span className="text-[10px] uppercase tracking-wider text-zinc-400">Monto Cobrado</span>
                        <span className="text-base font-black text-rose-600 font-mono">${Number(o.total_amount).toFixed(2)} USD</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
