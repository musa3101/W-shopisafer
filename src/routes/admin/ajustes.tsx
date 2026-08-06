import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { audioNotifier } from "@/lib/audioNotifier";
import { ArrowLeft, Volume2, VolumeX, Database, ShieldAlert, Sparkles, Activity } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/ajustes")({
  component: AjustesPage,
});

function AjustesPage() {
  const navigate = useNavigate();
  const [soundEnabled, setSoundEnabled] = useState(audioNotifier.isEnabled());
  const [latency, setLatency] = useState<number | null>(null);
  const [checkingLatency, setCheckingLatency] = useState(false);
  const [dbStatus, setDbStatus] = useState<string>("unknown");

  const handleToggleSound = () => {
    const newVal = audioNotifier.toggleSound();
    setSoundEnabled(newVal);
    toast.success(newVal ? "Notificaciones de sonido activadas" : "Notificaciones de sonido silenciadas");
  };

  const testSound = () => {
    audioNotifier.playChime();
    toast.info("Sonido de prueba reproducido 🔔");
  };

  const checkDbHealth = async () => {
    setCheckingLatency(true);
    const start = Date.now();
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        const data = await res.json() as { status: string; insforge: string };
        if (data.status === "ok" && data.insforge === "connected") {
          setDbStatus("online");
          setLatency(Date.now() - start);
        } else {
          setDbStatus("degraded");
        }
      } else {
        setDbStatus("offline");
      }
    } catch (e) {
      setDbStatus("offline");
    } finally {
      setCheckingLatency(false);
    }
  };

  useEffect(() => {
    checkDbHealth();
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
            Notificaciones de Pedidos
          </h2>
          <p className="text-sm text-zinc-500">
            Controla si la aplicación emite una campana sonora cuando entra un nuevo pedido.
          </p>

          <div className="flex flex-col gap-2 pt-2">
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
        </div>

        {/* Estado e Infraestructura */}
        <div className="bg-white p-6 rounded-xl border border-zinc-200 space-y-4">
          <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <Database className="size-5 text-zinc-700" />
            Infraestructura InsForge
          </h2>
          <p className="text-sm text-zinc-500">
            Diagnósticos del estado de conexión de la base de datos de la boutique.
          </p>

          <div className="space-y-3 pt-2">
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

            {dbStatus === "online" && latency !== null && (
              <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                <span className="text-xs font-bold text-zinc-600">Latencia de Red</span>
                <span className="text-xs font-mono font-black text-zinc-800">{latency} ms</span>
              </div>
            )}

            <button
              onClick={checkDbHealth}
              disabled={checkingLatency}
              className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-zinc-250 text-zinc-800 rounded-xl text-xs font-bold transition-all border border-zinc-200 cursor-pointer flex items-center justify-center gap-2"
            >
              <Activity className={`size-4 ${checkingLatency ? "animate-spin text-zinc-500" : "text-zinc-600"}`} />
              Comprobar Latencia
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
