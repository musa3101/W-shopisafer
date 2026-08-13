import { createClient } from "npm:@insforge/sdk@1.5.2";

export default async function (req: Request) {
  try {
    console.log(
      "Iniciando tarea programada: Procesar recuperación de carritos abandonados...",
    );

    // Inicializar cliente de administración de InsForge
    const insforgeUrl =
      Deno.env.get("INSFORGE_URL") || "https://i5jqzbx6.us-east.insforge.app";
    const serviceKey =
      Deno.env.get("INSFORGE_API_KEY") ||
      Deno.env.get("INSFORGE_SERVICE_ROLE_KEY") ||
      "";

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

    // Calcular límites de tiempo: inactividad entre 2 y 24 horas
    const timeLimit2h = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const timeLimit24h = new Date(
      Date.now() - 24 * 60 * 60 * 1000,
    ).toISOString();

    console.log(
      `Buscando carritos abandonados actualizados entre ${timeLimit24h} y ${timeLimit2h}...`,
    );

    // Obtener carritos elegibles
    const { data: abandonedCarts, error: fetchCartsError } =
      await insforge.database
        .from("carts")
        .select("*")
        .eq("recovery_email_sent", false)
        .not("customer_email", "is", null)
        .lt("updated_at", timeLimit2h)
        .gt("updated_at", timeLimit24h);

    if (fetchCartsError) {
      console.error(
        "Error al buscar carritos abandonados en PostgreSQL:",
        fetchCartsError,
      );
      return new Response(JSON.stringify({ error: fetchCartsError.message }), {
        status: 500,
      });
    }

    if (!abandonedCarts || abandonedCarts.length === 0) {
      console.log("No se encontraron carritos abandonados para procesar.");
      return new Response(
        JSON.stringify({ message: "No abandoned carts found.", count: 0 }),
        { status: 200 },
      );
    }

    console.log(
      `Se encontraron ${abandonedCarts.length} carrito(s) abandonado(s). Cargando catálogo de productos...`,
    );

    // Cargar productos para poder mostrar fotos, nombres y precios reales
    const { data: products, error: fetchProductsError } =
      await insforge.database.from("products").select("*");

    if (fetchProductsError) {
      console.error(
        "Error al cargar productos para la correspondencia del carrito:",
        fetchProductsError,
      );
      return new Response(
        JSON.stringify({ error: fetchProductsError.message }),
        { status: 500 },
      );
    }

    const productsMap = new Map();
    if (products) {
      products.forEach((p) => {
        productsMap.set(String(p.id), p);
      });
    }

    let emailsSentCount = 0;

    for (const cart of abandonedCarts) {
      const { id: cartId, customer_email, items } = cart;

      // Filtrar correos de prueba e invitados por defecto
      if (
        !customer_email ||
        customer_email.includes("cliente@isaferboutique.com")
      ) {
        console.log(`Carrito #${cartId} omitido: Invitado sin correo real.`);
        await insforge.database
          .from("carts")
          .update({ recovery_email_sent: true })
          .eq("id", cartId);
        continue;
      }

      const parsedItems =
        typeof items === "string" ? JSON.parse(items) : items || [];
      if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
        console.log(`Carrito #${cartId} omitido: No contiene items válidos.`);
        await insforge.database
          .from("carts")
          .update({ recovery_email_sent: true })
          .eq("id", cartId);
        continue;
      }

      console.log(
        `Procesando recuperación para carrito #${cartId} de ${customer_email}...`,
      );

      let totalCartAmount = 0;
      let itemsHtml = "";

      for (const item of parsedItems) {
        const productInfo = productsMap.get(String(item.id));
        if (productInfo) {
          const itemPrice = Number(productInfo.price) || 0;
          const itemQty = Number(item.quantity) || 1;
          const subtotalItem = itemPrice * itemQty;
          totalCartAmount += subtotalItem;

          // Obtener foto principal o imagen por defecto
          const imgUrl =
            productInfo.images && productInfo.images.length > 0
              ? productInfo.images[0]
              : "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80";

          // Formatear url a webp si es de Unsplash
          let optimizedImgUrl = imgUrl;
          if (imgUrl.includes("images.unsplash.com")) {
            optimizedImgUrl = imgUrl.includes("?")
              ? `${imgUrl}&fm=webp&w=150`
              : `${imgUrl}?fm=webp&w=150`;
          }

          itemsHtml += `
            <div style="display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid #fce7f3;">
              <img src="${optimizedImgUrl}" alt="${productInfo.name}" style="width: 60px; height: 80px; object-cover: cover; border-radius: 8px; border: 1px solid #ffe4ec; margin-right: 16px;" />
              <div style="flex: 1;">
                <h4 style="margin: 0; color: #1e1b4b; font-size: 14px; font-weight: bold;">${productInfo.name}</h4>
                <p style="margin: 4px 0 0; color: #6b7280; font-size: 12px;">Cant: ${itemQty} · Talla: ${productInfo.sizes && productInfo.sizes.length > 0 ? productInfo.sizes[0] : "Única"}</p>
              </div>
              <div style="text-align: right; font-weight: bold; color: #ff007f; font-size: 14px;">
                $${subtotalItem.toFixed(2)} USD
              </div>
            </div>
          `;
        }
      }

      // Si ningún producto del carrito coincidió con el catálogo, omitir
      if (totalCartAmount === 0 || !itemsHtml) {
        console.log(
          `Carrito #${cartId} omitido: Ningún producto válido en catálogo.`,
        );
        await insforge.database
          .from("carts")
          .update({ recovery_email_sent: true })
          .eq("id", cartId);
        continue;
      }

      // Nombre del remitente basado en el email
      const customerDisplayName = customer_email.split("@")[0];
      const recoverUrl = `https://isafer.mynextbymusa.workers.dev/?recover_cart=${cartId}`;

      const emailHtml = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ffe4ec; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(255,0,127,0.05); background-color: #fffcfd;">
          <div style="background-color: #ffffff; padding: 32px 24px; text-align: center; border-bottom: 1px solid #fce7f3;">
            <h1 style="color: #ff007f; margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 4px; text-transform: uppercase;">Isafer Boutique</h1>
            <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #9d9da6; margin-top: 6px; display: block;">Brooklyn, New York</span>
          </div>
          <div style="padding: 32px; color: #2d2d30; line-height: 1.6;">
            <h2 style="color: #1e1b4b; margin-top: 0; font-size: 20px; font-weight: 800;">¿Te quedaste con las ganas, ${customerDisplayName}? 💖</h2>
            <p>Hemos guardado los artículos que dejaste en tu bolsa de compras para que no pierdas tu outfit favorito. Recuerda que el stock en boutique es limitado.</p>
            
            <div style="background-color: #ffffff; border: 1px solid #fbcfe8; border-radius: 16px; padding: 20px; margin: 24px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.01);">
              <h3 style="margin-top: 0; color: #db2777; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 1px solid #fbcfe8; padding-bottom: 8px;">Tu Bolsa Guardada</h3>
              
              ${itemsHtml}
              
              <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 16px; font-weight: bold; font-size: 16px;">
                <span style="color: #1e1b4b;">Total Estimado:</span>
                <span style="color: #ff007f; font-size: 18px;">$${totalCartAmount.toFixed(2)} USD</span>
              </div>
            </div>
            
            <p style="text-align: center; color: #6b7280; font-size: 13px; margin: 24px 0 32px;">
              Pulsa el botón de abajo y recuperaremos automáticamente tu bolsa en la web para que puedas completar tu checkout por tarjeta o WhatsApp en un clic.
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${recoverUrl}" 
                 style="background-color: #ff007f; color: #ffffff; padding: 16px 36px; border-radius: 9999px; text-decoration: none; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; display: inline-block; box-shadow: 0 10px 20px rgba(255,0,127,0.25); transition: all 0.3s;">
                 Recuperar Mi Bolsa 🛍️
              </a>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #fce7f3; margin: 32px 0;" />
            <p style="font-size: 11px; color: #9c9c9f; text-align: center; margin: 0; line-height: 1.4;">
              Si ya completaste tu compra o no reconoces este carrito, por favor ignora este correo automático de cortesía.<br />
              Isafer Boutique · 2026 Brooklyn, NY.
            </p>
          </div>
        </div>
      `;

      // Enviar email por InsForge
      const emailRes = await insforge.emails.send({
        to: customer_email,
        subject:
          "💖 ¿Se te olvidó algo? Tu bolsa de compras te espera · Isafer Boutique",
        html: emailHtml,
        from: "Isafer Boutique",
      });

      if (emailRes.error) {
        console.error(
          `Error al enviar email de recuperación para carrito #${cartId}:`,
          emailRes.error,
        );
      } else {
        console.log(
          `✓ Email de recuperación de carrito enviado con éxito a ${customer_email}.`,
        );
        emailsSentCount++;
      }

      // Marcar recovery_email_sent = true en la base de datos
      await insforge.database
        .from("carts")
        .update({ recovery_email_sent: true })
        .eq("id", cartId);
    }

    console.log(
      `Recuperación de carritos finalizada con éxito. Emails enviados: ${emailsSentCount}`,
    );
    return new Response(
      JSON.stringify({
        success: true,
        message: "Abandoned carts processed.",
        sent: emailsSentCount,
      }),
      { headers: { "Content-Type": "application/json" }, status: 200 },
    );
  } catch (err: any) {
    console.error(
      "Excepción en la Edge Function de carritos abandonados:",
      err.message,
    );
    return new Response(err.message, { status: 500 });
  }
}
