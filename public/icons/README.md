# MediControl - Iconos PWA y Stores

## 📋 Iconos Requeridos

### Para PWA (Progressive Web App)

| Archivo | Tamaño | Uso |
|---------|--------|-----|
| `icon-72x72.png` | 72x72 | Android Chrome |
| `icon-96x96.png` | 96x96 | Android Chrome |
| `icon-128x128.png` | 128x128 | Android Chrome |
| `icon-144x144.png` | 144x144 | Android Chrome |
| `icon-152x152.png` | 152x152 | iOS Safari |
| `icon-192x192.png` | 192x192 | Android Chrome |
| `icon-384x384.png` | 384x384 | Android Chrome |
| `icon-512x512.png` | 512x512 | Android Chrome, Splash |

### Para Stores

| Archivo | Tamaño | Uso |
|---------|--------|-----|
| `store-icon-512.png` | 512x512 | Google Play Store |
| `store-icon-1024.png` | 1024x1024 | Apple App Store |

### Para iOS

| Archivo | Tamaño | Uso |
|---------|--------|-----|
| `apple-touch-icon.png` | 180x180 | iOS Home Screen |

### Para Shortcuts

| Archivo | Tamaño | Uso |
|---------|--------|-----|
| `shortcut-add.png` | 96x96 | Acceso rápido: Agregar |
| `shortcut-history.png` | 96x96 | Acceso rápido: Historial |
| `shortcut-panic.png` | 96x96 | Acceso rápido: Pánico |

### Para Notificaciones

| Archivo | Tamaño | Uso |
|---------|--------|-----|
| `badge-72x72.png` | 72x72 | Badge de notificación |

---

## 🎨 Diseño del Icono

### Especificaciones:
- **Fondo:** Degradado azul (#2563eb → #1d4ed8)
- **Forma:** Cuadrado con esquinas redondeadas (20% radius)
- **Contenido:** Pastilla estilizada blanca
- **Estilo:** Flat design, minimalista, reconocible

### Colores:
```
Fondo inicio: #2563eb (blue-600)
Fondo fin: #1d4ed8 (blue-700)
Pastilla: #ffffff (white)
Sombra sutil: rgba(0,0,0,0.1)
```

---

## 🔧 Cómo Generar los Iconos

### Opción 1: Usar el logo.svg base
```bash
# Instalar sharp
npm install -g sharp-cli

# Generar todos los tamaños
for size in 72 96 128 144 152 192 384 512; do
  sharp -i logo.svg -o icons/icon-${size}x${size}.png resize $size $size
done
```

### Opción 2: Usar herramienta online
1. Ve a [realfavicongenerator.net](https://realfavicongenerator.net/)
2. Sube tu logo.svg
3. Configura los ajustes para cada plataforma
4. Descarga el paquete completo

### Opción 3: Usar Figma/Sketch
1. Crea un artboard de 1024x1024
2. Diseña el icono
3. Exporta en todos los tamaños necesarios

---

## ✅ Checklist de Iconos

- [ ] icon-72x72.png
- [ ] icon-96x96.png
- [ ] icon-128x128.png
- [ ] icon-144x144.png
- [ ] icon-152x152.png
- [ ] icon-192x192.png
- [ ] icon-384x384.png
- [ ] icon-512x512.png
- [ ] apple-touch-icon.png (180x180)
- [ ] store-icon-512.png
- [ ] store-icon-1024.png
- [ ] shortcut-add.png
- [ ] shortcut-history.png
- [ ] shortcut-panic.png
- [ ] badge-72x72.png

---

## 📸 Capturas de Pantalla

### Ubicación: `/public/screenshots/`

### Android (1080x1920):
1. `dashboard.png` - Panel principal
2. `scan.png` - Escaneo de medicamento
3. `inventory.png` - Control de inventario
4. `alerts.png` - Alertas de interacciones
5. `history.png` - Historial y gráficos
6. `caregivers.png` - Gestión de cuidadores

### iOS (1290x2796 para iPhone 14 Pro Max):
Mismas 6 capturas en resolución iOS

---

*Genera estos iconos antes de publicar en stores*
