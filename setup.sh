#!/bin/bash

# ==========================================
# MYNEXT - AUTOMATIZACIÓN DE ENTORNO LOCAL
# ==========================================
echo "🚀 Iniciando el entorno de desarrollo Pro de MYNEXT..."

# 1. Cambiar a rama de desarrollo para evitar despliegues accidentales en Cloudflare
echo "🌿 Cambiando a la rama de desarrollo (dev)..."
git checkout dev 2>/dev/null || git checkout -b dev

# 2. Instalar dependencias por si acaso
echo "📦 Instalando dependencias..."
npm install

# 3. Configurar Keep-Alive para Supabase / Backend (si aplica)
if [ -f .env ]; then
  echo "🔍 Detectado archivo .env, verificando automatizaciones Keep-Alive..."
  SB_URL=$(grep "VITE_SUPABASE_URL" .env | cut -d'=' -f2- | tr -d '\r' | tr -d '"' | tr -d "'" | xargs)
  SB_KEY=$(grep "VITE_SUPABASE_ANON_KEY" .env | cut -d'=' -f2- | tr -d '\r' | tr -d '"' | tr -d "'" | xargs)
  
  if [ -n "$SB_URL" ] && [ -n "$SB_KEY" ]; then
    mkdir -p .github/workflows
    
    cat <<EOF > .github/workflows/keep-alive.yml
name: Keep Supabase Alive

on:
  schedule:
    - cron: '0 0 * * 2,5'
  workflow_dispatch:

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Supabase Health Endpoint
        run: |
          URL="\${{ secrets.SUPABASE_URL }}"
          KEY="\${{ secrets.SUPABASE_ANON_KEY }}"
          if [ -z "\$URL" ]; then
            URL="$SB_URL"
          fi
          if [ -z "\$KEY" ]; then
            KEY="$SB_KEY"
          fi
          echo "Pinging Supabase at \$URL..."
          curl --fail -s -X GET "\$URL/auth/v1/health" \\
            -H "apikey: \$KEY" > /dev/null
          echo "Ping successful!"
EOF
    echo "✅ Archivo .github/workflows/keep-alive.yml verificado."

    cat <<EOF > .gitlab-ci.yml
keep_alive:
  stage: deploy
  rules:
    - if: \$CI_PIPELINE_SOURCE == "schedule"
  image: alpine:latest
  script:
    - apk add --no-cache curl
    - |
      URL="\${SUPABASE_URL}"
      KEY="\${SUPABASE_ANON_KEY}"
      if [ -z "\$URL" ]; then
        URL="$SB_URL"
      fi
      if [ -z "\$KEY" ]; then
        KEY="$SB_KEY"
      fi
      echo "Pinging Supabase at \$URL..."
      curl --fail -s -X GET "\$URL/auth/v1/health" \\
        -H "apikey: \$KEY" > /dev/null
      echo "Ping successful!"
EOF
    echo "✅ Archivo .gitlab-ci.yml verificado."
  fi
fi

# 4. Levantamiento de entorno local
echo "🔥 Levantando localhost..."
npm run dev
