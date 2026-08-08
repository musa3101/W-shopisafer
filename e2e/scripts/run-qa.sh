#!/usr/bin/env bash

# Script de QA Completo Automatizado — Isafer Boutique / Proyectos Web
# Ejecuta la suite E2E completa en todos los navegadores configurados
# y genera un informe en HTML.

set -e

echo "🚀 Iniciando Auditoría de QA Completo con Playwright E2E..."
echo "---------------------------------------------------------"

# Ir al directorio raíz del proyecto
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_ROOT"

# Asegurarse de que las dependencias están listas
if [ ! -d "node_modules/@playwright/test" ]; then
    echo "📦 Instalando @playwright/test..."
    npm install --save-dev @playwright/test
fi

# Ejecutar la suite de pruebas E2E con Playwright usando la config en e2e/playwright.config.ts
echo "🧪 Ejecutando pruebas E2E..."
npx playwright test --config=e2e/playwright.config.ts "$@"

echo "---------------------------------------------------------"
echo "✅ QA Completo finalizado con éxito!"
echo "📊 Para ver el reporte HTML completo ejecuta: npm run test:e2e:report"
