import { useEffect, useState } from "react";
import {
  PackageCheck,
  ShoppingBag,
  UserCheck,
  LogOut,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import { BackendOrder, fetchCustomerOrders } from "@/services/insforgeService";
import { UserProfile } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CustomerAccountModalProps {
  user: UserProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignOut: () => Promise<any>;
}

export function CustomerAccountModal({
  user,
  open,
  onOpenChange,
  onSignOut,
}: CustomerAccountModalProps) {
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (open && user?.email) {
      setLoadingOrders(true);
      fetchCustomerOrders(user.email)
        .then((res) => setOrders(res))
        .catch(() => toast.error("No se pudieron obtener tus pedidos"))
        .finally(() => setLoadingOrders(false));
    }
  }, [open, user?.email]);

  const handleLogout = async () => {
    await onSignOut();
    toast.success("Has cerrado sesión.");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-background border-border shadow-2xl p-6 rounded-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 font-semibold text-sm border border-rose-200">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  user?.name?.[0]?.toUpperCase() || (
                    <UserCheck className="w-5 h-5" />
                  )
                )}
              </div>
              <div>
                <DialogTitle className="text-xl font-serif text-foreground">
                  ¡Hola, {user?.name || "Clienta"}!
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {user?.email}
                </DialogDescription>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl"
            >
              <LogOut className="w-3.5 h-3.5 mr-1" /> Salir
            </Button>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <ShoppingBag className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm font-semibold text-foreground">
              Mis Pedidos y Compras
            </h3>
          </div>

          {loadingOrders ? (
            <div className="text-center py-8 text-xs text-muted-foreground">
              Cargando tu historial de pedidos...
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 bg-muted/40 rounded-xl border border-dashed border-border">
              <PackageCheck className="w-8 h-8 mx-auto text-muted-foreground opacity-50 mb-2" />
              <p className="text-sm font-medium text-foreground">
                Aún no tienes pedidos registrados
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Tus pedidos realizados con este email aparecerán automáticamente
                aquí.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-xl border border-border bg-card hover:border-rose-200 transition-all space-y-2 shadow-xs"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">
                      Pedido #{order.id.slice(0, 8)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-medium text-[11px] capitalize flex items-center gap-1 ${
                        order.status === "delivered"
                          ? "bg-emerald-100 text-emerald-700"
                          : order.status === "shipped"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {order.status === "delivered" ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      {order.status === "pending" ? "Pendiente" : order.status}
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    {Array.isArray(order.items) &&
                      order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>
                            {item.quantity}x {item.name}
                          </span>
                          <span className="font-medium">
                            {(item.price * item.quantity).toFixed(2)}€
                          </span>
                        </div>
                      ))}
                  </div>

                  <div className="pt-2 border-t border-border flex justify-between items-center text-xs font-semibold text-foreground">
                    <span>Total del pedido</span>
                    <span className="text-rose-600">
                      {Number(order.total_amount).toFixed(2)}€
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
