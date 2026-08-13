import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { fetchProducts } from "@/services/insforgeService";
import { StockManager } from "../../../panel de control de camila/StockManager";
import { ProductCreator } from "../../../panel de control de camila/ProductCreator";
import { ArrowLeft, Plus, ClipboardList } from "lucide-react";

export const Route = createFileRoute("/admin/catalogo")({
  loader: async () => {
    const products = await fetchProducts().catch(() => []);
    return { products };
  },
  component: CatalogoPage,
});

function CatalogoPage() {
  const { products } = Route.useLoaderData();
  const navigate = useNavigate();
  const [view, setView] = useState<"list" | "create">("list");

  const handleProductsUpdated = () => {
    navigate({ to: "/admin/catalogo", replace: true });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto pb-12 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate({ to: "/admin" })}
            className="p-2 bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-900 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
              Catálogo de Productos
            </h1>
            <p className="text-zinc-500 font-medium">
              Controla el inventario, precios y stock en tiempo real.
            </p>
          </div>
        </div>

        <button
          onClick={() => setView(view === "list" ? "create" : "list")}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer self-start sm:self-auto"
        >
          {view === "list" ? (
            <>
              <Plus className="size-4" />
              Nueva Prenda
            </>
          ) : (
            <>
              <ClipboardList className="size-4" />
              Ver Catálogo
            </>
          )}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
        {view === "list" ? (
          <StockManager
            products={products}
            onProductsUpdated={handleProductsUpdated}
          />
        ) : (
          <ProductCreator
            onProductCreated={() => {
              handleProductsUpdated();
              setView("list");
            }}
            onCancel={() => setView("list")}
          />
        )}
      </div>
    </div>
  );
}
