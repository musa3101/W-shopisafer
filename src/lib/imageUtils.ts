/**
 * Utilidades para procesamiento y optimización de imágenes en el cliente.
 */

/**
 * Convierte un archivo de imagen (PNG, JPG, HEIC, etc.) a formato WebP optimizado
 * y redimensiona su ancho si excede un límite máximo para acelerar la carga en móvil.
 * 
 * @param file Archivo de imagen original seleccionado por el usuario.
 * @param quality Calidad de compresión WebP (0 a 1). Por defecto 0.8.
 * @param maxWidth Ancho máximo permitido para la imagen. Por defecto 1200px.
 * @returns Promesa que resuelve con el archivo File en formato image/webp.
 */
export async function convertToWebP(
  file: File,
  quality: number = 0.8,
  maxWidth: number = 1200
): Promise<File> {
  // Si el navegador no soporta Canvas o FileReader de forma básica, retornar el original
  if (typeof window === 'undefined' || !window.HTMLCanvasElement || !window.FileReader) {
    console.warn("Entorno no soporta Canvas/FileReader, subiendo imagen original.");
    return file;
  }

  // Si ya es un archivo WebP pequeño, no hace falta procesarlo de nuevo si no excede maxWidth
  if (file.type === "image/webp" && file.size < 200 * 1024) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Redimensionar proporcionalmente si excede el ancho máximo
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("No se pudo obtener el contexto 2D del Canvas."));
          return;
        }

        // Dibujar la imagen en el canvas con las nuevas dimensiones
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir el canvas a Blob en formato WebP con compresión
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Reemplazar la extensión del nombre por .webp
              const originalName = file.name;
              const lastDotIndex = originalName.lastIndexOf(".");
              const baseName = lastDotIndex !== -1 ? originalName.substring(0, lastDotIndex) : originalName;
              const webpName = `${baseName}.webp`;

              const webpFile = new File([blob], webpName, {
                type: "image/webp",
                lastModified: Date.now(),
              });
              
              console.log(
                `Imagen optimizada a WebP: ${file.name} (${(file.size / 1024).toFixed(1)} KB) -> ` +
                `${webpFile.name} (${(webpFile.size / 1024).toFixed(1)} KB) | Ahorro: ` +
                `${(((file.size - webpFile.size) / file.size) * 100).toFixed(0)}%`
              );
              
              resolve(webpFile);
            } else {
              reject(new Error("Error al exportar el canvas a blob WebP."));
            }
          },
          "image/webp",
          quality
        );
      };
      
      img.onerror = (err) => {
        reject(new Error("Error al cargar el objeto Image del navegador."));
      };
    };
    
    reader.onerror = (err) => {
      reject(new Error("Error al leer el archivo de imagen mediante FileReader."));
    };
  });
}
