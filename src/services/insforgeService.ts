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
  created_at?: string;
}

export interface OrderInput {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address?: string;
  total_amount: number;
  items: OrderItem[];
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
export async function updateProductPriceAndStock(id: string, price: number, stock: number) {
  try {
    const { data, error } = await insforge.database
      .from('products')
      .update({ price, stock })
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
    const { data, error } = await insforge.database
      .from('orders')
      .insert([
        {
          customer_name: order.customer_name,
          customer_email: order.customer_email,
          customer_phone: order.customer_phone || '',
          shipping_address: order.shipping_address || '',
          total_amount: order.total_amount,
          items: JSON.stringify(order.items),
          status: 'pending',
        },
      ]);

    if (error) {
      console.error('Error al guardar pedido en InsForge:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('Excepción al crear pedido en InsForge:', err);
    return { success: false, error: err.message || 'Error de conexión' };
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

    return (data as any[]).map((order) => ({
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

    return (data as any[]).map((order) => ({
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

