import { insforge } from "@/lib/insforge";

/**
 * Obtiene los IDs de los productos favoritos de un usuario
 */
export async function fetchUserFavorites(userId: string): Promise<string[]> {
  try {
    const { data, error } = await insforge.database
      .from("favorites")
      .select("product_id")
      .eq("user_id", userId);

    if (error) {
      console.error("Error al obtener favoritos:", error);
      return [];
    }

    return (data || []).map((fav: any) => fav.product_id);
  } catch (err) {
    console.error("Excepción al obtener favoritos:", err);
    return [];
  }
}

/**
 * Agrega un producto a los favoritos de un usuario en PostgreSQL
 */
export async function addFavorite(
  userId: string,
  productId: string,
): Promise<boolean> {
  try {
    const { error } = await insforge.database.from("favorites").insert([
      {
        user_id: userId,
        product_id: productId,
      },
    ]);

    if (error) {
      // Ignorar error si ya existe por la restricción UNIQUE
      if (
        error.message?.includes("unique_violation") ||
        error.code === "23505"
      ) {
        return true;
      }
      console.error("Error al agregar favorito:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Excepción al agregar favorito:", err);
    return false;
  }
}

/**
 * Elimina un producto de los favoritos de un usuario en PostgreSQL
 */
export async function removeFavorite(
  userId: string,
  productId: string,
): Promise<boolean> {
  try {
    const { error } = await insforge.database
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", productId);

    if (error) {
      console.error("Error al eliminar favorito:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Excepción al eliminar favorito:", err);
    return false;
  }
}

/**
 * Sincroniza los favoritos del LocalStorage del invitado al iniciar sesión
 */
export async function syncGuestFavorites(
  userId: string,
  productIds: string[],
): Promise<boolean> {
  if (!productIds || productIds.length === 0) return true;

  try {
    const records = productIds.map((pid) => ({
      user_id: userId,
      product_id: pid,
    }));

    // En InsForge/PostgREST podemos hacer upsert para evitar fallos por registros duplicados
    const { error } = await insforge.database.from("favorites").insert(records);

    if (error) {
      console.error("Error al sincronizar favoritos de invitado:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Excepción al sincronizar favoritos:", err);
    return false;
  }
}
