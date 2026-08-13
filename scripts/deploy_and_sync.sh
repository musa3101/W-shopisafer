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
NODE_OPTIONS="--dns-result-order=ipv4first" npm run build
echo -e "${GREEN}✓ Aplicación compilada correctamente.${NC}"

# 2. Despliegue a Cloudflare Pages (isaferboutique)
echo -e "${YELLOW}⚡ Desplegando en Cloudflare Pages (isaferboutique.pages.dev)...${NC}"
npx wrangler pages deploy dist/client --project-name=isaferboutique
echo -e "${GREEN}✓ Despliegue en Cloudflare Pages completado con éxito.${NC}"

# 3. Verificación de la URL pública
URL_PAGES="https://isaferboutique.pages.dev"
echo -e "${YELLOW}🧪 Verificando que la web responda en producción... (${URL_PAGES})${NC}"
sleep 3
RESPONSE_PAGES=$(curl -s -o /dev/null -w "%{http_code}" "$URL_PAGES")

if [ "$RESPONSE_PAGES" -eq 200 ]; then
  echo -e "${GREEN}✓ Verificación exitosa! Cloudflare Pages (${URL_PAGES}) responde con HTTP 200.${NC}"
else
  echo -e "${RED}❌ ERROR: Cloudflare Pages devolvió HTTP $RESPONSE_PAGES. Verifica el estado en Cloudflare.${NC}"
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

# 5. Limpieza de carpetas de referencia
echo -e "${YELLOW}🧹 Limpiando carpetas de referencia...${NC}"
for REF_DIR in "/Users/musa/Downloads/sopisafer/carpeta de referencia" "/Users/musa/Downloads/PROJ recientes/sopisafer/carpeta de referencia"; do
  if [ -d "$REF_DIR" ]; then
    find "$REF_DIR" -mindepth 1 -delete 2>/dev/null || true
    echo -e "${GREEN}✓ Carpeta de referencia ($REF_DIR) limpia.${NC}"
  fi
done

echo -e "${GREEN}🎉 ¡Proceso de cierre de sesión completado con éxito al 100%!${NC}"
