#!/bin/bash

# ============================================
# 🚀 DEPLOY MEDICONTROL A VERCEL
# ============================================
# Ejecuta este script desde tu computadora
# 
# PASOS PREVIOS:
# 1. Crea cuenta en vercel.com (gratis)
# 2. Ten listo tu email y contraseña
# ============================================

echo "🚀 Iniciando deploy de MediControl..."
echo ""

# Navegar al directorio del proyecto
cd /home/z/my-project

# Verificar que el proyecto está listo
echo "📦 Verificando proyecto..."
bun run lint

if [ $? -ne 0 ]; then
    echo "❌ Hay errores de lint. Corrige antes de deploy."
    exit 1
fi

echo "✅ Proyecto listo para deploy"
echo ""

# Deploy a Vercel
echo "🌐 Conectando con Vercel..."
echo "   Se abrirá tu navegador para login"
echo ""

bunx vercel --prod

echo ""
echo "🎉 ¡Deploy completado!"
echo ""
echo "Tu app estará disponible en:"
echo "   https://medicontrol.vercel.app"
echo ""
echo "Para configurar variables de entorno:"
echo "   1. Ve a vercel.com/dashboard"
echo "   2. Selecciona tu proyecto"
echo "   3. Settings → Environment Variables"
echo ""
