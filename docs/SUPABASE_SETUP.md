# 🗄️ Configuración de Supabase - MediControl

## 📋 Resumen

Esta guía te muestra cómo configurar Supabase para:
- Persistencia de datos en la nube
- Sincronización entre dispositivos
- Acceso de cuidadores a datos del paciente

---

## 🚀 Paso 1: Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Clic en **"New Project"**
3. Configura:
   - **Nombre**: `medicontrol`
   - **Contraseña**: Genera una segura (guárdala)
   - **Región**: Elige la más cercana a tus usuarios
4. Clic en **"Create new project"**
5. Espera ~2 minutos mientras se crea

---

## 📊 Paso 2: Crear Tablas

1. En el dashboard, ve a **SQL Editor**
2. Clic en **"New query"**
3. Copia y pega el contenido de `/supabase/schema.sql`
4. Clic en **"Run"**
5. Verifica que no haya errores

### Luego ejecuta las políticas de cuidadores:
1. Crea otra query
2. Copia y pega el contenido de `/supabase/caregiver-policies.sql`
3. Clic en **"Run"**

---

## 🔑 Paso 3: Obtener Credenciales

1. Ve a **Settings** → **API**
2. Copia los siguientes valores:

| Variable | Ubicación |
|----------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key (secreta) |

### Agregar a tu proyecto:

Crea `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJ...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJ...
```

En Vercel, agrega las variables en:
**Settings** → **Environment Variables**

---

## 🔐 Paso 4: Configurar Autenticación

1. Ve a **Authentication** → **Providers**
2. Asegúrate de que **Email** esté habilitado
3. Configura según tus preferencias:
   - Confirm email: On (recomendado)
   - Secure email change: On
   - Secure password change: On

### Configurar URLs permitidas:
1. Ve a **Authentication** → **URL Configuration**
2. Agrega:
   - **Site URL**: `https://tu-app.vercel.app`
   - **Redirect URLs**: `https://tu-app.vercel.app/**`

---

## 📊 Estructura de la Base de Datos

### Tablas Principales:

```
users
├── id (UUID, PK)
├── email
├── name
├── phone
├── is_premium
├── sms_credits
└── created_at

medications
├── id (UUID, PK)
├── user_id (FK → users)
├── name
├── dose
├── schedules[]
├── status
├── stock
└── is_critical

dose_records
├── id (UUID, PK)
├── user_id (FK → users)
├── medication_id (FK → medications)
├── date
├── scheduled_time
├── status
└── actual_time

caregiver_relationships
├── id (UUID, PK)
├── patient_id (FK → users)
├── caregiver_user_id (FK → users)
├── caregiver_email
├── relationship
├── status (pending/active)
├── can_view_medications
├── can_view_doses
└── can_receive_alerts
```

---

## 👥 Sistema de Cuidadores

### Flujo de Invitación:

```
1. Paciente agrega cuidador
   └── Se crea registro con status='pending'
   └── Se envía email de invitación

2. Cuidador acepta invitación
   └── Se actualiza status='active'
   └── Se vincula caregiver_user_id

3. Cuidador puede ver:
   ├── Medicamentos del paciente
   ├── Historial de dosis
   ├── Alertas de dosis omitidas
   └── Resumen diario
```

### Permisos Granulares:

| Permiso | Descripción |
|---------|-------------|
| `can_view_medications` | Ver lista de medicamentos |
| `can_view_doses` | Ver historial de tomas |
| `can_view_history` | Ver historial completo |
| `can_view_reports` | Ver reportes |
| `can_receive_alerts` | Recibir alertas |
| `can_receive_missed_dose` | Alertas de dosis omitidas |
| `can_receive_panic_button` | Alertas de botón de pánico |

---

## 🔒 Seguridad (RLS)

Todas las tablas tienen **Row Level Security** habilitado:

### Usuarios normales:
- Solo pueden ver/editar **sus propios datos**

### Cuidadores:
- Pueden ver datos de sus pacientes asignados
- No pueden editar datos del paciente
- Solo lectura

### Ejemplo de política RLS:
```sql
-- Usuarios ven solo sus medicamentos
CREATE POLICY "Users can view own medications"
  ON medications FOR SELECT
  USING (auth.uid() = user_id);

-- Cuidadores ven medicamentos del paciente
CREATE POLICY "Caregivers can view patient medications"
  ON medications FOR SELECT
  USING (is_active_caregiver(user_id));
```

---

## 🔄 Sincronización Offline

El sistema maneja sincronización automática:

### Estrategia:
1. **Datos locales** = localStorage (siempre disponible)
2. **Cambios** → Se guardan localmente primero
3. **Online** → Se sincronizan con Supabase
4. **Offline** → Se guardan en cola de pendientes

### API del servicio:
```typescript
import { syncService } from '@/lib/sync-service';

// Sincronizar todo
const result = await syncService.fullSync(userId, {
  medications: localMeds,
  doseRecords: localRecords,
});

// Verificar estado
const status = syncService.getSyncStatus();
// { isSyncing, lastSyncAt, pendingChanges, error }
```

---

## 📱 APIs Disponibles

### Para Usuarios:
| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/sync/medications` | GET | Obtener medicamentos |
| `/api/sync/medications` | POST | Crear medicamento |
| `/api/sync/medications` | PUT | Actualizar medicamento |
| `/api/sync/medications` | DELETE | Eliminar medicamento |
| `/api/sync/doses` | GET/POST | Gestionar dosis |

### Para Cuidadores:
| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/caregiver/patients` | GET | Lista de pacientes |
| `/api/caregiver/patient/[id]` | GET | Datos del paciente |

---

## ✅ Checklist de Configuración

- [ ] Proyecto creado en Supabase
- [ ] Tablas creadas (schema.sql)
- [ ] Políticas de cuidadores (caregiver-policies.sql)
- [ ] Credenciales en .env.local
- [ ] Credenciales en Vercel
- [ ] URLs de autenticación configuradas
- [ ] Probar con datos de prueba

---

## 🧪 Datos de Prueba

Puedes crear datos de prueba desde el SQL Editor:

```sql
-- Crear usuario de prueba (después de registrarse en la app)
INSERT INTO public.users (id, email, name, sms_credits)
VALUES (
  auth.uid(),
  'test@email.com',
  'Usuario Prueba',
  10
);

-- Crear medicamento de prueba
INSERT INTO public.medications (user_id, name, dose, dose_unit, frequency_type, frequency_value, schedules, start_date)
VALUES (
  auth.uid(),
  'Ibuprofeno',
  400,
  'mg',
  'veces_dia',
  3,
  ARRAY['08:00', '14:00', '20:00'],
  CURRENT_DATE
);
```

---

## 🆘 Solución de Problemas

### Error: "permission denied for table"
- Verifica que RLS esté habilitado
- Verifica que el usuario esté autenticado
- Ejecuta el script de políticas nuevamente

### Error: "JWT expired"
- El token expiró, el usuario necesita hacer login nuevamente
- Implementa refresh de tokens

### Los datos no se sincronizan
- Verifica que Supabase esté configurado
- Verifica conexión a internet
- Revisa la consola del navegador

---

*Documento actualizado: Enero 2025*
