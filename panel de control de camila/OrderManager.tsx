import { useState } from "react";
import { 
  ShoppingBag, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin,
  ExternalLink,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";
import { BackendOrder, updateOrderStatus } from "../src/services/insforgeService";

interface OrderManagerProps {
  orders: BackendOrder[];
  onOrderUpdated: () => void;
}

export function OrderManager({ orders, onOrderUpdated }: OrderManagerProps) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "processing" | "shipped_delivered" | "cancelled">("all");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedOrderId((prev) => (prev === id ? null : id));
  };

  const handleStatusChange = async (orderId: string, status: BackendOrder["status"]) => {
    setUpdatingId(orderId);
    try {
      const res = await updateOrderStatus(orderId, status);
      if (res.success) {
        toast.success(`Estado del pedido cambiado a '${status}' con éxito.`);
        onOrderUpdated();
      } else {
        toast.error(res.error || "No se pudo actualizar el estado");
      }
    } catch (err) {
      toast.error("Error al conectar con la base de datos");
    } finally {
      setUpdatingId(null);
    }
  };

  // WhatsApp helper
  const getWhatsAppLink = (order: BackendOrder) => {
    const defaultPhone = "19296772514";
    const phone = order.customer_phone ? order.customer_phone.replace(/\D/g, "") : defaultPhone;
    const name = order.customer_name || "Cliente";
    const orderId = (order.id || "order").slice(0, 8);
    
    // Custom message
    let statusText = "";
    if (order.status === 'pending') statusText = "está pendiente de confirmación";
    else if (order.status === 'processing') statusText = "ya está siendo procesado";
    else if (order.status === 'shipped') statusText = "ha sido enviado";
    
    const items = Array.isArray(order.items) 
      ? order.items.map(i => `${i.name || 'Prenda'} (x${i.quantity || 1})`).join(", ")
      : "";

    const text = `Hola ${name}, te escribo de Isafer Boutique 💖 en Brooklyn para informarte que tu pedido #${orderId} ${statusText}. Artículos: ${items}. Total: $${order.total_amount || 0} USD.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  // Filters
  const safeOrders = orders || [];
  const filteredOrders = safeOrders.filter((o) => {
    if (!o) return false;
    const name = (o.customer_name || "").toLowerCase();
    const email = (o.customer_email || "").toLowerCase();
    const id = (o.id || "").toLowerCase();
    const query = (search || "").toLowerCase();

    const matchesSearch = name.includes(query) || email.includes(query) || id.includes(query);

    if (activeTab === "pending") return matchesSearch && o.status === "pending";
    if (activeTab === "processing") return matchesSearch && o.status === "processing";
    if (activeTab === "shipped_delivered") return matchesSearch && (o.status === "shipped" || o.status === "delivered");
    if (activeTab === "cancelled") return matchesSearch && o.status === "cancelled";
    return matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch">
        <input
          type="text"
          placeholder="Buscar pedidos por nombre, email o ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-zinc-900 border border-zinc-850 rounded-2xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/50 transition-colors"
        />

        {/* Tab Filters */}
        <div className="flex bg-zinc-900 border border-zinc-850 p-1 rounded-2xl overflow-x-auto whitespace-nowrap scrollbar-none">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === "all" ? "bg-rose-500 text-white" : "text-zinc-400 hover:text-zinc-200"}`}
          >
            Todos ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === "pending" ? "bg-amber-450 text-black" : "text-zinc-400 hover:text-zinc-200"}`}
          >
            Pendientes ({orders.filter(o => o.status === "pending").length})
          </button>
          <button
            onClick={() => setActiveTab("processing")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === "processing" ? "bg-indigo-500 text-white" : "text-zinc-400 hover:text-zinc-200"}`}
          >
            Procesando ({orders.filter(o => o.status === "processing").length})
          </button>
          <button
            onClick={() => setActiveTab("shipped_delivered")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === "shipped_delivered" ? "bg-emerald-500 text-white" : "text-zinc-400 hover:text-zinc-200"}`}
          >
            Entregados ({orders.filter(o => o.status === "shipped" || o.status === "delivered").length})
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/40 border border-zinc-850/60 rounded-3xl text-zinc-500">
            <ShoppingBag className="w-12 h-12 stroke-[1.2] mx-auto mb-2 text-zinc-650" />
            <p className="text-sm">No se encontraron pedidos en esta categoría</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const itemsList = Array.isArray(order.items) ? order.items : [];
            const formattedDate = order.created_at 
              ? new Date(order.created_at).toLocaleDateString('es-ES', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                }) 
              : "Fecha no disponible";

            // Status style maps
            let statusBadge = "bg-amber-450/10 border-amber-450/20 text-amber-500";
            let StatusIcon = Clock;
            if (order.status === "processing") {
              statusBadge = "bg-indigo-500/10 border-indigo-500/20 text-indigo-400";
              StatusIcon = Clock;
            } else if (order.status === "shipped" || order.status === "delivered") {
              statusBadge = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
              StatusIcon = CheckCircle;
            } else if (order.status === "cancelled") {
              statusBadge = "bg-rose-500/10 border-rose-500/20 text-rose-500";
              StatusIcon = XCircle;
            }

            return (
              <div 
                key={order.id}
                className={`rounded-3xl border transition-all ${isExpanded ? 'bg-zinc-900 border-zinc-700 shadow-xl' : 'bg-zinc-900/60 border-zinc-850 hover:border-zinc-800'}`}
              >
                {/* Header view (summary) */}
                <div 
                  onClick={() => toggleExpand(order.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-zinc-850 border border-zinc-800 text-zinc-400 flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-zinc-500">#{(order.id || "order").slice(0, 8)}</span>
                        <h4 className="text-sm font-black text-white">{order.customer_name || "Cliente"}</h4>
                      </div>
                      <p className="text-[10px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3 h-3" /> {formattedDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 border-t border-zinc-850/60 pt-3 sm:pt-0 sm:border-0">
                    <div className="flex flex-col sm:items-end">
                      <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Total</p>
                      <p className="text-base font-black text-white font-mono mt-0.5">
                        ${(Number(order.total_amount) || 0).toFixed(2)} <span className="text-[10px] font-semibold text-rose-400">USD</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider ${statusBadge}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {order.status}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div className="border-t border-zinc-800/80 p-5 bg-zinc-950/40 rounded-b-3xl space-y-5">
                    {/* Bento Layout of Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      
                      {/* Left Block: Client Profile */}
                      <div className="bg-zinc-900/80 border border-zinc-850 p-4 rounded-2xl space-y-3 shadow-inner">
                        <h5 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Información del Cliente</h5>
                        
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-2 text-zinc-350">
                            <Mail className="w-4 h-4 text-rose-500" />
                            <span>{order.customer_email}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-zinc-350">
                            <Phone className="w-4 h-4 text-emerald-500" />
                            <span>{order.customer_phone || "No especificado"}</span>
                          </div>

                          <div className="flex items-start gap-2 text-zinc-350">
                            <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{order.shipping_address || "Retiro en boutique / Sin dirección"}</span>
                          </div>

                          {order.stripe_session_id && (
                            <div className="flex items-center gap-2 text-[10px] text-zinc-500 pt-1 border-t border-zinc-800/50 mt-2">
                              <span>Pasarela: 💳 Tarjeta (Stripe Checkout)</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Block: Purchased Products list */}
                      <div className="bg-zinc-900/80 border border-zinc-850 p-4 rounded-2xl space-y-3 shadow-inner">
                        <h5 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Artículos Comprados</h5>
                        
                        <div className="space-y-2 max-h-36 overflow-y-auto">
                          {itemsList.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs py-1.5 border-b border-zinc-850/60 last:border-0">
                              <div className="min-w-0 pr-2">
                                <p className="font-bold text-white truncate">{item.name}</p>
                                <p className="text-[10px] text-zinc-500">${item.price} USD c/u</p>
                              </div>
                              <div className="text-right flex-shrink-0 font-mono">
                                <span className="text-zinc-400">x{item.quantity}</span>
                                <span className="font-black text-rose-450 ml-3">${(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Actions and Status controls */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-zinc-800/60">
                      
                      {/* Change order status drop menu */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Cambiar Estado:</span>
                        <div className="flex gap-1 bg-zinc-950 border border-zinc-850 p-1 rounded-xl">
                          {(['pending', 'processing', 'shipped', 'delivered'] as const).map((st) => (
                            <button
                              key={st}
                              onClick={() => handleStatusChange(order.id, st)}
                              disabled={updatingId === order.id}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                                order.status === st 
                                  ? 'bg-rose-500 text-white' 
                                  : 'text-zinc-500 hover:text-zinc-350'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* WhatsApp trigger */}
                      <div className="flex items-center gap-2 justify-end">
                        <a
                          href={getWhatsAppLink(order)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-colors shadow-md shadow-emerald-600/10"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Contactar WhatsApp
                        </a>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
