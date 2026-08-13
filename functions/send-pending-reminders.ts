import { createClient } from "npm:@insforge/sdk@1.5.2";

export default async function (req: Request) {
  try {
    console.log(
      "Iniciando tarea programada: Enviar recordatorios de pedidos pendientes...",
    );

    // Inicializar cliente de administración de InsForge
    const insforgeUrl =
      Deno.env.get("INSFORGE_URL") || "https://i5jqzbx6.us-east.insforge.app";
    const serviceKey =
      Deno.env.get("INSFORGE_API_KEY") ||
      Deno.env.get("INSFORGE_SERVICE_ROLE_KEY") ||
      "";
    const ownerPhone = Deno.env.get("OWNER_PHONE") || "19296772514";

    if (!serviceKey) {
      console.error(
        "INSFORGE_API_KEY no encontrada en las variables de entorno!",
      );
      return new Response("Missing API Key", { status: 500 });
    }

    const insforge = createClient({
      baseUrl: insforgeUrl,
      anonKey: serviceKey, // Bypassear RLS
    });

    // Calcular límites de tiempo
    // Creados hace más de 24 horas y menos de 7 días (para evitar spamear pedidos antiguos)
    const timeLimit24h = new Date(
      Date.now() - 24 * 60 * 60 * 1000,
    ).toISOString();
    const timeLimit7d = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000,
    ).toISOString();

    console.log(
      `Buscando órdenes pendientes creadas entre ${timeLimit7d} y ${timeLimit24h}...`,
    );

    const { data: pendingOrders, error: fetchError } = await insforge.database
      .from("orders")
      .select("*")
      .eq("status", "pending")
      .eq("reminder_sent", false)
      .lt("created_at", timeLimit24h)
      .gt("created_at", timeLimit7d);

    if (fetchError) {
      console.error(
        "Error al buscar órdenes pendientes en PostgreSQL:",
        fetchError,
      );
      return new Response(JSON.stringify({ error: fetchError.message }), {
        status: 500,
      });
    }

    if (!pendingOrders || pendingOrders.length === 0) {
      console.log(
        "No se encontraron pedidos pendientes que califiquen para recordatorio.",
      );
      return new Response(
        JSON.stringify({ message: "No pending orders to remind.", count: 0 }),
        { status: 200 },
      );
    }

    console.log(
      `Se encontraron ${pendingOrders.length} pedido(s) pendiente(s). Procesando correos...`,
    );
    let emailsSentCount = 0;

    for (const order of pendingOrders) {
      const {
        id,
        customer_name,
        customer_email,
        total_amount,
        items,
        stripe_session_id,
      } = order;

      if (
        !customer_email ||
        customer_email.includes("cliente@isaferboutique.com")
      ) {
        console.log(
          `Orden #${id.slice(0, 8)} omitida: Es un invitado sin correo real.`,
        );
        // Marcar como procesado para no volver a evaluarlo
        await insforge.database
          .from("orders")
          .update({ reminder_sent: true })
          .eq("id", id);
        continue;
      }

      console.log(
        `Enviando recordatorio para Orden #${id.slice(0, 8)} a ${customer_email}...`,
      );

      // Parsear items si están en string
      const parsedItems =
        typeof items === "string" ? JSON.parse(items) : items || [];
      const itemsHtml = Array.isArray(parsedItems)
        ? parsedItems
            .map(
              (item: any) =>
                `<li style="margin: 8px 0; font-size: 14px;"><strong>${item.name || "Prenda"}</strong> x${item.quantity || 1} - <span style="color: #e11d48;">$${((item.price || 0) * (item.quantity || 1)).toFixed(2)} USD</span></li>`,
            )
            .join("")
        : "";

      // Generar link de pago o confirmación de WhatsApp
      let actionUrl = `https://wa.me/${ownerPhone}?text=Hola%20Isafer%20Boutique%2C%20quisiera%20confirmar%20mi%20pedido%20pendiente%20%23${id.slice(0, 8)}`;
      let actionText = "Confirmar por WhatsApp 💬";
      let actionDescription =
        "Para coordinar el pago en efectivo o por Zelle, y agendar tu retiro o envío, escríbenos directamente a nuestro WhatsApp oficial pulsando el botón inferior:";

      if (stripe_session_id) {
        // Si el pedido tiene un ID de sesión de Stripe, es un pedido con tarjeta pendiente
        // Aunque generalmente en Stripe las sesiones expiran en 24h, redirigimos a WhatsApp para soporte si es necesario,
        // o proporcionamos la redirección si la sesión sigue activa.
        actionText = "Completar Pago con Tarjeta 💳";
        actionDescription =
          "Vemos que iniciaste el proceso de pago con tarjeta pero no se completó. Puedes pulsar abajo para escribirnos a nuestro WhatsApp y te ayudaremos a finalizarlo:";
      }

      const emailHtml = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ffe4ec; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); background-color: #fffafb;">
          <div style="background-color: #e11d48; padding: 24px; text-align: center; border-bottom: 2px solid #be123c;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase;">Isafer Boutique</h1>
          </div>
          <div style="padding: 32px; color: #333333; line-height: 1.6;">
            <h2 style="color: #e11d48; margin-top: 0; font-size: 20px;">¡Hola, ${customer_name}! 💖</h2>
            <p>Queríamos recordarte que tienes un pedido pendiente por completar en nuestra boutique. ¡Tus prendas te están esperando!</p>
            
            <div style="background-color: #ffffff; border: 1px solid #fecdd3; border-radius: 12px; padding: 20px; margin: 24px 0;">
              <h3 style="margin-top: 0; color: #be123c; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Resumen del Pedido</h3>
              <p style="margin: 6px 0; font-size: 14px;"><strong>ID de Orden:</strong> <span style="font-family: monospace;">#${id.slice(0, 8)}</span></p>
              <ul style="padding-left: 20px; margin: 12px 0;">
                ${itemsHtml}
              </ul>
              <p style="margin: 6px 0; font-size: 14px; border-top: 1px solid #fecdd3; padding-top: 8px;"><strong>Total del Pedido:</strong> <span style="color: #e11d48; font-weight: bold;">$${Number(total_amount).toFixed(2)} USD</span></p>
            </div>
            
            <p>${actionDescription}</p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${actionUrl}" 
                 style="background-color: #10b981; color: #ffffff; padding: 14px 28px; border-radius: 9999px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px rgba(16,185,129,0.2);">
                 ${actionText}
              </a>
            </div>
            
            <p style="font-size: 13px; color: #666666;">
              Si ya realizaste tu confirmación o realizaste otro pedido, por favor ignora este mensaje. Si tienes dudas, contáctanos respondiendo a este email.
            </p>
            
            <hr style="border: 0; border-top: 1px solid #fecdd3; margin: 32px 0;" />
            <p style="font-size: 12px; color: #888888; text-align: center; margin: 0;">
              Este es un correo automático de recordatorio de Isafer Boutique · Brooklyn, NY.
            </p>
          </div>
        </div>
      `;

      const emailRes = await insforge.emails.send({
        to: customer_email,
        subject:
          "💖 ¿Aún quieres tus prendas? Recordatorio de Pedido Pendiente · Isafer Boutique",
        html: emailHtml,
        from: "Isafer Boutique",
      });

      if (emailRes.error) {
        console.error(
          `Error al enviar email de recordatorio para orden #${id.slice(0, 8)}:`,
          emailRes.error,
        );
      } else {
        console.log(
          `✓ Email de recordatorio enviado exitosamente a ${customer_email}.`,
        );
        emailsSentCount++;
      }

      // Marcar como recordatorio enviado en la base de datos (independiente de si el correo dio error,
      // para evitar reintentar infinitamente en bucle)
      await insforge.database
        .from("orders")
        .update({ reminder_sent: true })
        .eq("id", id);
    }

    console.log(
      `Recordatorios de pedidos finalizado. Emails enviados: ${emailsSentCount}`,
    );
    return new Response(
      JSON.stringify({
        success: true,
        message: "Reminders processed.",
        sent: emailsSentCount,
      }),
      { headers: { "Content-Type": "application/json" }, status: 200 },
    );
  } catch (err: any) {
    console.error(
      "Excepción en la Edge Function de recordatorios:",
      err.message,
    );
    return new Response(err.message, { status: 500 });
  }
}
