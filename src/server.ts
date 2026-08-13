import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (
    request: Request,
    env: unknown,
    ctx: unknown,
  ) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(
  response: Response,
): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (
    !body.includes('"unhandled":true') ||
    !body.includes('"message":"HTTPError"')
  ) {
    return response;
  }

  console.error(
    consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`),
  );
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

import { insforge } from "./lib/insforge";

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);
    if (url.pathname === "/api/health") {
      try {
        // Ping ligero real a PostgreSQL en InsForge
        await insforge.database.from("products").select("id").limit(1);
        return new Response(
          JSON.stringify({
            status: "ok",
            insforge: "connected",
            timestamp: Date.now(),
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      } catch (error: any) {
        return new Response(
          JSON.stringify({
            status: "error",
            error: error?.message || "Unknown error",
          }),
          { status: 500, headers: { "Content-Type": "application/json" } },
        );
      }
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },

  // Handler programado para el Keep-Alive (Cron trigger)
  async scheduled(event: any, env: any, ctx: any) {
    console.log("Ejecutando Keep-Alive Cron (Ping a Insforge)...");
    const start = Date.now();
    try {
      await insforge.database.from("products").select("id").limit(1);
      const latency = Date.now() - start;
      console.log(`Ping exitoso a Insforge (${latency} ms).`);

      // Guardar log en base de datos
      await insforge.database.from("database_health_logs").insert([
        {
          latency_ms: latency,
          status: "ok",
          error_message: null,
        },
      ]);
    } catch (e: any) {
      const latency = Date.now() - start;
      const errorMsg = e?.message || "Unknown health-check error";
      console.error(
        `Error en Keep-Alive a Insforge (${latency} ms):`,
        errorMsg,
      );

      try {
        await insforge.database.from("database_health_logs").insert([
          {
            latency_ms: latency,
            status: "error",
            error_message: errorMsg,
          },
        ]);
      } catch (insertErr) {
        console.error(
          "No se pudo insertar el log de error en la base de datos:",
          insertErr,
        );
      }
    }
  },
};
