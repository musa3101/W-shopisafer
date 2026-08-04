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

  // Editable price & stock map: productId -> { price, stock }
  const [editState, setEditState] = useState<Record<string, { price: number; stock: number }>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  // New product form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdStock, setNewProdStock] = useState("");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdBadge, setNewProdBadge] = useState("");

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
      const initialMap: Record<string, { price: number; stock: number }> = {};
      prodsData.forEach((p) => {
        initialMap[p.id] = { price: p.price, stock: p.stock };
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

  const handleSaveProduct = async (product: BackendProduct) => {
    const target = editState[product.id];
    if (!target) return;

    setSavingId(product.id);
    const res = await updateProductPriceAndStock(product.id, target.price, target.stock);
    setSavingId(null);

    if (res.success) {
      toast.success(`'${product.name}' actualizado: ${target.price}€ | Stock: ${target.stock}`);
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
    });

    if (res.success) {
      toast.success(`Producto '${newProdName}' creado con éxito.`);
      setNewProdName("");
      setNewProdPrice("");
      setNewProdStock("");
      setNewProdDesc("");
      setNewProdBadge("");
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
      <DialogContent className="sm:max-w-[850px] bg-background border-border shadow-2xl p-6 rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-serif text-foreground">
                Panel de Control · Rossé Boutique
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Gestión en tiempo real de productos, precios, stock y pedidos guardados en InsForge.
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={loading}
              className="rounded-xl text-xs flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refrescar
            </Button>
          </div>
        </DialogHeader>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Ventas Totales
              </p>
              <p className="text-xl font-bold text-foreground">{totalRevenue.toFixed(2)}€</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center text-slate-700">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Pedidos Recibidos
              </p>
              <p className="text-xl font-bold text-foreground">{orders.length}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Stock Bajo (&lt; 5)
              </p>
              <p className="text-xl font-bold text-amber-800">{lowStockCount} artículos</p>
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
                    placeholder="Precio (€)"
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

            {/* Products Table */}
            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted border-b border-border font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">Producto</th>
                    <th className="p-3">Precio (€)</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.map((p) => {
                    const st = editState[p.id] || { price: p.price, stock: p.stock };
                    const isSaving = savingId === p.id;
                    const hasChanged = st.price !== p.price || st.stock !== p.stock;

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
                orders.map((o) => (
                  <div
                    key={o.id}
                    className="p-4 rounded-xl border border-border bg-card space-y-3 text-xs shadow-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
                      <div>
                        <span className="font-bold text-foreground">Pedido #{o.id.slice(0, 8)}</span>
                        <span className="text-muted-foreground ml-2">({o.customer_name} · {o.customer_email})</span>
                      </div>
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value as any)}
                        className="rounded-lg border border-input px-2 py-1 bg-background font-medium text-xs text-foreground"
                      >
                        <option value="pending">Pendiente</option>
                        <option value="processing">En Proceso</option>
                        <option value="shipped">Enviado</option>
                        <option value="delivered">Entregado</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    </div>

                    <div className="space-y-1 text-muted-foreground">
                      {Array.isArray(o.items) &&
                        o.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>
                              {it.quantity}x {it.name}
                            </span>
                            <span>{(it.price * it.quantity).toFixed(2)}€</span>
                          </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-border font-bold text-foreground">
                      <span>Total</span>
                      <span className="text-rose-600 text-sm">{Number(o.total_amount).toFixed(2)}€</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
