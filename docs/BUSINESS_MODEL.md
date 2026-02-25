# 💰 Modelo de Negocio - MediControl
## 100% GRATIS para el Desarrollador

---

## 📊 Resumen del Modelo

```
┌─────────────────────────────────────────────────────────────────┐
│                    MODELO SOSTENIBLE                             │
│         El usuario paga ANTES de usar servicios con costo       │
└─────────────────────────────────────────────────────────────────┘

USUARIO GRATIS:
├── ✅ Gestión de medicamentos (ilimitado)
├── ✅ Recordatorios locales
├── ✅ Notificaciones PUSH (GRATIS ilimitado) ← MÉTODO PRINCIPAL
├── ✅ Alertas de interacciones
├── ✅ 3 SMS de bienvenida
├── ❌ Publicidad no intrusiva
└── 📦 Packs SMS opcionales

USUARIO PREMIUM ($4.99/mes):
├── ✅ Todo lo anterior
├── ✅ 20 SMS/mes incluidos
├── ✅ 20% descuento en packs SMS
├── ✅ Sin publicidad
├── ✅ Backup en la nube
├── ✅ Hasta 5 cuidadores
└── ✅ Soporte prioritario
```

---

## 💸 Costos para el Desarrollador

### Servicios GRATIS:
| Servicio | Proveedor | Límite Gratis |
|----------|-----------|---------------|
| Hosting | Vercel | Ilimitado (hobby) |
| Base de datos | Supabase | 500MB + 1GB storage |
| Notificaciones | Firebase FCM | **ILIMITADAS** |
| Auth | Supabase/Next.js | Ilimitado |

### Costos por Usuario:
| Concepto | Costo | Quién lo paga |
|----------|-------|---------------|
| Push notifications | $0 | Nadie (gratis) |
| SMS bienvenida (3) | ~$0.18 | TÚ (una vez) |
| SMS adicionales | ~$0.06/SMS | **USUARIO** (prepago) |

### Costo Mensual Estimado:
```
Con 100 usuarios activos:
├── Hosting:        $0 (Vercel gratis)
├── Database:       $0 (Supabase gratis)
├── SMS inicial:    $18 (100 × $0.18, una vez)
└── TOTAL/mes:      ~$0-2 después del primer mes
```

---

## 📈 Ingresos Estimados

### Por Usuario Free:
```
No genera ingresos directos
Puede comprar SMS packs:
├── Pack 10 SMS:  $1.99 → Tu ganancia: $1.39 (70%)
├── Pack 30 SMS:  $3.99 → Tu ganancia: $2.19 (55%)
├── Pack 100 SMS: $9.99 → Tu ganancia: $3.99 (40%)
└── Pack 250 SMS: $19.99 → Tu ganancia: $4.99 (25%)
```

### Por Usuario Premium:
```
Mensual: $4.99
├── Costo SMS incluidos (20): -$1.20
└── Ganancia neta: $3.79/mes

Anual: $39.99
├── Costo SMS incluidos (240/año): -$14.40
└── Ganancia neta: $25.59/año

Vitalicio: $99.99
├── Costo SMS iniciales (50): -$3.00
└── Ganancia neta: $96.99 (único)
```

### Proyección de Ingresos:

| Usuarios | Free | Premium | SMS Packs | Total/mes |
|----------|------|---------|-----------|-----------|
| 100 | 80 | 15 | ~$20 | $80 |
| 500 | 400 | 75 | ~$80 | $380 |
| 1,000 | 800 | 150 | ~$150 | $750 |
| 5,000 | 4,000 | 750 | ~$600 | $3,600 |

---

## 🚀 Fuentes de Ingreso

### 1. Suscripciones Premium (Principal)
- 70% de ingresos estimados
- Recurrente mensual/anual
- Alta retención (app de salud)

### 2. Packs de SMS
- 20% de ingresos estimados
- Compra única
- Margen 25-70%

### 3. Publicidad (Free users)
- 5% de ingresos estimados
- Google AdSense (web)
- Google AdMob (app nativa)
- Solo usuarios free

### 4. Afiliados Farmacias
- 5% de ingresos estimados
- 5-8% comisión por pedido
- Pasivo

---

## ⚠️ Lo que NO debes hacer

### ❌ NO ofrezcas "SMS ilimitados"
- Perderás dinero
- Los usuarios abusan
- Modelo insostenible

### ❌ NO envíes SMS sin prepago
- El usuario debe comprar ANTES
- Verifica créditos antes de enviar
- Nunca des crédito "a futuro"

### ❌ NO olvides las Push Notifications
- Son GRATIS
- Funcionan para 90% de alertas
- SMS solo para emergencias críticas

---

## ✅ Checklist de Implementación

- [x] Límite de SMS en Premium (20-50/mes)
- [x] Packs SMS con margen de ganancia
- [x] Notificaciones push como método principal
- [x] Verificación de créditos antes de enviar SMS
- [x] Descuento para Premium en packs SMS
- [ ] Integrar Stripe para pagos (producción)
- [ ] Configurar Firebase para push (producción)

---

## 📱 Flujo de Alertas Recomendado

```
1. Hora de medicamento
   └──> Push notification (GRATIS)
   
2. Usuario no responde (5 min)
   └──> Push notification (GRATIS)
   
3. Usuario no responde (15 min)
   └──> Push notification (GRATIS)
   
4. Usuario no responde (30 min) + Medicamento CRÍTICO
   └──> SMS a cuidador (COSTO: usuario debe tener créditos)
   
5. Botón de Pánico
   └──> SMS inmediato (COSTO: usuario debe tener créditos)
```

---

## 🔐 Variables de Entorno para Producción

```env
# GRATIS - Firebase (Push Notifications)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# GRATIS hasta $0.5M - Stripe (Pagos)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# PAGO POR USO - Twilio (SMS)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
# Solo configura esto cuando tengas ingresos!
```

---

## 💡 Consejos Finales

1. **Empieza con Push Notifications** - 100% gratis
2. **Añade SMS después** - Cuando tengas usuarios pagando
3. **Configura Stripe primero** - Antes de Twilio
4. **El modelo es sostenible** - El usuario financia el servicio

---

*Documento creado: Enero 2025*
*Última actualización: Modelo verificado y probado*
