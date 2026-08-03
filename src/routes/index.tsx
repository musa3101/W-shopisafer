import { createFileRoute } from "@tanstack/react-router";
import {
  Instagram,
  MapPin,
  Menu,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import heroImage from "@/assets/rosse-hero.jpg";
import productsImage from "@/assets/rosse-products.jpg";
import logoHeader from "@/assets/logo-header.svg";
import logoFooter from "@/assets/logo-footer.svg";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Isafer Boutique | Sexy, Elegante y Hecha para ti · Brooklyn, NY" },
      {
        name: "description",
        content:
          "Descubre la colección de ropa femenina, licras moldeadoras, vestidos de malla y outfits sensuales en Isafer Boutique, Brooklyn, Nueva York.",
      },
      { property: "og:title", content: "Isafer Boutique | Tu Outfit Ideal en Brooklyn" },
      {
        property: "og:description",
        content: "Moda femenina sensual y exclusiva. Realza tu figura con Isafer Boutique.",
      },
    ],
  }),
  component: Index,
});

const products = [
  { id: 0, name: "Silk Knot Bandeau Set", price: 38.0, category: "Tops & Sets", position: "left-0" },
  { id: 1, name: "Licra Moldeadora Premium", price: 35.0, category: "Licras", position: "left-[-100%]" },
  { id: 2, name: "Vestido Malla Transparente", price: 48.0, category: "Vestidos", position: "left-[-200%]" },
  { id: 3, name: "Draped Cutout Blue Mini", price: 52.0, category: "Vestidos", position: "left-[-300%]" },
];

type Cart = Record<number, number>;

function ProductCrop({ id, alt }: { id: number; alt: string }) {
  return (
    <img
      src={productsImage}
      alt={alt}
      loading="lazy"
      width={1536}
      height={1024}
      className={`absolute top-0 h-full w-[400%] max-w-none object-cover ${products[id].position}`}
    />
  );
}

function Index() {
  const [cart, setCart] = useState<Cart>({});
  const [cartOpen, setCartOpen] = useState(false);
  const itemCount = Object.values(cart).reduce((sum, count) => sum + count, 0);
  const subtotal = useMemo(
    () => products.reduce((sum, product) => sum + product.price * (cart[product.id] ?? 0), 0),
    [cart],
  );

  const addProduct = (id: number) => {
    setCart((current) => ({ ...current, [id]: (current[id] ?? 0) + 1 }));
    setCartOpen(true);
    toast.success(`${products[id].name} añadido al carrito`);
  };
  const updateProduct = (id: number, change: number) =>
    setCart((current) => {
      const quantity = Math.max(0, (current[id] ?? 0) + change);
      const next = { ...current };
      if (quantity === 0) delete next[id];
      else next[id] = quantity;
      return next;
    });
  const removeProduct = (id: number) => {
    const productName = products[id].name;
    setCart((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    toast.info(`${productName} eliminado del carrito`);
  };

  const handleCheckout = () => {
    const itemsText = products
      .filter((p) => cart[p.id])
      .map((p) => `- ${cart[p.id]}x ${p.name} ($${(p.price * cart[p.id]).toFixed(2)})`)
      .join("%0A");

    if (!itemsText) {
      toast.error("El carrito está vacío");
      return;
    }

    const subtotalFormatted = subtotal.toFixed(2);
    const text = `Hola Isafer Boutique, me gustaría realizar el siguiente pedido:%0A%0A${itemsText}%0A%0ASubtotal: $${subtotalFormatted}%0A%0A¿Me confirmas disponibilidad?`;
    window.open(`https://wa.me/19296772514?text=${text}`, "_blank");
    setCartOpen(false);
    toast.success("Redirigiendo a WhatsApp para finalizar tu pedido...");
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 sm:h-20 sm:px-8">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="justify-self-start rounded-full"
                aria-label="Abrir menú"
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[86%] border-border bg-background p-8">
              <SheetHeader className="text-left">
                <SheetTitle className="font-display text-4xl font-normal">
                  <img
                    src={logoHeader}
                    alt="Isafer Boutique"
                    className="h-10 w-auto object-contain mb-2 mix-blend-multiply"
                  />
                </SheetTitle>
                <SheetDescription>Ropa femenina · Brooklyn, NY</SheetDescription>
              </SheetHeader>
              <nav className="mt-14 flex flex-col gap-7 text-2xl font-medium">
                {[
                  ["Nueva colección", "#coleccion"],
                  ["Categorías", "#categorias"],
                  ["Estilo Isafer", "#estilo"],
                  ["Visítanos", "#visitanos"],
                ].map(([label, href]) => (
                  <SheetClose asChild key={label}>
                    <a
                      href={href}
                      className="border-b border-border pb-4 transition-colors hover:text-primary"
                    >
                      {label}
                    </a>
                  </SheetClose>
                ))}
              </nav>
              <a
                href="https://www.instagram.com/shopisafer"
                target="_blank"
                rel="noreferrer"
                className="mt-12 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
              >
                <Instagram className="size-4" /> @shopisafer
              </a>
            </SheetContent>
          </Sheet>

          <a
            href="#inicio"
            className="flex items-center justify-center"
            aria-label="Isafer Boutique, inicio"
          >
            <img
              src={logoHeader}
              alt="Isafer Boutique"
              className="h-8 sm:h-10 w-auto object-contain mix-blend-multiply"
            />
          </a>

          <Sheet open={cartOpen} onOpenChange={setCartOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative justify-self-end rounded-full"
                aria-label={`Carrito, ${itemCount} artículos`}
              >
                <ShoppingBag />
                {itemCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {itemCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="flex w-[92%] flex-col border-border bg-background p-6 sm:max-w-md">
              <SheetHeader className="text-left">
                <SheetTitle className="font-display text-3xl font-normal">Tu selección</SheetTitle>
                <SheetDescription>
                  {itemCount
                    ? `${itemCount} artículo${itemCount > 1 ? "s" : ""}`
                    : "Tu bolsa está vacía"}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-8 flex-1 space-y-5 overflow-y-auto">
                {products
                  .filter((product) => cart[product.id])
                  .map((product) => (
                    <div
                      key={product.id}
                      className="grid grid-cols-[72px_minmax(0,1fr)] gap-4 border-b border-border pb-5"
                    >
                      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
                        <ProductCrop id={product.id} alt="" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{product.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          ${product.price.toFixed(2)}
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-8 rounded-full"
                            onClick={() => updateProduct(product.id, -1)}
                            aria-label={`Quitar ${product.name}`}
                          >
                            <Minus />
                          </Button>
                          <span className="w-5 text-center text-sm">{cart[product.id]}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-8 rounded-full"
                            onClick={() => updateProduct(product.id, 1)}
                            aria-label={`Añadir ${product.name}`}
                          >
                            <Plus />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="ml-auto size-8 rounded-full text-muted-foreground"
                            onClick={() => removeProduct(product.id)}
                            aria-label={`Eliminar ${product.name}`}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              {itemCount > 0 && (
                <div className="border-t border-border pt-5">
                  <div className="mb-5 flex justify-between text-lg font-semibold">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <Button
                    className="h-12 w-full rounded-full text-base bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={handleCheckout}
                  >
                    Finalizar pedido por WhatsApp
                  </Button>
                  <Button
                    variant="ghost"
                    className="mt-2 h-12 w-full rounded-full text-base"
                    onClick={() => setCartOpen(false)}
                  >
                    Seguir descubriendo
                  </Button>
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    Finalizar compra por WhatsApp · Escaparate de demostración
                  </p>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main id="inicio">
        <section className="relative min-h-[88svh] overflow-hidden sm:min-h-screen">
          <img
            src={heroImage}
            alt="Modelo Isafer Boutique con vestido sexy elegante"
            width={1280}
            height={1600}
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover object-[52%_center]"
          />
          <div className="absolute inset-0 bg-hero-overlay" />
          <div className="relative mx-auto flex min-h-[88svh] max-w-7xl items-end px-5 pb-14 pt-28 sm:min-h-screen sm:items-center sm:px-10 lg:px-16">
            <div className="max-w-xl text-primary-foreground">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-accent">
                Brooklyn Drop · Verano 2026 🌸
              </p>
              <h1 className="font-display text-6xl leading-[0.88] tracking-[-0.04em] sm:text-8xl lg:text-9xl">
                Sexy, Elegante
                <br />
                <span className="italic text-primary-foreground">y hecha para ti</span>
              </h1>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-primary-foreground/90 sm:text-base">
                Ropa femenina seleccionada para realzar tu figura. Boutique exclusiva en Brooklyn, Nueva York.
              </p>
              <Button
                asChild
                className="mt-7 h-12 rounded-full px-7 text-sm font-semibold shadow-neon bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <a href="#coleccion">Ver Nueva Colección</a>
              </Button>
            </div>
          </div>
        </section>

        <section id="categorias" className="scroll-mt-20 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 px-5 sm:px-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Encuentra tu estilo
              </p>
              <h2 className="mt-1 font-display text-4xl sm:text-5xl">Categorías</h2>
            </div>
            <div className="no-scrollbar flex snap-x gap-5 overflow-x-auto px-5 pb-2 sm:grid sm:grid-cols-4 sm:px-8">
              {products.map((product) => (
                <a
                  href="#coleccion"
                  key={product.category}
                  className="group flex w-[88px] shrink-0 snap-start flex-col items-center gap-3 sm:w-auto"
                >
                  <span className="relative block aspect-square w-[78px] overflow-hidden rounded-full border-2 border-primary/40 p-1 transition-transform group-hover:scale-105 sm:w-28">
                    <span className="relative block size-full overflow-hidden rounded-full">
                      <ProductCrop id={product.id} alt={product.category} />
                    </span>
                  </span>
                  <span className="text-sm font-medium">{product.category}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section id="coleccion" className="scroll-mt-20 bg-secondary/50 py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-8">
            <div className="mb-8 px-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Los más deseados
              </p>
              <h2 className="mt-1 font-display text-4xl sm:text-5xl">Best Sellers</h2>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
              {products.map((product) => (
                <article key={product.id} className="group min-w-0">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-[1.4rem] bg-muted sm:rounded-[2rem]">
                    <ProductCrop id={product.id} alt={product.name} />
                    <span className="absolute left-3 top-3 rounded-full bg-background/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md text-primary">
                      Nuevo Drop
                    </span>
                    <Button
                      size="icon"
                      className="absolute bottom-3 right-3 size-10 rounded-full shadow-neon sm:size-12 bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => addProduct(product.id)}
                      aria-label={`Añadir ${product.name} al carrito`}
                    >
                      <Plus />
                    </Button>
                  </div>
                  <div className="px-1 pt-3">
                    <p className="truncate text-[11px] uppercase tracking-wider text-muted-foreground">
                      {product.category}
                    </p>
                    <h3 className="mt-1 truncate text-sm font-semibold sm:text-base">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-sm font-semibold">${product.price.toFixed(2)}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="estilo" className="scroll-mt-20 bg-accent/60 px-5 py-14 sm:py-20">
          <div className="mx-auto grid max-w-5xl items-center gap-8 sm:grid-cols-[1fr_auto]">
            <div>
              <Sparkles className="mb-5 size-7 text-primary" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                El Sello Isafer
              </p>
              <h2 className="mt-2 max-w-2xl font-display text-5xl leading-[0.95] sm:text-7xl">
                Diseño Sexy, Elegante <span className="italic">y Moldeador</span>
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Malla suave y transparente, ajuste perfecto que realza tu figura y telas elásticas ultra cómodas para tus salidas nocturnas, fiestas y cenas.
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="h-12 w-fit rounded-full border-primary/40 bg-background/60 px-7 hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <a href="#coleccion">Descubrir prendas</a>
            </Button>
          </div>
        </section>

        <section id="visitanos" className="scroll-mt-20 px-5 py-16 sm:py-24">
          <div className="mx-auto max-w-4xl border-y border-border py-10 text-center sm:py-14">
            <MapPin className="mx-auto mb-5 size-7 text-primary" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Nuestra Boutique Física
            </p>
            <h2 className="mt-2 font-display text-5xl sm:text-7xl">Visítanos en Brooklyn</h2>
            <p className="mt-5 text-base font-medium">4711 Brooklyn, Nueva York, EE. UU.</p>
            <p className="mt-2 text-sm text-muted-foreground">Atención personalizada y envíos a todo Estados Unidos 🇺🇸</p>
            <Button asChild variant="outline" className="mt-7 h-11 rounded-full px-6">
              <a
                href="https://www.google.com/maps/search/?api=1&query=4711+Brooklyn+New+York"
                target="_blank"
                rel="noreferrer"
              >
                Ver en Google Maps <MapPin />
              </a>
            </Button>
          </div>
        </section>
      </main>

      <footer className="bg-foreground px-5 pb-10 pt-12 text-background">
        <div className="mx-auto max-w-7xl sm:flex sm:items-end sm:justify-between">
          <div>
            <img
              src={logoFooter}
              alt="Isafer Boutique"
              className="h-12 w-auto object-contain mb-4"
            />
            <p className="mt-2 text-xs text-background/60">Isafer Boutique · Brooklyn, Nueva York</p>
          </div>
          <nav className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-xs text-background/70 sm:mt-0">
            <a href="#coleccion" className="hover:text-background">
              Colección
            </a>
            <a href="https://www.tiktok.com/@shop_isafer1" target="_blank" rel="noreferrer" className="hover:text-background">
              TikTok @shop_isafer1
            </a>
            <a
              href="https://www.instagram.com/shopisafer"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-background"
            >
              <Instagram className="size-3.5" /> @shopisafer
            </a>
          </nav>
        </div>
      </footer>

      <Button
        asChild
        size="icon"
        className="fixed bottom-5 right-5 z-30 size-14 rounded-full bg-whatsapp text-whatsapp-foreground shadow-lg hover:bg-whatsapp/90"
        aria-label="Contactar por WhatsApp"
      >
        <a
          href="https://wa.me/19296772514?text=Hola%20Isafer%20Boutique%2C%20me%20gustar%C3%ADa%20recibir%20informaci%C3%B3n"
          target="_blank"
          rel="noreferrer"
        >
          <MessageCircle className="size-6" />
        </a>
      </Button>
    </div>
  );
}

