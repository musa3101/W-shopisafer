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

export interface OrderInput {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address?: string;
  total_amount: number;
  items: Array<{
    product_id?: string;
    name: string;
    price: number;
    quantity: number;
  }>;
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
