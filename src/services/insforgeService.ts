import { insforge } from '@/lib/insforge';

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
export async function fetchProducts(): Promise<BackendProduct[]> {
  try {
    const { data, error } = await insforge.database
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error al cargar productos de InsForge:', error);
      return [];
    }

    return (data as BackendProduct[]) || [];
  } catch (err) {
    console.error('Error de red/conexión con InsForge Backend:', err);
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
 * Crea un nuevo producto en la tienda
 */
export async function createProduct(product: Partial<BackendProduct>) {
  try {
    const slug = product.slug || (product.name ? product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `prod-${Date.now()}`);
    const { data, error } = await insforge.database
      .from('products')
      .insert([
        {
          name: product.name || 'Nuevo Producto',
          slug,
          description: product.description || '',
          price: Number(product.price) || 0,
          stock: Number(product.stock) || 0,
          images: product.images && product.images.length > 0 ? product.images : ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80'],
          is_featured: product.is_featured ?? false,
          badge: product.badge || '',
          stripe_price_id: product.stripe_price_id || '',
        },
      ]);

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error('Error al crear producto:', err);
    return { success: false, error: err.message || 'Error al crear producto' };
  }
}

/**
 * Elimina un producto por su ID
 */
export async function deleteProduct(id: string) {
  try {
    const { data, error } = await insforge.database
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error('Error al eliminar producto:', err);
    return { success: false, error: err.message || 'Error al eliminar producto' };
  }
}

/**
 * Registra un nuevo pedido en la base de datos de InsForge
 */
export async function createOrder(order: OrderInput) {
  try {
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
            <a href="https://wa.me/19296772514?text=Hola%20Isafer%20Boutique%2C%20acabo%20de%20realizar%20un%20pedido%20por%20la%20web%20para%20la%20orden%20%23${orderData.orderId.slice(0,8)}" 
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

