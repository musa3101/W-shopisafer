import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AdminDashboard } from "../../panel de control de camila/AdminDashboard";

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-screen h-screen max-w-none m-0 rounded-none p-0 bg-zinc-950 border-0 flex flex-col overflow-hidden z-[9999] [&>button]:hidden">
        <AdminDashboard
          onClose={() => onOpenChange(false)}
          onProductsUpdated={onProductsUpdated}
        />
      </DialogContent>
    </Dialog>
  );
}
