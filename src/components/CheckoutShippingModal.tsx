import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, Truck, User, Mail, Phone, MapPin } from "lucide-react";
import { WhatsAppIcon } from "@/components/SocialIcons";

export interface ShippingDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  countryState: string;
  notes?: string;
}

interface CheckoutShippingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail?: string;
  userName?: string;
  totalAmount: number;
  isCheckingOut: boolean;
  onConfirmStripe: (details: ShippingDetails) => void;
  onConfirmWhatsApp: (details: ShippingDetails) => void;
}

export function CheckoutShippingModal({
  open,
  onOpenChange,
  userEmail = "",
  userName = "",
  totalAmount,
  isCheckingOut,
  onConfirmStripe,
  onConfirmWhatsApp,
}: CheckoutShippingModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [countryState, setCountryState] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar datos pre-guardados de localStorage o props de usuario
  useEffect(() => {
    if (open) {
      const saved = localStorage.getItem("isafer_shipping_details");
      if (saved) {
        try {
          const parsed: ShippingDetails = JSON.parse(saved);
          setFullName(parsed.fullName || userName || "");
          setEmail(parsed.email || userEmail || "");
          setPhone(parsed.phone || "");
          setAddress(parsed.address || "");
          setCity(parsed.city || "");
          setPostalCode(parsed.postalCode || "");
          setCountryState(parsed.countryState || "");
          setNotes(parsed.notes || "");
          return;
        } catch (e) {
          console.error("Error al parsear datos de envío guardados:", e);
        }
      }

      // Defaults si no hay datos guardados previamente
      if (userName) setFullName(userName);
      if (userEmail) setEmail(userEmail);
    }
  }, [open, userEmail, userName]);

  const validate = (): ShippingDetails | null => {
    const errs: Record<string, string> = {};

    if (!fullName.trim())
      errs.fullName = "Por favor introduce tu nombre completo";
    if (!email.trim() || !email.includes("@"))
      errs.email = "Introduce un correo válido";
    if (!phone.trim() || phone.trim().length < 6)
      errs.phone = "Introduce un teléfono válido para el envío";
    if (!address.trim())
      errs.address = "Introduce tu calle, número y piso/apto";
    if (!city.trim()) errs.city = "Introduce tu ciudad";

    setErrors(errs);

    if (Object.keys(errs).length > 0) return null;

    const details: ShippingDetails = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      postalCode: postalCode.trim(),
      countryState: countryState.trim(),
      notes: notes.trim(),
    };

    // Guardar para futuras compras rápidas
    localStorage.setItem("isafer_shipping_details", JSON.stringify(details));
    return details;
  };

  const handleStripeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const details = validate();
    if (details) {
      onConfirmStripe(details);
    }
  };

  const handleWhatsAppSubmit = () => {
    const details = validate();
    if (details) {
      onConfirmWhatsApp(details);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[95vw] rounded-3xl p-0 overflow-hidden bg-white border border-rose-100 shadow-2xl font-sans text-zinc-900 max-h-[92dvh] flex flex-col">
        {/* Header Decorativo Luxe */}
        <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 p-6 text-white relative shrink-0">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
              <Truck className="size-3.5" /> Envío Express e Identificación
            </span>
            <span className="font-mono text-sm font-black bg-white/10 px-3 py-1 rounded-full border border-white/20">
              Total: ${totalAmount.toFixed(2)} USD
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-3">
            Datos de Entrega y Contacto 📦
          </h2>
          <p className="text-xs text-rose-100 font-medium mt-1">
            Completa tus datos para enviarte tu pedido con empaque exclusivo
            Isafer Luxe.
          </p>
        </div>

        {/* Formulario con Scroll Interno Suave */}
        <form
          onSubmit={handleStripeSubmit}
          className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar"
        >
          {/* Bloque 1: Contacto Personal */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
              <User className="size-3.5 text-rose-500" /> 1. Datos Personales &
              Contacto
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Nombre Completo */}
              <div>
                <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                  Nombre y Apellidos *
                </label>
                <div className="relative">
                  <User className="size-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Ej: Maria Rossi"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`w-full pl-10 pr-3 py-2.5 rounded-xl border ${
                      errors.fullName
                        ? "border-red-500 bg-red-50/30"
                        : "border-zinc-200 bg-zinc-50/50"
                    } text-xs font-semibold text-zinc-900 focus:outline-none focus:border-rose-500 focus:bg-white transition-all`}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-[10px] font-bold text-red-500 mt-1">
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                  Correo Electrónico *
                </label>
                <div className="relative">
                  <Mail className="size-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-3 py-2.5 rounded-xl border ${
                      errors.email
                        ? "border-red-500 bg-red-50/30"
                        : "border-zinc-200 bg-zinc-50/50"
                    } text-xs font-semibold text-zinc-900 focus:outline-none focus:border-rose-500 focus:bg-white transition-all`}
                  />
                </div>
                {errors.email && (
                  <p className="text-[10px] font-bold text-red-500 mt-1">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Teléfono WhatsApp */}
            <div>
              <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                Teléfono de WhatsApp / Móvil (Para confirmación y envío) *
              </label>
              <div className="relative">
                <Phone className="size-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="Ej: +1 (718) 555-0199 o +34 600 000 000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full pl-10 pr-3 py-2.5 rounded-xl border ${
                    errors.phone
                      ? "border-red-500 bg-red-50/30"
                      : "border-zinc-200 bg-zinc-50/50"
                  } text-xs font-semibold text-zinc-900 focus:outline-none focus:border-rose-500 focus:bg-white transition-all`}
                />
              </div>
              {errors.phone && (
                <p className="text-[10px] font-bold text-red-500 mt-1">
                  {errors.phone}
                </p>
              )}
            </div>
          </div>

          {/* Bloque 2: Dirección de Envío */}
          <div className="space-y-3 pt-2 border-t border-zinc-100">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
              <MapPin className="size-3.5 text-rose-500" /> 2. Dirección de
              Envío
            </h3>

            {/* Calle y Número */}
            <div>
              <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                Calle, Número, Piso / Apt *
              </label>
              <input
                type="text"
                placeholder="Ej: 5th Avenue 123, Apt 4B"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border ${
                  errors.address
                    ? "border-red-500 bg-red-50/30"
                    : "border-zinc-200 bg-zinc-50/50"
                } text-xs font-semibold text-zinc-900 focus:outline-none focus:border-rose-500 focus:bg-white transition-all`}
              />
              {errors.address && (
                <p className="text-[10px] font-bold text-red-500 mt-1">
                  {errors.address}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Ciudad */}
              <div>
                <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                  Ciudad *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Brooklyn / Madrid"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${
                    errors.city
                      ? "border-red-500 bg-red-50/30"
                      : "border-zinc-200 bg-zinc-50/50"
                  } text-xs font-semibold text-zinc-900 focus:outline-none focus:border-rose-500 focus:bg-white transition-all`}
                />
                {errors.city && (
                  <p className="text-[10px] font-bold text-red-500 mt-1">
                    {errors.city}
                  </p>
                )}
              </div>

              {/* Código Postal */}
              <div>
                <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                  Código Postal
                </label>
                <input
                  type="text"
                  placeholder="Ej: 11201"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-semibold text-zinc-900 focus:outline-none focus:border-rose-500 focus:bg-white transition-all"
                />
              </div>

              {/* Estado / Provincia */}
              <div>
                <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                  Estado / Provincia / País
                </label>
                <input
                  type="text"
                  placeholder="Ej: New York, USA"
                  value={countryState}
                  onChange={(e) => setCountryState(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-semibold text-zinc-900 focus:outline-none focus:border-rose-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Notas Especiales */}
            <div>
              <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                Notas adicionales de entrega (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej: Dejar con el portero o llamar antes de entregar"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-semibold text-zinc-900 focus:outline-none focus:border-rose-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Botones de Pago / Acción */}
          <div className="pt-4 border-t border-zinc-100 space-y-2.5">
            <Button
              type="submit"
              disabled={isCheckingOut}
              className="w-full h-13 rounded-2xl bg-[#ff007f] hover:bg-rose-600 text-white font-extrabold text-xs uppercase tracking-[0.2em] shadow-lg shadow-rose-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <CreditCard className="size-4.5" />
              {isCheckingOut
                ? "Procesando..."
                : `Pagar $${totalAmount.toFixed(2)} USD con Stripe 💳`}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleWhatsAppSubmit}
              className="w-full h-13 rounded-2xl border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-extrabold text-xs uppercase tracking-[0.2em] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <WhatsAppIcon className="size-4.5 text-emerald-600" />
              Pedir por WhatsApp 📱
            </Button>

            <p className="text-center text-[10px] text-zinc-400 font-mono mt-1 flex items-center justify-center gap-1">
              🔒 Tus datos se procesan con cifrado SSL de 256 bits
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
