# 🚀 Guía de Deployment - MediControl

## Opción 1: Vercel (Recomendado - GRATIS)

### Paso 1: Crear cuenta en Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Clic en "Sign Up"
3. Elige "Continue with GitHub" (más fácil)

### Paso 2: Subir código a GitHub
1. Ve a [github.com](https://github.com) y crea cuenta si no tienes
2. Crea un nuevo repositorio llamado `medicontrol`
3. Sube el código:

```bash
# En tu computadora local
cd medicontrol
git init
git add .
git commit -m "Initial commit - MediControl"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/medicontrol.git
git push -u origin main
```

### Paso 3: Conectar con Vercel
1. En Vercel, clic en "New Project"
2. Importa tu repositorio `medicontrol`
3. Clic en "Deploy"
4. ¡Listo! Tu app estará en `medicontrol.vercel.app`

---

## Opción 2: Deploy Directo (Sin GitHub)

Si tienes Vercel CLI instalado:

```bash
cd /home/z/my-project
vercel
```

Sigue las instrucciones:
1. Login con tu cuenta
2. Confirma el nombre del proyecto
3. ¡Deploy automático!

---

## 📝 Configuración Post-Deploy

### 1. Configurar Variables de Entorno

En Vercel Dashboard → Settings → Environment Variables:

```
# Mínimo para empezar:
NEXT_PUBLIC_APP_URL=https://tu-app.vercel.app
```

### 2. Configurar Dominio Personalizado (Opcional)

Si tienes un dominio:
1. Vercel Dashboard → Settings → Domains
2. Agrega tu dominio (ej: `medicontrol.app`)
3. Actualiza los DNS según las instrucciones

---

## 🗄️ Configurar Supabase (Base de Datos GRATIS)

### Paso 1: Crear Proyecto
1. Ve a [supabase.com](https://supabase.com)
2. Clic en "New Project"
3. Nombre: `medicontrol`
4. Genera una contraseña segura
5. Selecciona región cercana
6. Clic en "Create new project"

### Paso 2: Crear Tablas
1. Ve a "SQL Editor" en Supabase
2. Copia el contenido de `/supabase/schema.sql`
3. Ejecuta el script

### Paso 3: Obtener Credenciales
1. Ve a Settings → API
2. Copia:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

### Paso 4: Agregar a Vercel
En Vercel Dashboard → Settings → Environment Variables, agrega las 3 variables.

---

## 🔔 Configurar Firebase (Push Notifications GRATIS)

### Paso 1: Crear Proyecto
1. Ve a [firebase.google.com](https://firebase.google.com)
2. Clic en "Crear proyecto"
3. Nombre: `medicontrol`
4. Desactiva Google Analytics (opcional)
5. Clic en "Crear proyecto"

### Paso 2: Agregar Web App
1. Clic en el ícono web (</>)
2. Nombre: `MediControl Web`
3. Copia el objeto `firebaseConfig`

### Paso 3: Habilitar FCM
1. Ve a Project Settings → Cloud Messaging
2. Genera una clave VAPID

### Paso 4: Agregar a Vercel
```
NEXT_PUBLIC_FIREBASE_API_KEY=tu-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=tu-app-id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=tu-vapid-key
```

---

## 💳 Configurar Stripe (Pagos)

### Paso 1: Crear Cuenta
1. Ve a [stripe.com](https://stripe.com)
2. Crea cuenta (gratis)
3. Activa el modo "Test" para desarrollo

### Paso 2: Obtener API Keys
1. Dashboard → Developers → API Keys
2. Copia:
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`

### Paso 3: Configurar Webhook
1. Dashboard → Developers → Webhooks
2. Agregar endpoint: `https://tu-app.vercel.app/api/webhooks/stripe`
3. Copia el signing secret → `STRIPE_WEBHOOK_SECRET`

---

## 📱 Configurar Twilio (SMS - Pago)

**⚠️ Solo configura esto cuando tengas usuarios pagando**

### Paso 1: Crear Cuenta
1. Ve a [twilio.com](https://twilio.com)
2. Crea cuenta (dan $15 de prueba gratis)
3. Compra un número de teléfono ($1/mes)

### Paso 2: Obtener Credenciales
1. Dashboard → Copia:
   - Account SID → `TWILIO_ACCOUNT_SID`
   - Auth Token → `TWILIO_AUTH_TOKEN`
   - Tu número → `TWILIO_PHONE_NUMBER`

---

## ✅ Checklist de Deployment

- [ ] Cuenta en Vercel creada
- [ ] Código subido a GitHub
- [ ] Proyecto conectado en Vercel
- [ ] Deploy exitoso
- [ ] App accesible en `tu-app.vercel.app`
- [ ] Supabase configurado (opcional, para persistencia)
- [ ] Firebase configurado (opcional, para push notifications)
- [ ] Stripe configurado (opcional, para pagos)
- [ ] Twilio configurado (opcional, solo con ingresos)

---

## 🆘 Problemas Comunes

### Error: "Build Failed"
- Revisa los logs en Vercel Dashboard
- Verifica que `bun run lint` no tenga errores
- Revisa que todas las imports sean correctas

### Error: "Environment Variable Not Found"
- Agrega la variable en Vercel Dashboard → Settings → Environment Variables
- Haz redeploy después de agregar

### La app no actualiza
- Vercel actualiza automáticamente con cada push a GitHub
- Si no, haz un redeploy manual desde el dashboard

---

## 📊 Monitoreo

### Vercel Analytics (Gratis)
1. Vercel Dashboard → Analytics
2. Activa "Web Analytics"
3. Ve visitas en tiempo real

### Logs
1. Vercel Dashboard → Deployments
2. Clic en un deployment
3. Ve "Function Logs" para errores

---

*Guía actualizada: Enero 2025*
