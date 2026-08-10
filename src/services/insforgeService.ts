import { insforge } from '@/lib/insforge';
import { OWNER_PHONE } from '@/lib/constants';

export interface CartItemInput {
  id: string | number;
  quantity: number;
  size?: string;
}

export interface BackendCart {
  id: string;
  customer_email?: string;
  items: CartItemInput[] | string;
  recovery_email_sent: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BackendProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  category_id?: string;
  images: string[];
  is_featured: boolean;
  badge?: string;
  stripe_price_id?: string;
  gender?: 'women' | 'men' | 'unisex' | string;
  sizes?: string[];
  size_system?: 'US' | 'EU' | string;
}

export interface BackendCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface OrderItem {
  product_id?: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
}

export interface BackendOrder {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address?: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[] | string;
  stripe_session_id?: string;
  created_at?: string;
}

export interface OrderInput {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address?: string;
  total_amount: number;
  items: OrderItem[];
  stripe_session_id?: string;
}

/**
 * Obtiene el catálogo de productos desde la base de datos PostgreSQL en InsForge
 */
/**
 * Obtiene el catálogo de productos desde la base de datos PostgreSQL en InsForge y almacenamiento local
 */
export async function fetchProducts(): Promise<BackendProduct[]> {
  try {
    const { data, error } = await insforge.database
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al cargar productos de InsForge:', error);
      return [];
    }

    return (data as BackendProduct[]) || [];
  } catch (err) {
    console.error('Error de conexión al cargar productos:', err);
    return [];
  }
}

/**
 * Obtiene las categorías activas en InsForge
 */
export async function fetchCategories(): Promise<BackendCategory[]> {
  try {
    const { data, error } = await insforge.database
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.warn('Error al cargar categorías de InsForge:', error);
      return [];
    }

    return (data as BackendCategory[]) || [];
  } catch (err) {
    console.error('Error conectando a categorías en InsForge:', err);
    return [];
  }
}

/**
 * Actualiza el precio y el stock de un producto (para el Panel de la Dueña)
 */
export async function updateProductPriceAndStock(id: string, price: number, stock: number, stripe_price_id?: string) {
  try {
    const { data, error } = await insforge.database
      .from('products')
      .update({ price, stock, stripe_price_id })
      .eq('id', id);

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error('Error al actualizar producto:', err);
    return { success: false, error: err.message || 'Error al actualizar producto' };
  }
}

/**
 * Sube una imagen de producto a InsForge Storage o genera un Data URL de respaldo
 */
export async function uploadProductImage(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `product-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    
    // Intento 1: InsForge Storage
    if (insforge.storage) {
      try {
        const { data, error } = await insforge.storage
          .from('products')
          .upload(fileName, file);

        if (!error && data?.url) {
          return { success: true, url: data.url };
        }
      } catch (storageErr) {
        console.warn('InsForge Storage upload not available, falling back to base64 reader:', storageErr);
      }
    }

    // Intento 2: FileReader Data URL (Base64 ultra-confiable)
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve({ success: true, url: reader.result });
        } else {
          resolve({ success: false, error: 'Error al procesar la imagen seleccionada.' });
        }
      };
      reader.onerror = () => resolve({ success: false, error: 'Error al leer el archivo de imagen.' });
      reader.readAsDataURL(file);
    });
  } catch (err: any) {
    return { success: false, error: err.message || 'Error en la subida de imagen' };
  }
}

/**
 * Crea un nuevo producto en la tienda (con reintento automático y respaldo local)
 */
export async function createProduct(product: Partial<BackendProduct>) {
  try {
    const slug = product.slug || (product.name ? product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `prod-${Date.now()}`);
    const id = product.id || `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    
    const fullPayload: any = {
      id,
      name: product.name || 'Nuevo Producto',
      slug,
      description: product.description || '',
      price: Number(product.price) || 0,
      stock: Number(product.stock) || 0,
      images: product.images && product.images.length > 0 ? product.images : ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80'],
      is_featured: product.is_featured ?? true,
      badge: product.badge || 'NUEVO DROP',
      stripe_price_id: product.stripe_price_id || '',
    };

    if (product.gender) fullPayload.gender = product.gender;
    if (product.sizes) fullPayload.sizes = product.sizes;
    if (product.size_system) fullPayload.size_system = product.size_system;

    // Intento 1: Insertar con todos los campos en InsForge PostgreSQL
    const { data, error } = await insforge.database
      .from('products')
      .insert([fullPayload]);

    if (!error) {
      return { success: true, data };
    }

    // Intento 2: Probar sin campos opcionales por si la columna no existe aún en PostgreSQL
    const standardPayload = { ...fullPayload };
    delete standardPayload.gender;
    delete standardPayload.sizes;
    delete standardPayload.size_system;

    const retryRes = await insforge.database
      .from('products')
      .insert([standardPayload]);

    if (retryRes.error) {
      console.error('Error al insertar producto en PostgreSQL:', retryRes.error.message);
      return { success: false, error: retryRes.error.message || 'Error al guardar el producto en la base de datos' };
    }

    return { success: true, data: retryRes.data };
  } catch (err: any) {
    console.error('Error al crear producto:', err);
    return { success: false, error: err.message || 'Error al crear la prenda' };
  }
}

/**
 * Elimina un producto por su ID
 */
export async function deleteProduct(id: string) {
  try {
    const { error } = await insforge.database
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar producto de PostgreSQL:', error);
      return { success: false, error: error.message || 'Error al eliminar el producto' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error al eliminar producto:', err);
    return { success: false, error: err.message || 'Error de conexión al eliminar' };
  }
}

/**
 * Registra un nuevo pedido en la base de datos de InsForge
 */
export async function createOrder(order: OrderInput) {
  try {
    if (order.total_amount < 0) {
      return { success: false, error: 'El monto total del pedido no puede ser negativo.' };
    }
    const hasInvalidItems = Array.isArray(order.items) && order.items.some(i => (i.quantity ?? 1) <= 0 || (i.price ?? 0) < 0);
    if (hasInvalidItems) {
      return { success: false, error: 'Los artículos del pedido contienen cantidades o precios inválidos.' };
    }
    const orderId = crypto.randomUUID();
    const { error } = await insforge.database
      .from('orders')
      .insert([
        {
          id: orderId,
          customer_name: order.customer_name,
          customer_email: order.customer_email,
          customer_phone: order.customer_phone || '',
          shipping_address: order.shipping_address || '',
          total_amount: order.total_amount,
          items: JSON.stringify(order.items),
          status: 'pending',
          stripe_session_id: order.stripe_session_id || '',
        },
      ]);

    if (error) {
      console.error('Error al guardar pedido en InsForge:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: { id: orderId } };
  } catch (err: any) {
    console.error('Excepción al crear pedido en InsForge:', err);
    return { success: false, error: err.message || 'Error de conexión' };
  }
}

/**
 * Actualiza el stripe_session_id de una orden
 */
export async function updateOrderStripeSession(id: string, stripe_session_id: string) {
  try {
    const { data, error } = await insforge.database
      .from('orders')
      .update({ stripe_session_id })
      .eq('id', id);

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error('Error al actualizar stripe_session_id de la orden:', err);
    return { success: false, error: err.message || 'Error al actualizar stripe_session_id' };
  }
}

/**
 * Obtiene todos los pedidos (para el Panel de Administración de la Dueña)
 */
export async function fetchAllOrders(): Promise<BackendOrder[]> {
  try {
    const { data, error } = await insforge.database
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error al cargar pedidos:', error);
      return [];
    }

    return (data || []).map((order) => ({
      ...order,
      items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items || [],
    }));
  } catch (err) {
    console.error('Error de conexión al cargar pedidos:', err);
    return [];
  }
}

/**
 * Obtiene los pedidos del cliente por su email
 */
export async function fetchCustomerOrders(email: string): Promise<BackendOrder[]> {
  try {
    const { data, error } = await insforge.database
      .from('orders')
      .select('*')
      .eq('customer_email', email)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error al cargar pedidos del cliente:', error);
      return [];
    }

    return (data || []).map((order) => ({
      ...order,
      items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items || [],
    }));
  } catch (err) {
    console.error('Error de conexión al cargar pedidos del cliente:', err);
    return [];
  }
}

/**
 * Actualiza el estado de un pedido (pendientes, en proceso, enviado, entregado)
 */
export async function updateOrderStatus(id: string, status: BackendOrder['status']) {
  try {
    const { data, error } = await insforge.database
      .from('orders')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error('Error al actualizar estado del pedido:', err);
    return { success: false, error: err.message || 'Error al actualizar pedido' };
  }
}

/**
 * Envía un correo de confirmación de pedido por WhatsApp
 */
export async function sendOrderConfirmationEmail(orderData: {
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  items: Array<{ name: string; price: number; quantity: number }>;
  orderId: string;
}) {
  if (!orderData.customerEmail || orderData.customerEmail.includes("cliente@isaferboutique.com")) {
    console.log("No se envía correo: es un invitado sin correo real.");
    return;
  }

  try {
    const itemsHtml = orderData.items
      .map(
        (item) =>
          `<li style="margin: 8px 0; font-size: 14px;"><strong>${item.name}</strong> x${item.quantity} - <span style="color: #e11d48;">$${(item.price * item.quantity).toFixed(2)} USD</span></li>`
      )
      .join("");

    const emailHtml = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ffe4ec; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); background-color: #fffafb;">
        <div style="background-color: #e11d48; padding: 24px; text-align: center; border-bottom: 2px solid #be123c;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase;">Isafer Boutique</h1>
        </div>
        <div style="padding: 32px; color: #333333; line-height: 1.6;">
          <h2 style="color: #e11d48; margin-top: 0; font-size: 20px;">¡Hola, ${orderData.customerName}! 💖</h2>
          <p>Hemos registrado tu pedido por WhatsApp y estamos pendientes de tu confirmación por chat para coordinar la entrega y el pago.</p>
          
          <div style="background-color: #ffffff; border: 1px solid #fecdd3; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <h3 style="margin-top: 0; color: #be123c; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Detalles de tu Pedido</h3>
            <p style="margin: 6px 0; font-size: 14px;"><strong>ID de Orden:</strong> <span style="font-family: monospace;">#${orderData.orderId.slice(0, 8)}</span></p>
            <ul style="padding-left: 20px; margin: 12px 0;">
              ${itemsHtml}
            </ul>
            <p style="margin: 6px 0; font-size: 14px; border-top: 1px solid #fecdd3; padding-top: 8px;"><strong>Total del Pedido:</strong> <span style="color: #e11d48; font-weight: bold;">$${orderData.totalAmount.toFixed(2)} USD</span></p>
            <p style="margin: 6px 0; font-size: 14px;"><strong>Método de Confirmación:</strong> <span style="background-color: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 9999px; font-size: 12px; font-weight: bold;">WhatsApp Pendiente</span></p>
          </div>
          
          <p>Por favor, si aún no nos has escrito, pulsa el botón de abajo para enviarnos tu comprobante de WhatsApp:</p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="https://wa.me/${OWNER_PHONE}?text=Hola%20Isafer%20Boutique%2C%20acabo%20de%20realizar%20un%20pedido%20por%20la%20web%20para%20la%20orden%20%23${orderData.orderId.slice(0,8)}" 
               style="background-color: #10b981; color: #ffffff; padding: 14px 28px; border-radius: 9999px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px rgba(16,185,129,0.2);">
               Escribir por WhatsApp
            </a>
          </div>
          
          <hr style="border: 0; border-top: 1px solid #fecdd3; margin: 32px 0;" />
          <p style="font-size: 12px; color: #888888; text-align: center; margin: 0;">
            Este es un correo automático de registro de pedido de Isafer Boutique · Brooklyn, NY.
          </p>
        </div>
      </div>
    `;

    const res = await insforge.emails.send({
      to: orderData.customerEmail,
      subject: "Registro de tu Pedido por WhatsApp · Isafer Boutique 💖",
      html: emailHtml,
      from: "Isafer Boutique",
    });

    if (res?.error) {
      console.error("Error del backend al enviar email:", res.error);
    } else {
      console.log(`Email de pedido por WhatsApp enviado con éxito a ${orderData.customerEmail}`);
    }
  } catch (err) {
    console.error("Error al enviar email de pedido por WhatsApp:", err);
  }
}

/**
 * Envía un correo electrónico de bienvenida con cupón promocional del 10% OFF
 */
export async function sendWelcomeCouponEmail(customerEmail: string, couponCode: string = "VIP10") {
  const cleanEmail = customerEmail.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) return;

  try {
    const emailHtml = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #fbcfe8; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(244,63,94,0.1); background-color: #ffffff;">
        <div style="background-color: #0c0c0e; padding: 32px; text-align: center; border-bottom: 3px solid #f43f5e;">
          <h1 style="color: #ffffff; margin: 0; font-size: 26px; letter-spacing: 3px; text-transform: uppercase;">ISAFÉR BOUTIQUE</h1>
          <p style="color: #f43f5e; margin: 6px 0 0 0; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; font-weight: bold;">Brooklyn, New York</p>
        </div>
        <div style="padding: 36px 28px; color: #1f2937; line-height: 1.6; text-align: center;">
          <span style="background-color: #ffe4e6; color: #e11d48; padding: 6px 16px; border-radius: 9999px; font-size: 12px; font-weight: bold; text-transform: uppercase; tracking: 1px;">Bienvenida al Club VIP 💖</span>
          <h2 style="color: #0c0c0e; margin-top: 18px; font-size: 24px; font-weight: 800;">¡Tu Regalo de Bienvenida del 10% OFF!</h2>
          <p style="font-size: 14px; color: #4b5563; margin-bottom: 24px;">Gracias por unirte a la familia Isafer Boutique. Para celebrar tu llegada, aquí tienes tu código de descuento exclusivo del 10% OFF para tu primera compra:</p>
          
          <div style="background: linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%); border: 2px dashed #f43f5e; border-radius: 16px; padding: 24px; margin: 24px 0; display: inline-block; width: 80%;">
            <p style="margin: 0 0 6px 0; font-size: 12px; color: #9f1239; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">CÓDIGO DE CUPÓN DESCUENTO</p>
            <span style="font-family: monospace; font-size: 32px; font-weight: 900; color: #be123c; letter-spacing: 4px; display: block;">${couponCode}</span>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #be123c;">10% DE DESCUENTO EN TODA LA TIENDA</p>
          </div>
          
          <p style="font-size: 13px; color: #6b7280; margin: 20px 0;">Puedes aplicarlo directamente en la bolsa de compras de la web o decírselo a Camila por WhatsApp al hacer tu pedido.</p>
          
          <div style="text-align: center; margin: 28px 0;">
            <a href="https://shopisafer.com" 
               style="background: linear-gradient(90deg, #e11d48 0%, #be123c 100%); color: #ffffff; padding: 16px 36px; border-radius: 9999px; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; display: inline-block; box-shadow: 0 6px 16px rgba(225,29,72,0.3);">
               IR A LA TIENDA Y USAR MI CUPÓN 🛍️
            </a>
          </div>
          
          <hr style="border: 0; border-top: 1px solid #fecdd3; margin: 32px 0;" />
          <p style="font-size: 11px; color: #9ca3af; text-align: center; margin: 0;">
            Isafer Boutique · Brooklyn, New York, NY 11201.<br/>Si no deseas recibir más ofertas VIP, puedes cancelar en cualquier momento.
          </p>
        </div>
      </div>
    `;

    const res = await insforge.emails.send({
      to: cleanEmail,
      subject: "¡Tu Regalo VIP del 10% OFF en Isafer Boutique! 💖",
      html: emailHtml,
      from: "Isafer Boutique VIP",
    });

    if (res?.error) {
      console.warn("Aviso email de bienvenida (InsForge fallback):", res.error);
    } else {
      console.log(`Email de cupón de bienvenida del 10% enviado con éxito a ${cleanEmail}`);
    }
  } catch (err) {
    console.error("Error al enviar email de bienvenida:", err);
  }
}

/**
 * Obtiene un carrito de la base de datos de InsForge por su ID (UUID)
 */
export async function fetchCartById(id: string): Promise<BackendCart | null> {
  try {
    const { data, error } = await insforge.database
      .from('carts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.warn('Error al cargar el carrito de InsForge:', error.message);
      return null;
    }

    if (data) {
      return {
        ...data,
        items: typeof data.items === 'string' ? JSON.parse(data.items) : data.items || [],
      } as BackendCart;
    }
    return null;
  } catch (err) {
    console.error('Error de red al cargar el carrito:', err);
    return null;
  }
}

/**
 * Guarda o actualiza un carrito en la base de datos de InsForge
 */
export async function saveCart(cart: { id: string; customer_email?: string | null; items: CartItemInput[] }) {
  try {
    const { data, error } = await insforge.database
      .from('carts')
      .upsert([
        {
          id: cart.id,
          customer_email: cart.customer_email || null,
          items: cart.items,
          recovery_email_sent: false,
          updated_at: new Date().toISOString(),
        },
      ]);

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error('Error al guardar carrito en InsForge:', err);
    return { success: false, error: err.message || 'Error al guardar el carrito' };
  }
}

/**
 * Elimina un carrito de la base de datos de InsForge
 */
export async function deleteCart(id: string) {
  try {
    const { data, error } = await insforge.database
      .from('carts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error('Error al eliminar carrito en InsForge:', err);
    return { success: false, error: err.message || 'Error al eliminar el carrito' };
  }
}

/**
 * Registra una suscripción al Newsletter VIP en InsForge
 */
export async function subscribeToNewsletter(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return { success: false, error: 'Email inválido' };

  try {
    // Guardar en LocalStorage para recordar el estado de la suscripción
    localStorage.setItem('isafer_newsletter_subscribed', 'true');
    localStorage.setItem('isafer_subscribed_email', cleanEmail);

    // Intentar persistir en la base de datos PostgreSQL de InsForge
    const { data, error } = await insforge.database
      .from('newsletter_subscriptions')
      .upsert([
        {
          email: cleanEmail,
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.warn('Aviso InsForge Newsletter (fallback local activo):', error.message);
    }

    // Enviar automáticamente el correo de bienvenida con el cupón del 10% OFF
    sendWelcomeCouponEmail(cleanEmail, 'VIP10').catch((e) => console.error(e));

    return { success: true, email: cleanEmail };
  } catch (err: any) {
    console.error('Error al registrar suscripción newsletter:', err);
    sendWelcomeCouponEmail(cleanEmail, 'VIP10').catch((e) => console.error(e));
    return { success: true, email: cleanEmail };
  }
}

