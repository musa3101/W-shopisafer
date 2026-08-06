#!/bin/bash
set -e

# Colores para salida limpia
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Iniciando proceso de automatización y despliegue...${NC}"

# 1. Compilación del proyecto
echo -e "${YELLOW}📦 Compilando aplicación localmente...${NC}"
npm run build
echo -e "${GREEN}✓ Aplicación compilada correctamente.${NC}"

# 2. Despliegue a Cloudflare Workers
echo -e "${YELLOW}☁️ Desplegando en Cloudflare Workers...${NC}"
npx wrangler deploy
echo -e "${GREEN}✓ Despliegue en Cloudflare completado con éxito.${NC}"

# 3. Verificación de la URL pública
URL="https://isafer.mynextbymusa.workers.dev"
echo -e "${YELLOW}🧪 Verificando que la web responda en producción... (${URL})${NC}"
# Darle 3 segundos a Cloudflare para refrescar
sleep 3
RESPONSE_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL")

if [ "$RESPONSE_CODE" -eq 200 ]; then
  echo -e "${GREEN}✓ Verificación exitosa! La web pública responde con HTTP 200.${NC}"
else
  echo -e "${RED}❌ ERROR: La web pública devolvió HTTP $RESPONSE_CODE. Verifica el estado en Cloudflare.${NC}"
  exit 1
fi

# 4. Sincronización con GitHub
echo -e "${YELLOW}🐙 Sincronizando con GitHub...${NC}"
git add .
COMMIT_MSG="chore: cierre de sesion automatico y despliegue a cloudflare"
if [ ! -z "$1" ]; then
  COMMIT_MSG="$1"
fi
git commit -m "$COMMIT_MSG" || echo -e "${YELLOW}No hay cambios locales nuevos para hacer commit.${NC}"
git push origin dev
echo -e "${GREEN}✓ Cambios subidos a GitHub en la rama dev.${NC}"

# 5. Limpieza de carpeta de referencia
REF_DIR="/Users/musa/Downloads/sopisafer/carpeta de referencia"
echo -e "${YELLOW}🧹 Limpiando carpeta de referencia...${NC}"
if [ -d "$REF_DIR" ]; then
  # Eliminar todos los archivos y carpetas internas
  find "$REF_DIR" -mindepth 1 -delete
  echo -e "${GREEN}✓ Carpeta de referencia limpia.${NC}"
else
  echo -e "${YELLOW}La carpeta de referencia no existe, omitiendo.${NC}"
fi

echo -e "${GREEN}🎉 ¡Proceso de cierre de sesión completado con éxito al 100%!${NC}"
