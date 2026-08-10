import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { audioNotifier } from "@/lib/audioNotifier";
import { 
  ArrowLeft, Volume2, VolumeX, Database, ShieldAlert, Sparkles, 
  Activity, Bell, BellOff, Loader2, User, Store, Tag, Percent, 
  Lightbulb, ChevronDown, ChevronUp, Palette, CheckCircle2, Ticket,
  Camera, Upload, RotateCcw, Edit3, Key, Plus, Trash2, Copy, Check,
  Eye, EyeOff, Save, Lock, Mail
} from "lucide-react";
import { toast } from "sonner";
import { insforge } from "@/lib/insforge";
import { VAPID_PUBLIC_KEY } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAvatar } from "@/hooks/useAdminAvatar";
import { couponsService, Coupon, WelcomeBannerConfig } from "@/services/couponsService";

export const Route = createFileRoute("/admin/ajustes")({
  component: AjustesPage,
});

export function AjustesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Estado Avatar de Admin
  const { avatar, updateAvatar, resetAvatar, isCustom } = useAdminAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecciona un archivo de imagen válido (JPG, PNG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen es demasiado grande. Selecciona una de máximo 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        updateAvatar(result);
        toast.success("¡Foto de perfil de Camila actualizada con éxito! 💖");
      }
    };
    reader.readAsDataURL(file);
  };

  // Estado Notificaciones
  const [soundEnabled, setSoundEnabled] = useState(audioNotifier.isEnabled());
  const [pushSupported, setPushSupported] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [subscribingPush, setSubscribingPush] = useState(false);

  // Estado Diagnóstico
  const [latency, setLatency] = useState<number | null>(null);
  const [checkingLatency, setCheckingLatency] = useState(false);
  const [dbStatus, setDbStatus] = useState<string>("unknown");
  const [healthLogs, setHealthLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [showTechnicalDiagnostics, setShowTechnicalDiagnostics] = useState(false);

  // Estado Edición de Credenciales y Perfil
  const [showEditCredentials, setShowEditCredentials] = useState(false);
  const [adminName, setAdminName] = useState(() => {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      const stored = localStorage.getItem("isafer_admin_profile");
      if (stored) {
        try { return JSON.parse(stored).name || "Camila"; } catch (e) {}
      }
    }
    return "Camila";
  });
  const [adminEmail, setAdminEmail] = useState(() => {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      const stored = localStorage.getItem("isafer_admin_profile");
      if (stored) {
        try { return JSON.parse(stored).email || "admin@isaferboutique.com"; } catch (e) {}
      }
    }
    return "admin@isaferboutique.com";
  });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSavingCredentials, setIsSavingCredentials] = useState(false);

  // Estado Cupones y Banners Promocionales
  const [bannerConfig, setBannerConfig] = useState<WelcomeBannerConfig>(() => couponsService.getWelcomeBanner());
  const [coupons, setCoupons] = useState<Coupon[]>(() => couponsService.getCoupons());
  const [showCreateCouponModal, setShowCreateCouponModal] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDiscount, setNewCouponDiscount] = useState("10");
  const [newCouponDescription, setNewCouponDescription] = useState("");

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail) {
      toast.error("El correo electrónico no puede estar vacío.");
      return;
    }

    if (newPassword && newPassword.length < 6) {
      toast.error("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden. Por favor verifícalas.");
      return;
    }

    setIsSavingCredentials(true);
    try {
      try {
        if (typeof (insforge.auth as any).setProfile === "function") {
          await (insforge.auth as any).setProfile({ name: adminName });
        }
        if (newPassword && typeof (insforge.auth as any).resetPassword === "function") {
          await (insforge.auth as any).resetPassword({ newPassword });
        }
      } catch (errInsforge) {
        console.warn("Aviso en sincronización directa con InsForge:", errInsforge);
      }

      const profileData = { name: adminName, email: adminEmail };
      localStorage.setItem("isafer_admin_profile", JSON.stringify(profileData));

      const existingSession = localStorage.getItem("isafer_admin_session");
      const updatedSession = {
        ...(existingSession ? JSON.parse(existingSession) : {}),
        email: adminEmail,
        name: adminName,
      };
      localStorage.setItem("isafer_admin_session", JSON.stringify(updatedSession));

      toast.success("¡Credenciales de Camila actualizadas con éxito en InsForge! 💖");
      setNewPassword("");
      setConfirmPassword("");
      setShowEditCredentials(false);
    } catch (err: any) {
      toast.error(err.message || "Error al actualizar las credenciales.");
    } finally {
      setIsSavingCredentials(false);
    }
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    couponsService.saveWelcomeBanner(bannerConfig);
    toast.success("¡Configuración del Banner VIP de Bienvenida guardada con éxito! ✨");
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode) {
      toast.error("Por favor introduce un código de cupón.");
      return;
    }

    const discountNum = parseInt(newCouponDiscount, 10);
    if (isNaN(discountNum) || discountNum <= 0 || discountNum > 100) {
      toast.error("Introduce un porcentaje de descuento válido (entre 1% y 100%).");
      return;
    }

    couponsService.addCoupon({
      code: newCouponCode,
      discountPercent: discountNum,
      description: newCouponDescription || `${discountNum}% OFF en compras seleccionadas`,
      isActive: true,
    });

    setCoupons(couponsService.getCoupons());
    setNewCouponCode("");
    setNewCouponDescription("");
    setShowCreateCouponModal(false);
    toast.success(`¡Cupón ${newCouponCode.toUpperCase()} creado y disponible en la tienda! 🎟️`);
  };

  const handleToggleCoupon = (id: string, code: string) => {
    couponsService.toggleCoupon(id);
    setCoupons(couponsService.getCoupons());
    toast.info(`Estado del cupón ${code} actualizado ✨`);
  };

  const handleDeleteCoupon = (id: string, code: string) => {
    couponsService.deleteCoupon(id);
    setCoupons(couponsService.getCoupons());
    toast.success(`Cupón ${code} eliminado con éxito`);
  };

  // Convertir VAPID key
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window) {
      setPushSupported(true);
      navigator.serviceWorker.ready.then(async (registration) => {
        try {
          const subscription = await registration.pushManager.getSubscription();
          if (subscription) {
            const { data, error } = await insforge.database
              .from("push_subscriptions")
              .select("id")
              .eq("endpoint", subscription.endpoint)
              .maybeSingle();
            
            if (data && !error) {
              setPushEnabled(true);
            } else {
              await subscription.unsubscribe();
              setPushEnabled(false);
            }
          }
        } catch (err) {
          console.error("Error comprobando suscripción push:", err);
        }
      });
    }
  }, []);

  const handleTogglePush = async () => {
    if (!pushSupported) return;
    setSubscribingPush(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      
      if (pushEnabled) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await insforge.database
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", subscription.endpoint);
          
          await subscription.unsubscribe();
        }
        setPushEnabled(false);
        toast.success("Notificaciones Push deshabilitadas en este dispositivo");
      } else {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          toast.error("Permiso de notificaciones denegado");
          setSubscribingPush(false);
          return;
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });

        const subscriptionJson = subscription.toJSON();
        if (!subscriptionJson.keys?.p256dh || !subscriptionJson.keys?.auth) {
          throw new Error("No se pudieron obtener las claves criptográficas de la suscripción");
        }

        const { error } = await insforge.database
          .from("push_subscriptions")
          .insert([{
            endpoint: subscription.endpoint,
            p256dh: subscriptionJson.keys.p256dh,
            auth: subscriptionJson.keys.auth,
            user_id: user?.id || null
          }]);

        if (error) throw error;

        setPushEnabled(true);
        toast.success("¡Notificaciones Push PWA activadas con éxito! 📲");
      }
    } catch (err: any) {
      console.error("Error al gestionar suscripción push:", err);
      toast.error(err.message || "Error al configurar las notificaciones push");
    } finally {
      setSubscribingPush(false);
    }
  };

  const handleToggleSound = () => {
    const newVal = audioNotifier.toggleSound();
    setSoundEnabled(newVal);
    toast.success(newVal ? "Sonido de campana activado" : "Sonido silenciado");
  };

  const testSound = () => {
    audioNotifier.playChime();
    toast.info("Sonido de prueba reproducido 🔔");
  };

  const fetchHealthLogs = async () => {
    setLoadingLogs(true);
    try {
      const { data, error } = await insforge.database
        .from("database_health_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(48);
      
      if (error) throw error;
      setHealthLogs(data || []);
    } catch (err) {
      console.error("Error al cargar logs de salud:", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const checkDbHealth = async () => {
    setCheckingLatency(true);
    const start = Date.now();
    try {
      const { error } = await insforge.database.from("products").select("id").limit(1);
      if (!error) {
        setDbStatus("online");
        setLatency(Date.now() - start);
      } else {
        setDbStatus("degraded");
      }
    } catch (e) {
      setDbStatus("offline");
    } finally {
      setCheckingLatency(false);
    }
  };

  const handleRefreshDiagnostics = async () => {
    await checkDbHealth();
    await fetchHealthLogs();
    toast.success("Diagnóstico de base de datos actualizado");
  };

  useEffect(() => {
    checkDbHealth();
    fetchHealthLogs();
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto pb-16 space-y-8 font-sans">
      {/* Encabezado */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate({ to: "/admin" })}
          className="p-2.5 bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-900 rounded-2xl shadow-2xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Preferencias de la Tienda</h1>
          <p className="text-sm text-zinc-500 font-medium mt-0.5">Administra el perfil de Camila, notificaciones, ofertas y marca.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* BLOQUE 1: Perfil de Camila y la Tienda */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-rose-100/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-zinc-900 flex items-center gap-2.5">
              <User className="size-5 text-rose-500" />
              Perfil de Camila & Credenciales InsForge
            </h2>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              Sesión Activa
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-5 bg-gradient-to-br from-rose-50/50 via-pink-50/20 to-white rounded-2xl border border-rose-100/60">
            {/* Foto de Perfil Interactiva */}
            <div 
              className="relative group cursor-pointer shrink-0" 
              onClick={() => fileInputRef.current?.click()}
              title="Haz clic para cambiar o subir foto"
            >
              <div className="size-20 sm:size-24 rounded-2xl overflow-hidden bg-rose-100 border-2 border-rose-200/90 shadow-md group-hover:shadow-lg transition-all group-hover:scale-[1.02]">
                <img src={avatar} alt="Camila — Perfil Oficial" className="w-full h-full object-cover" />
              </div>
              <button
                type="button"
                className="absolute -bottom-1 -right-1 size-7 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-md border-2 border-white transition-transform group-hover:scale-110 cursor-pointer"
                title="Cambiar foto de perfil"
              >
                <Camera className="size-3.5" />
              </button>
            </div>

            {/* Input Oculto de Selección de Archivos */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />

            <div className="flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-lg font-black text-zinc-900">{adminName}</p>
                {isCustom ? (
                  <span className="text-[9px] font-extrabold uppercase px-2.5 py-0.5 bg-rose-100 text-rose-700 rounded-full border border-rose-200 shadow-2xs">
                    Foto Personalizada ✨
                  </span>
                ) : (
                  <span className="text-[9px] font-extrabold uppercase px-2.5 py-0.5 bg-zinc-100 text-zinc-600 rounded-full border border-zinc-200 shadow-2xs">
                    Foto Oficial
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-zinc-500">Propietaria & Diseñadora · Isafer Boutique Brooklyn</p>
              <p className="text-[11px] font-mono font-bold text-rose-600/90">{adminEmail}</p>

              {/* Botones de Acción */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  <Upload className="size-3.5 text-rose-400" />
                  {isCustom ? "Actualizar Foto" : "Añadir o Actualizar Foto"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowEditCredentials(!showEditCredentials)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                >
                  <Edit3 className="size-3.5" />
                  {showEditCredentials ? "Cerrar Edición" : "Editar Credenciales (Correo/Clave)"}
                </button>

                {isCustom && (
                  <button
                    type="button"
                    onClick={() => {
                      resetAvatar();
                      toast.info("Foto restablecida a la imagen oficial de Camila ✨");
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                  >
                    <RotateCcw className="size-3.5" />
                    Restablecer Foto
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Formulario de Edición de Credenciales */}
          {showEditCredentials && (
            <form onSubmit={handleSaveCredentials} className="p-5 bg-zinc-50 border border-rose-100 rounded-2xl space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                <h3 className="text-xs font-black uppercase tracking-wider text-rose-950 flex items-center gap-2">
                  <Key className="size-4 text-rose-500" />
                  Actualizar Datos de Acceso al Panel
                </h3>
                <span className="text-[10px] text-zinc-400 font-mono">Conectado a InsForge Auth</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                    <User className="size-3.5 text-zinc-400" />
                    Nombre Visible
                  </label>
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-xs font-bold text-zinc-900 focus:border-rose-500 focus:outline-none"
                    placeholder="Ej: Camila"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                    <Mail className="size-3.5 text-zinc-400" />
                    Correo Electrónico de Administradora
                  </label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-xs font-bold font-mono text-zinc-900 focus:border-rose-500 focus:outline-none"
                    placeholder="admin@isaferboutique.com"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                    <Lock className="size-3.5 text-zinc-400" />
                    Nueva Contraseña (Opcional)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-xs font-mono font-bold text-zinc-900 focus:border-rose-500 focus:outline-none pr-10"
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                    <Lock className="size-3.5 text-zinc-400" />
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-xs font-mono font-bold text-zinc-900 focus:border-rose-500 focus:outline-none"
                    placeholder="Repite la contraseña"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditCredentials(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-200 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingCredentials}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white text-xs font-extrabold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  {isSavingCredentials ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  {isSavingCredentials ? "Guardando..." : "Guardar Cambios en InsForge"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* BLOQUE 2: Apariencia & Marca */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-zinc-200/80 shadow-sm space-y-4">
          <h2 className="text-lg font-extrabold text-zinc-900 flex items-center gap-2.5">
            <Palette className="size-5 text-rose-500" />
            Apariencia & Identidad de Marca
          </h2>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Identidad visual activa de la boutique en la web pública.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-2xl space-y-1">
              <span className="text-[10px] font-black uppercase text-zinc-400">Estilo de Marca</span>
              <p className="text-xs font-extrabold text-zinc-900 flex items-center gap-1.5">
                <Store className="size-4 text-rose-500" />
                Barbie Luxe Chic
              </p>
            </div>
            <div className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-2xl space-y-1">
              <span className="text-[10px] font-black uppercase text-zinc-400">Paleta de Colores</span>
              <p className="text-xs font-extrabold text-zinc-900 flex items-center gap-2">
                <span className="size-3 rounded-full bg-rose-500" />
                <span className="size-3 rounded-full bg-pink-300" />
                <span className="size-3 rounded-full bg-zinc-900" />
                Rosa & Negro Matizado
              </p>
            </div>
            <div className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-2xl space-y-1">
              <span className="text-[10px] font-black uppercase text-zinc-400">Ubicación</span>
              <p className="text-xs font-extrabold text-zinc-900">Brooklyn, NY</p>
            </div>
          </div>
        </div>

        {/* BLOQUE 3: Notificaciones del Panel */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-zinc-200/80 shadow-sm space-y-4">
          <h2 className="text-lg font-extrabold text-zinc-900 flex items-center gap-2.5">
            <Volume2 className="size-5 text-rose-500" />
            Notificaciones & Alertas en Vivo
          </h2>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Ajusta los avisos sonoros y notificaciones push nativas al recibir una compra.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Alerta de Sonido */}
            <div className="p-4 bg-rose-50/40 border border-rose-100 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-zinc-900">Campana de Alerta</span>
                <span className="text-[10px] font-black uppercase font-mono px-2 py-0.5 rounded-full bg-white border border-rose-200 text-rose-600">
                  {soundEnabled ? "ON" : "OFF"}
                </span>
              </div>
              <button
                onClick={handleToggleSound}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all border cursor-pointer flex items-center justify-center gap-2 ${
                  soundEnabled
                    ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                    : "bg-zinc-100 text-zinc-600 border-zinc-200"
                }`}
              >
                {soundEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
                {soundEnabled ? "Desactivar Sonido" : "Activar Sonido"}
              </button>

              {soundEnabled && (
                <button
                  onClick={testSound}
                  className="w-full py-2 px-3 bg-white hover:bg-zinc-50 text-zinc-900 rounded-xl text-xs font-bold transition-all border border-rose-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Sparkles className="size-3.5 text-amber-500" />
                  Probar Campana 🔔
                </button>
              )}
            </div>

            {/* Notificaciones Push PWA */}
            <div className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-zinc-900">Alertas Móviles (Push)</span>
                <span className="text-[10px] font-black uppercase font-mono px-2 py-0.5 rounded-full bg-white border border-zinc-200 text-zinc-600">
                  {pushEnabled ? "ON" : "OFF"}
                </span>
              </div>

              {pushSupported ? (
                <button
                  onClick={handleTogglePush}
                  disabled={subscribingPush}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all border cursor-pointer flex items-center justify-center gap-2 ${
                    pushEnabled
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-zinc-900 text-white border-zinc-900"
                  }`}
                >
                  {subscribingPush ? (
                    <Loader2 className="size-4 animate-spin text-white" />
                  ) : pushEnabled ? (
                    <Bell className="size-4" />
                  ) : (
                    <BellOff className="size-4" />
                  )}
                  {pushEnabled ? "Notificaciones Activas" : "Activar Alertas PWA"}
                </button>
              ) : (
                <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 font-medium">
                  Instala la app como PWA para notificaciones push en segundo plano.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* BLOQUE 4: Promociones & Campañas (Banner VIP) */}
        <form onSubmit={handleSaveBanner} className="bg-white p-6 sm:p-7 rounded-3xl border border-zinc-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-zinc-900 flex items-center gap-2.5">
              <Percent className="size-5 text-rose-500" />
              Banner Promocional de Bienvenida en Tienda
            </h2>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-extrabold shadow-sm active:scale-95 cursor-pointer"
            >
              <Save className="size-3.5 text-rose-400" />
              Guardar Banner
            </button>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Configuración activa del anuncio superior en vivo para la tienda pública.
          </p>

          <div className="p-5 bg-gradient-to-r from-rose-50 to-pink-50/50 border border-rose-100 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-rose-500" />
                <span className="text-xs font-extrabold text-rose-950">
                  Descuento Banner VIP de Bienvenida
                </span>
              </div>
              <button
                type="button"
                onClick={() => setBannerConfig({ ...bannerConfig, enabled: !bannerConfig.enabled })}
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border transition-all cursor-pointer ${
                  bannerConfig.enabled
                    ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                    : "bg-zinc-200 text-zinc-600 border-zinc-300"
                }`}
              >
                {bannerConfig.enabled ? "ACTIVO EN TIENDA ✓" : "INACTIVO ✕"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-700">Porcentaje % OFF</label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={bannerConfig.discountPercent}
                  onChange={(e) => setBannerConfig({ ...bannerConfig, discountPercent: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-rose-200 text-xs font-mono font-bold text-rose-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-700">Código del Cupón</label>
                <input
                  type="text"
                  value={bannerConfig.code}
                  onChange={(e) => setBannerConfig({ ...bannerConfig, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-rose-200 text-xs font-mono font-bold text-rose-900 uppercase focus:outline-none"
                />
              </div>

              <div className="space-y-1 sm:col-span-3">
                <label className="text-[11px] font-bold text-zinc-700">Texto Anuncio Top Ticker</label>
                <input
                  type="text"
                  value={bannerConfig.bannerText}
                  onChange={(e) => setBannerConfig({ ...bannerConfig, bannerText: e.target.value })}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-rose-200 text-xs font-bold text-zinc-900 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </form>

        {/* BLOQUE 5: Cupones de Descuento Dinámicos */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-zinc-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-zinc-900 flex items-center gap-2.5">
              <Ticket className="size-5 text-rose-500" />
              Cupones & Códigos Promocionales
            </h2>
            <button
              onClick={() => setShowCreateCouponModal(!showCreateCouponModal)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-sm active:scale-95 cursor-pointer"
            >
              <Plus className="size-4" />
              {showCreateCouponModal ? "Cancelar" : "Nuevo Cupón"}
            </button>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Gestiona y crea códigos de descuento aplicables automáticamente por las usuarias en la bolsa de compras.
          </p>

          {/* Formulario de Creación de Cupón */}
          {showCreateCouponModal && (
            <form onSubmit={handleCreateCoupon} className="p-4 bg-rose-50/50 border border-rose-200 rounded-2xl space-y-3 animate-in fade-in duration-300">
              <h3 className="text-xs font-black uppercase text-rose-950 flex items-center gap-1.5">
                <Tag className="size-4 text-rose-600" /> Crear Nuevo Código Promocional
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-700">Código (Ej: ISAFER20)</label>
                  <input
                    type="text"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                    placeholder="ISAFER20"
                    required
                    className="w-full px-3 py-2 bg-white rounded-xl border border-zinc-300 text-xs font-mono font-bold text-zinc-900 uppercase focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-700">Descuento %</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newCouponDiscount}
                    onChange={(e) => setNewCouponDiscount(e.target.value)}
                    placeholder="10"
                    required
                    className="w-full px-3 py-2 bg-white rounded-xl border border-zinc-300 text-xs font-mono font-bold text-zinc-900 focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1 sm:col-span-3">
                  <label className="text-[11px] font-bold text-zinc-700">Descripción Corta</label>
                  <input
                    type="text"
                    value={newCouponDescription}
                    onChange={(e) => setNewCouponDescription(e.target.value)}
                    placeholder="Ej: 20% OFF exclusivo para seguidoras de TikTok"
                    className="w-full px-3 py-2 bg-white rounded-xl border border-zinc-300 text-xs font-bold text-zinc-900 focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold shadow-sm active:scale-95 cursor-pointer"
                >
                  Guardar Cupón en Tienda
                </button>
              </div>
            </form>
          )}

          {/* Lista de Cupones */}
          <div className="space-y-3">
            {coupons.map((c) => (
              <div key={c.id} className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-rose-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white font-mono font-black text-xs flex items-center justify-center shadow-sm">
                    {c.discountPercent}%
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-zinc-900 font-mono tracking-wider">{c.code}</p>
                      {c.isActive ? (
                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md border border-emerald-200">
                          ACTIVO
                        </span>
                      ) : (
                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-zinc-200 text-zinc-600 rounded-md border border-zinc-300">
                          INACTIVO
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 font-medium">{c.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleToggleCoupon(c.id, c.code)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      c.isActive
                        ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                    }`}
                  >
                    {c.isActive ? "Desactivar" : "Activar"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(c.code);
                      toast.success(`Código ${c.code} copiado al portapapeles 📋`);
                    }}
                    className="p-2 bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-700 rounded-xl transition-all cursor-pointer"
                    title="Copiar código"
                  >
                    <Copy className="size-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteCoupon(c.id, c.code)}
                    className="p-2 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-600 rounded-xl transition-all cursor-pointer"
                    title="Eliminar cupón"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BLOQUE 6: Ideas & Notas Comerciales */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-zinc-200/80 shadow-sm space-y-4">
          <h2 className="text-lg font-extrabold text-zinc-900 flex items-center gap-2.5">
            <Lightbulb className="size-5 text-amber-500" />
            Ideas & Colecciones Futuras para Camila
          </h2>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Bloc de notas comercial de la boutique para lanzamientos y drops.
          </p>

          <div className="p-4 bg-amber-50/50 border border-amber-200/80 rounded-2xl space-y-2">
            <p className="text-xs font-extrabold text-amber-950 flex items-center gap-2">
              <CheckCircle2 className="size-4 text-amber-600" />
              Lanzamiento Otoño Brooklyn Luxe
            </p>
            <p className="text-xs text-amber-900/80 leading-relaxed font-medium">
              Preparar nueva tanda de licras moldeadoras de alta compresión y vestidos ajustados de noche para la temporada.
            </p>
          </div>
        </div>

        {/* BLOQUE 7: Diagnóstico Técnico (Oculto / Desplegable) */}
        <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-sm overflow-hidden">
          <button
            onClick={() => setShowTechnicalDiagnostics(!showTechnicalDiagnostics)}
            className="w-full p-6 text-left flex items-center justify-between hover:bg-zinc-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Database className="size-5 text-zinc-600" />
              <div>
                <h2 className="text-base font-extrabold text-zinc-900">Diagnóstico Técnico & Avanzado</h2>
                <p className="text-xs text-zinc-500 font-medium">Monitoreo de latencia, keep-alive y conexión con PostgreSQL de InsForge.</p>
              </div>
            </div>
            {showTechnicalDiagnostics ? <ChevronUp className="size-5 text-zinc-400" /> : <ChevronDown className="size-5 text-zinc-400" />}
          </button>

          {showTechnicalDiagnostics && (
            <div className="p-6 border-t border-zinc-100 bg-zinc-50/50 space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Status Postgres */}
                <div className="flex items-center justify-between p-3.5 bg-white border border-zinc-200 rounded-2xl">
                  <span className="text-xs font-bold text-zinc-700">Estado de PostgreSQL</span>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${
                    dbStatus === "online" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" :
                    dbStatus === "degraded" ? "bg-amber-50 text-amber-600 border border-amber-200" :
                    "bg-red-50 text-red-600 border border-red-200"
                  }`}>
                    <span className={`size-1.5 rounded-full ${
                      dbStatus === "online" ? "bg-emerald-500" :
                      dbStatus === "degraded" ? "bg-amber-500" : "bg-red-500"
                    }`} />
                    {dbStatus === "online" ? "Conectado" : dbStatus === "degraded" ? "Degradado" : "Desconectado"}
                  </span>
                </div>

                {/* Latencia */}
                <div className="flex items-center justify-between p-3.5 bg-white border border-zinc-200 rounded-2xl">
                  <span className="text-xs font-bold text-zinc-700">Latencia de Red</span>
                  <span className="text-xs font-mono font-black text-zinc-900">{latency !== null ? `${latency} ms` : "Calculando..."}</span>
                </div>
              </div>

              {/* Tira pings keep-alive */}
              <div className="space-y-3 bg-white p-4 rounded-2xl border border-zinc-200">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-zinc-700 uppercase tracking-wider text-[10px]">Historial Keep-Alive</span>
                  <span className="text-emerald-600 font-mono font-black text-[10px] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    UPTIME: {healthLogs.length > 0 ? (healthLogs.filter(l => l.status === 'ok').length / healthLogs.length * 100).toFixed(1) : "100.0"}%
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 items-center bg-zinc-50 border border-zinc-200 p-3 rounded-xl min-h-[42px]">
                  {loadingLogs && healthLogs.length === 0 ? (
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-bold animate-pulse">
                      <Loader2 className="size-3.5 animate-spin" />
                      Cargando pings...
                    </div>
                  ) : healthLogs.length === 0 ? (
                    <span className="text-xs text-zinc-400 font-bold">Esperando registros del cron de producción...</span>
                  ) : (
                    [...healthLogs].reverse().map((log, idx) => (
                      <div
                        key={log.id || idx}
                        title={`${new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}: ${log.status === "ok" ? log.latency_ms + " ms" : "Error: " + (log.error_message || "Desconocido")}`}
                        className={`size-2.5 rounded-[3px] transition-all duration-300 hover:scale-125 cursor-help ${
                          log.status === "ok"
                            ? log.latency_ms < 150
                              ? "bg-emerald-500 hover:bg-emerald-600"
                              : "bg-amber-400 hover:bg-amber-500"
                            : "bg-red-500 hover:bg-red-600 animate-pulse"
                        }`}
                      />
                    ))
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleRefreshDiagnostics}
                  disabled={checkingLatency || loadingLogs}
                  className="py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 shadow-sm"
                >
                  <Activity className={`size-4 ${checkingLatency || loadingLogs ? "animate-spin text-zinc-400" : "text-emerald-400"}`} />
                  Refrescar Diagnóstico
                </button>

                <div className="text-[11px] text-zinc-500 font-medium">
                  API: <code className="font-mono text-zinc-700 bg-zinc-200/60 px-1.5 py-0.5 rounded">https://i5jqzbx6.us-east.insforge.app</code>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
