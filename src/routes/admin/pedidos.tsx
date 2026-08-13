import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { fetchAllOrders } from "@/services/insforgeService";
import { OrderManager } from "../../../panel de control de camila/OrderManager";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/admin/pedidos")({
  loader: async () => {
    const orders = await fetchAllOrders().catch(() => []);
    return { orders };
  },
  component: PedidosPage,
});

function PedidosPage() {
  const { orders } = Route.useLoaderData();
  const navigate = useNavigate();

  const handleOrderUpdated = () => {
    // Recargar datos usando el router de TanStack
    navigate({ to: "/admin/pedidos", replace: true });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto pb-12 space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate({ to: "/admin" })}
          className="p-2 bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-900 rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
            Gestión de Pedidos
          </h1>
          <p className="text-zinc-500 font-medium font-sans">
            Administra los pedidos de tus clientas en tiempo real.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
        <OrderManager orders={orders} onOrderUpdated={handleOrderUpdated} />
      </div>
    </div>
  );
}
