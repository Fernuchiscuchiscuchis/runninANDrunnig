# 🏃 BARA 2.0 — Running • Gym • Nutrición

> Tu entrenamiento, tu plaza, tu progreso.  
> La app de fitness para atletas de barrio que entrenan sin gadgets caros.

---

## ¿Qué es BARA?

BARA es una Progressive Web App (PWA) diseñada para personas que entrenan en entornos donde **no pueden usar el celular durante la actividad** (por seguridad u otras razones). Todo se registra **manualmente al volver a casa**, en menos de 30 segundos.

---

## ✨ Funcionalidades

### 🏃 Running
- Registro manual: vueltas, tiempo, sensación
- Cálculo automático de km, ritmo y velocidad
- Configurable: metros por vuelta de tu plaza
- Historial completo

### 💪 Gym
- Registro simple: ejercicio, peso, series, reps
- Autocompletado de ejercicios comunes
- Rutinas sugeridas según tu nivel (Full Body, Upper/Lower, PPL)
- Récords personales por ejercicio
- Volumen semanal calculado automáticamente

### 🍽️ Nutrición
- Onboarding inicial: edad, peso, altura, sexo, objetivo
- TMB y TDEE calculados automáticamente (Mifflin-St Jeor)
- Calorías objetivo ajustadas por actividad real del día
- Macros recomendados según objetivo
- Registro de comidas por tipo

### 📊 Dashboard integrado
- Estado general del día
- Sugerencia inteligente cruzando running + gym + nutrición
- Línea de tiempo de actividad reciente
- Stats semanales

### 🎯 Stats
- Evolución mensual (running + gym)
- Totales históricos
- Índice de Disciplina (0-100)

---

## 🛠️ Stack técnico

```
Frontend:    HTML5 + CSS3 + JavaScript Vanilla
Storage:     localStorage (offline first)
PWA:         Service Worker + Web App Manifest
Fuentes:     JetBrains Mono + Outfit (Google Fonts)
Deploy:      GitHub Pages / Netlify / Vercel
```

Sin frameworks, sin dependencias externas, sin backend requerido.

---

## 🚀 Cómo correrlo localmente

```bash
# Clonar el repo
git clone https://github.com/TU_USUARIO/bara.git
cd bara

# Opción A: servidor local simple
npx serve .

# Opción B: Python
python3 -m http.server 8080

# Abrir en navegador
# http://localhost:8080
```

> ⚠️ No abrir directamente con `file://` porque el Service Worker no funciona así.

---

## 📱 Instalar como app

1. Abrí la URL en Chrome (Android) o Safari (iOS)
2. En Chrome: menú → "Agregar a pantalla de inicio"
3. En Safari: compartir → "Agregar a inicio"

---

## 📐 Fórmulas utilizadas

### Metabolismo Basal (Mifflin-St Jeor)
```
Hombres: TMB = 10×peso + 6.25×altura - 5×edad + 5
Mujeres: TMB = 10×peso + 6.25×altura - 5×edad - 161
```

### TDEE
```
TDEE = TMB × factor_actividad
Sedentario: 1.2 | Leve: 1.375 | Moderado: 1.55 | Activo: 1.725
```

### Calorías quemadas running
```
Cal = peso_kg × km × 1.036
```

### Calorías quemadas gym
```
Cal = (minutos × 6.0 × peso_kg) / 60
```

### Ritmo (pace)
```
Pace = tiempo_total_minutos / distancia_km
```

---

## 🗂️ Estructura del proyecto

```
bara/
├── index.html           # App principal
├── manifest.json        # PWA manifest
├── sw.js                # Service Worker
├── css/
│   ├── main.css         # Variables, layout, header, nav
│   ├── components.css   # Cards, botones, forms, stats
│   └── modals.css       # Estilos de modales
├── js/
│   ├── data.js          # Capa de datos (localStorage)
│   ├── nutrition.js     # Módulo nutrición
│   ├── running.js       # Módulo running
│   ├── gym.js           # Módulo gym + rutinas
│   ├── ui.js            # Helpers UI + dashboard + stats
│   └── app.js           # Init + onboarding
└── icons/
    ├── icon-192.png     # Ícono PWA
    └── icon-512.png     # Ícono PWA grande
```

---

## 🌐 Deploy en GitHub Pages

```bash
# 1. Crear repo en GitHub
# 2. Subir archivos
git init
git add .
git commit -m "feat: BARA 2.0 inicial"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/bara.git
git push -u origin main

# 3. Activar GitHub Pages
# Settings → Pages → Source: main / (root)
```

URL resultante: `https://TU_USUARIO.github.io/bara`

---

## 🔮 Roadmap

- [ ] v2.1 — Gráficos de evolución de peso por ejercicio
- [ ] v2.1 — Sistema de logros y achievements
- [ ] v2.2 — Firebase auth + sync multi-dispositivo
- [ ] v2.2 — Notificaciones push
- [ ] v3.0 — Integración IA para coaching conversacional
- [ ] v3.0 — Comparativa social (modo equipos)

---

## 📄 Licencia

MIT — Libre para usar, modificar y distribuir.

---

*Hecho con ☕ para atletas de barrio que progresan en serio.*
