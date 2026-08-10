import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { audioNotifier } from "@/lib/audioNotifier";
import { ArrowLeft, Volume2, VolumeX, Database, ShieldAlert, Sparkles, Activity, Bell, BellOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { insforge } from "@/lib/insforge";
import { VAPID_PUBLIC_KEY } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin/ajustes")({
  component: AjustesPage,
});

function AjustesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [soundEnabled, setSoundEnabled] = useState(audioNotifier.isEnabled());
  const [latency, setLatency] = useState<number | null>(null);
  const [checkingLatency, setCheckingLatency] = useState(false);
  const [dbStatus, setDbStatus] = useState<string>("unknown");

  // Estados de Notificación Push PWA
  const [pushSupported, setPushSupported] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [subscribingPush, setSubscribingPush] = useState(false);

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

  // Comprobar estado de suscripción Push al cargar
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window) {
      setPushSupported(true);
      navigator.serviceWorker.ready.then(async (registration) => {
        try {
          const subscription = await registration.pushManager.getSubscription();
          if (subscription) {
            // Verificar si existe en la base de datos de InsForge
            const { data, error } = await insforge.database
              .from("push_subscriptions")
              .select("id")
              .eq("endpoint", subscription.endpoint)
              .maybeSingle();
            
            if (data && !error) {
              setPushEnabled(true);
            } else {
              // Si el SW está suscrito en el navegador pero no en la DB, lo des-suscribimos
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
        // Desactivar Notificaciones Push
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          // Eliminar de InsForge DB
          await insforge.database
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", subscription.endpoint);
          
          await subscription.unsubscribe();
        }
        setPushEnabled(false);
        toast.success("Notificaciones Push desactivadas en este dispositivo");
      } else {
        // Activar Notificaciones Push
        // 1. Pedir permiso
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          toast.error("Permiso de notificaciones denegado");
          setSubscribingPush(false);
          return;
        }

        // 2. Suscribir en el Push Manager
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });

        // 3. Guardar en InsForge DB
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
    toast.success(newVal ? "Notificaciones de sonido activadas" : "Notificaciones de sonido silenciadas");
  };

  const testSound = () => {
    audioNotifier.playChime();
    toast.info("Sonido de prueba reproducido 🔔");
  };

  // Estados de Monitoreo Continuo
  const [healthLogs, setHealthLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fetchHealthLogs = async () => {
    setLoadingLogs(true);
    try {
      const { data, error } = await insforge.database
        .from("database_health_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(48); // Los últimos 48 logs (8 horas de pings de 10 min)
      
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
  };

  useEffect(() => {
    checkDbHealth();
    fetchHealthLogs();
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto pb-12 space-y-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate({ to: "/admin" })}
          className="p-2 bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-900 rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Ajustes del Sistema</h1>
          <p className="text-zinc-500 font-medium">Controla las configuraciones de sonido y diagnósticos del servidor.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Notificaciones */}
        <div className="bg-white p-6 rounded-xl border border-zinc-200 space-y-4">
          <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <Volume2 className="size-5 text-rose-500" />
            Notificaciones del Panel
          </h2>
          <p className="text-sm text-zinc-500">
            Controla las notificaciones de sonido y alertas nativas en este dispositivo.
          </p>

          <div className="space-y-4 pt-2">
            {/* Alerta de Sonido */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Sonido en Navegador</span>
              <button
                onClick={handleToggleSound}
                className={`flex items-center justify-between w-full py-3 px-4 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  soundEnabled
                    ? "bg-rose-50 border-rose-200 text-rose-600"
                    : "bg-zinc-50 border-zinc-200 text-zinc-500"
                }`}
              >
                <div className="flex items-center gap-2">
                  {soundEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
                  <span>Campana de nuevos pedidos</span>
                </div>
                <span className="font-black font-mono">{soundEnabled ? "ON" : "OFF"}</span>
              </button>

              {soundEnabled && (
                <button
                  onClick={testSound}
                  className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="size-4 text-amber-400" />
                  Probar Sonido
                </button>
              )}
            </div>

            {/* Notificaciones Push PWA */}
            <div className="border-t border-zinc-100 pt-4 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Alertas Móviles (Push)</span>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Recibe notificaciones PWA nativas en segundo plano (incluso con la aplicación cerrada) cuando entre una venta en Stripe.
              </p>
              
              {pushSupported ? (
                <button
                  onClick={handleTogglePush}
                  disabled={subscribingPush}
                  className={`flex items-center justify-between w-full py-3 px-4 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    pushEnabled
                      ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                      : "bg-zinc-50 border-zinc-200 text-zinc-500"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {subscribingPush ? (
                      <Loader2 className="size-4 animate-spin text-zinc-400" />
                    ) : pushEnabled ? (
                      <Bell className="size-4" />
                    ) : (
                      <BellOff className="size-4" />
                    )}
                    <span>Notificaciones Push PWA</span>
                  </div>
                  <span className="font-black font-mono">
                    {subscribingPush ? "..." : pushEnabled ? "ON" : "OFF"}
                  </span>
                </button>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-250 text-amber-700 rounded-xl text-xs font-medium">
                  Las notificaciones push no están soportadas en este navegador o modo incógnito. Instala la app como PWA para habilitarlas.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Estado e Infraestructura */}
        <div className="bg-white p-6 rounded-xl border border-zinc-200 space-y-4">
          <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <Database className="size-5 text-zinc-700" />
            Infraestructura InsForge
          </h2>
          <p className="text-sm text-zinc-500">
            Diagnósticos del estado de conexión y monitoreo de la base de datos de la boutique.
          </p>

          <div className="space-y-4 pt-2">
            {/* Status Postgres */}
            <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
              <span className="text-xs font-bold text-zinc-600">Base de datos PostgreSQL</span>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
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

            {/* Latencia Instantánea */}
            {dbStatus === "online" && latency !== null && (
              <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                <span className="text-xs font-bold text-zinc-600">Latencia de Red actual</span>
                <span className="text-xs font-mono font-black text-zinc-800">{latency} ms</span>
              </div>
            )}

            {/* Métricas del Keep-Alive */}
            <div className="border-t border-zinc-100 pt-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-zinc-500 uppercase tracking-wider text-[10px]">Monitoreo Continuo (Keep-Alive)</span>
                <span className="text-emerald-600 font-extrabold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  UPTIME: {healthLogs.length > 0 ? (healthLogs.filter(l => l.status === 'ok').length / healthLogs.length * 100).toFixed(1) : "100.0"}%
                </span>
              </div>

              {/* Tira de cuadritos de pings */}
              <div className="flex flex-col gap-1.5">
                <div className="flex flex-wrap gap-1 items-center bg-zinc-50 border border-zinc-150 p-3 rounded-xl min-h-[42px] justify-start">
                  {loadingLogs && healthLogs.length === 0 ? (
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-bold animate-pulse">
                      <Loader2 className="size-3.5 animate-spin animate-spin" />
                      Cargando historial de pings...
                    </div>
                  ) : healthLogs.length === 0 ? (
                    <span className="text-xs text-zinc-400 font-bold">Sin logs registrados aún (esperando al cron...)</span>
                  ) : (
                    [...healthLogs].reverse().map((log, idx) => (
                      <div
                        key={log.id || idx}
                        title={`${new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}: ${log.status === "ok" ? log.latency_ms + " ms" : "Error: " + (log.error_message || "Desconocido")}`}
                        className={`size-2.5 rounded-[3px] transition-all duration-300 hover:scale-125 cursor-help ${
                          log.status === "ok"
                            ? log.latency_ms < 150
                              ? "bg-emerald-500 hover:bg-emerald-600"
                              : log.latency_ms < 300
                              ? "bg-emerald-400 hover:bg-emerald-500"
                              : "bg-amber-400 hover:bg-amber-500"
                            : "bg-red-500 hover:bg-red-600 animate-pulse"
                        }`}
                      />
                    ))
                  )}
                </div>
                <div className="flex justify-between items-center text-[10px] text-zinc-400 font-semibold px-0.5">
                  <span>Hace ~8 horas</span>
                  {healthLogs.filter(l => l.status === 'ok').length > 0 && (
                    <span>Latencia media: {Math.round(healthLogs.filter(l => l.status === 'ok').reduce((sum, l) => sum + l.latency_ms, 0) / healthLogs.filter(l => l.status === 'ok').length)} ms</span>
                  )}
                  <span>Ahora (pings cada 10m)</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleRefreshDiagnostics}
              disabled={checkingLatency || loadingLogs}
              className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-zinc-250 text-zinc-800 rounded-xl text-xs font-bold transition-all border border-zinc-200 cursor-pointer flex items-center justify-center gap-2"
            >
              <Activity className={`size-4 ${checkingLatency || loadingLogs ? "animate-spin text-zinc-500" : "text-zinc-600"}`} />
              Diagnosticar y Refrescar
            </button>
          </div>
        </div>
      </div>

      {/* Seguridad e Info */}
      <div className="bg-white p-6 rounded-xl border border-zinc-200 space-y-4">
        <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
          <ShieldAlert className="size-5 text-amber-500" />
          Keep-Alive & Seguridad
        </h2>
        <p className="text-sm text-zinc-500">
          El endpoint de salud <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-900 font-mono text-xs">/api/health</code> y la tarea programada interna (Cron) de Cloudflare están configurados y funcionando cada 10 minutos para mantener a InsForge despierto.
        </p>
        <div className="border-t border-zinc-100 pt-4 flex flex-col gap-1.5 text-xs text-zinc-400">
          <p><strong>Proyecto:</strong> isafer-boutique (Production API)</p>
          <p><strong>Base API:</strong> https://i5jqzbx6.us-east.insforge.app</p>
          <p><strong>Seguridad:</strong> Autenticación RLS activa en base de datos PostgreSQL.</p>
        </div>
      </div>
    </div>
  );
}
