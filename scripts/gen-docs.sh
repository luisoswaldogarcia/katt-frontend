#!/usr/bin/env bash
set -euo pipefail

# Regenera la documentación en ~/second-brain/ usando opencode en modo headless
# Requiere: opencode CLI

cd "$(dirname "$0")/.."

echo "Regenerando documentación en ~/second-brain/..."
opencode -p "$(cat <<'EOF'
Explora el código fuente de este proyecto y actualiza los archivos en ~/second-brain/
con la estructura actual. Sigue el formato existente de cada archivo: heading, 
links de navegación, dependencias, descripción, rutas y archivos clave.
Mantén los mismos nombres de archivo y respeta el estilo de los que ya existen.
EOF
)"
echo "Listo."
