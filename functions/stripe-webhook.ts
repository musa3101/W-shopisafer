import { createClient } from "npm:@insforge/sdk@1.5.2";

export default async function (req: Request) {
  try {
    const payload = await req.text();
    const sig = req.headers.get("stripe-signature");

    console.log("Webhook de Stripe recibido!");

    // En entorno de test, si no se tiene configurada la firma, parseamos directo
    let event;
    try {
      event = JSON.parse(payload);
    } catch (e) {
      console.error("Error al parsear el JSON de la solicitud:", e);
      return new Response("Invalid JSON payload", { status: 400 });
    }

    console.log(`Evento de Stripe: ${event.type}`);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.metadata?.order_id;
      const customerEmail = session.customer_details?.email || session.customer_email;
      const customerName = session.customer_details?.name || "Cliente";

      console.log(`Checkout completo para la orden ID: ${orderId}, Email: ${customerEmail}`);

      if (orderId) {
        // Inicializar cliente de administración de InsForge
        const insforgeUrl = Deno.env.get("INSFORGE_URL") || "https://i5jqzbx6.us-east.insforge.app";
        const serviceKey = Deno.env.get("INSFORGE_API_KEY") || Deno.env.get("INSFORGE_SERVICE_ROLE_KEY") || "";

        if (!serviceKey) {
          console.error("INSFORGE_API_KEY no encontrada en las variables de entorno!");
        }

        const insforge = createClient({
          baseUrl: insforgeUrl,
          anonKey: serviceKey, // Usamos la key de administración para bypassear RLS
        });

        // 1. Actualizar el estado del pedido en PostgreSQL
        console.log(`Actualizando orden ${orderId} a estado 'processing'...`);
        const { data, error } = await insforge.database
          .from("orders")
          .update({ status: "processing" })
          .eq("id", orderId)
          .select()
          .single();

        if (error) {
          console.error(`Error actualizando orden ${orderId} en base de datos:`, error);
        } else {
          console.log(`✓ Orden ${orderId} actualizada con éxito en PostgreSQL. Datos:`, data);

          // 2. Enviar email de confirmación si el cliente tiene email
          if (customerEmail) {
            console.log(`Enviando correo de confirmación a ${customerEmail}...`);
            const totalAmount = data.total_amount ? Number(data.total_amount).toFixed(2) : "0.00";
            
            const emailHtml = `
              <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ffe4ec; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); background-color: #fffafb;">
                <div style="background-color: #e11d48; padding: 24px; text-align: center; border-bottom: 2px solid #be123c;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase;">Isafer Boutique</h1>
                </div>
                <div style="padding: 32px; color: #333333; line-height: 1.6;">
                  <h2 style="color: #e11d48; margin-top: 0; font-size: 20px;">¡Gracias por tu compra, ${customerName}! 💖</h2>
                  <p>Hemos recibido tu pago con éxito y estamos preparando tus prendas para el envío.</p>
                  
                  <div style="background-color: #ffffff; border: 1px solid #fecdd3; border-radius: 12px; padding: 20px; margin: 24px 0;">
                    <h3 style="margin-top: 0; color: #be123c; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Detalles de la Orden</h3>
                    <p style="margin: 6px 0; font-size: 14px;"><strong>ID de Orden:</strong> <span style="font-family: monospace;">#${orderId.slice(0, 8)}</span></p>
                    <p style="margin: 6px 0; font-size: 14px;"><strong>Total Pagado:</strong> <span style="color: #e11d48; font-weight: bold;">$${totalAmount} USD</span></p>
                    <p style="margin: 6px 0; font-size: 14px;"><strong>Estado del Pago:</strong> <span style="background-color: #d1fae5; color: #065f46; padding: 2px 8px; border-radius: 9999px; font-size: 12px; font-weight: bold;">Completado</span></p>
                  </div>
                  
                  <p>Si tienes alguna pregunta o quieres coordinar detalles específicos de la entrega en Brooklyn, no dudes en escribirnos por nuestro WhatsApp oficial pulsando el siguiente enlace:</p>
                  
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="https://wa.me/19296772514?text=Hola%20Isafer%20Boutique%2C%20acabo%20de%20realizar%20un%20pago%20con%20tarjeta%20para%20la%20orden%20%23${orderId.slice(0,8)}" 
                       style="background-color: #10b981; color: #ffffff; padding: 14px 28px; border-radius: 9999px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px rgba(16,185,129,0.2);">
                       Escribir por WhatsApp
                    </a>
                  </div>
                  
                  <hr style="border: 0; border-top: 1px solid #fecdd3; margin: 32px 0;" />
                  <p style="font-size: 12px; color: #888888; text-align: center; margin: 0;">
                    Este es un correo automático de confirmación de Isafer Boutique · Brooklyn, NY.
                  </p>
                </div>
              </div>
            `;

            const emailRes = await insforge.emails.send({
              to: customerEmail,
              subject: "¡Confirmación de Pedido Recibido! · Isafer Boutique 💖",
              html: emailHtml,
              from: "Isafer Boutique",
            });

            if (emailRes.error) {
              console.error("Error al enviar email de confirmación:", emailRes.error);
            } else {
              console.log(`✓ Correo de confirmación enviado exitosamente a ${customerEmail}.`);
            }
          }

          // 3. Notificar a la dueña Camila por WhatsApp mediante CallMeBot si la API key está presente
          const callmebotApiKey = Deno.env.get("CALLMEBOT_API_KEY");
          const ownerPhone = Deno.env.get("OWNER_PHONE") || "19296772514"; // Teléfono de Camila por defecto

          if (callmebotApiKey) {
            console.log(`Enviando notificación por WhatsApp a Camila (${ownerPhone})...`);
            const totalAmount = data.total_amount ? Number(data.total_amount).toFixed(2) : "0.00";
            
            const wsMessage = `👑 *¡Nuevo Pedido Pagado en Stripe!* 👑\n\n` +
                              `📝 *Orden:* #${orderId.slice(0, 8)}\n` +
                              `👤 *Cliente:* ${customerName} (${customerEmail || "Sin email"})\n` +
                              `💰 *Total:* $${totalAmount} USD\n\n` +
                              `💖 _Revisa tu panel de Camila para ver los detalles._`;

            try {
              const encodedMessage = encodeURIComponent(wsMessage);
              const callmebotUrl = `https://api.callmebot.com/whatsapp.php?phone=${ownerPhone}&text=${encodedMessage}&apikey=${callmebotApiKey}`;
              
              const wsRes = await fetch(callmebotUrl);
              if (wsRes.ok) {
                console.log("✓ WhatsApp de notificación enviado exitosamente a Camila.");
              } else {
                console.error("Fallo al enviar notificación por WhatsApp a CallMeBot:", await wsRes.text());
              }
            } catch (wsErr) {
              console.error("Excepción al enviar notificación por WhatsApp:", wsErr);
            }
          } else {
            console.log("Notificación de WhatsApp omitida: CALLMEBOT_API_KEY no configurada.");
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("Excepción en la Edge Function:", err.message);
    return new Response(err.message, { status: 500 });
  }
}
