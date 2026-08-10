import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { audioNotifier } from "@/lib/audioNotifier";
import { 
  ArrowLeft, Volume2, VolumeX, Database, ShieldAlert, Sparkles, 
  Activity, Bell, BellOff, Loader2, User, Store, Tag, Percent, 
  Lightbulb, ChevronDown, ChevronUp, Palette, CheckCircle2, Ticket,
  Camera, Upload, RotateCcw
} from "lucide-react";
import { toast } from "sonner";
import { insforge } from "@/lib/insforge";
import { VAPID_PUBLIC_KEY } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAvatar } from "@/hooks/useAdminAvatar";

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

  // Estado Secciones Desplegables
  const [showTechnicalDiagnostics, setShowTechnicalDiagnostics] = useState(false);

  // Estado Promociones & Cupones (UI Estructurada)
  const [couponCode, setCouponCode] = useState("ISAFER10");
  const [couponDiscount, setCouponDiscount] = useState("10");
  const [couponActive, setCouponActive] = useState(true);

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
              Perfil de Camila
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
                <p className="text-lg font-black text-zinc-900">Camila</p>
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
              <p className="text-[11px] font-mono font-bold text-rose-600/90">admin@isaferboutique.com</p>

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

                {isCustom && (
                  <button
                    type="button"
                    onClick={() => {
                      resetAvatar();
                      toast.info("Foto restablecida a la imagen oficial de Camila ✨");
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                  >
                    <RotateCcw className="size-3.5" />
                    Restablecer Foto Inicial
                  </button>
                )}
              </div>
            </div>
          </div>
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

        {/* BLOQUE 4: Promociones & Campañas (UI) */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-zinc-200/80 shadow-sm space-y-4">
          <h2 className="text-lg font-extrabold text-zinc-900 flex items-center gap-2.5">
            <Percent className="size-5 text-rose-500" />
            Promociones & Descuentos de Temporada
          </h2>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Configuración activa de banners promocionales para la tienda.
          </p>

          <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-50/50 border border-rose-100 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-rose-950 flex items-center gap-1.5">
                <Sparkles className="size-4 text-rose-500" />
                Descuento Banner VIP de Bienvenida
              </span>
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                ACTIVO EN TIENDA
              </span>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Muestra un <strong>10% OFF</strong> automático en la bolsa de compras a usuarias nuevas con el código <code className="bg-white px-1.5 py-0.5 rounded border border-rose-200 text-rose-600 font-mono font-bold">ISAFER10</code>.
            </p>
          </div>
        </div>

        {/* BLOQUE 5: Cupones de Descuento (UI) */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-zinc-200/80 shadow-sm space-y-4">
          <h2 className="text-lg font-extrabold text-zinc-900 flex items-center gap-2.5">
            <Ticket className="size-5 text-rose-500" />
            Cupones & Códigos Promocionales
          </h2>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Gestiona códigos de descuento creados para promociones en Instagram y TikTok.
          </p>

          <div className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 font-mono font-black text-xs flex items-center justify-center">
                %
              </div>
              <div>
                <p className="text-xs font-black text-zinc-900 font-mono tracking-wider">{couponCode}</p>
                <p className="text-[11px] text-zinc-500 font-medium">10% de descuento en la primera compra</p>
              </div>
            </div>
            <button
              onClick={() => toast.success("Código de cupón ISAFER10 copiado al portapapeles 📋")}
              className="px-3.5 py-2 bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-800 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-2xs"
            >
              Copiar Código
            </button>
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
