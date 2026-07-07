# 🔴 PASION ROJA: COMMAND CENTER
### Manual de Operaciones y Especificación Técnica
**Propiedad de Pasión Roja - Angol, Chile - 2026**

---

## 📂 ESTRUCTURA GENERAL DE DOCUMENTOS
| Documento | Descripción |
| :--- | :--- |
| **[README](README.md)** | Visión general del proyecto e instrucciones de inicio. |
| **[AGENTS](AGENTS.md)** | Reglas de desarrollo para asistentes IA (Next.js docs locales). |

---

## 🏗️ ARQUITECTURA DEL SISTEMA

### Single-Tenant
Plataforma monolítica para **Pasión Roja** (Angol, Chile). Sin multi-tenancy. Roles: `admin` (único email hardcodeado) y `anonymous` (público).

### Stack Tecnológico
| Capa | Tecnología | Versión |
|---|---|---|
| **Web** | Next.js (App Router) + React + TypeScript + Tailwind CSS | 16.2.9 / 19.2.4 / ^5 / ^4 |
| **Backend** | Firebase Cloud Functions (Node 20) + Firestore | ^14.1.0 / ^12.15.0 |
| **Auth** | Firebase Authentication (email/password) | ^12.15.0 |
| **UI** | Radix UI (avatar, dialog, dropdown, label, select, tabs, toast) | ^1.x |
| **Rich Text** | Tiptap (starter-kit, image, link, placeholder) | ^3.27.1 |
| **Forms** | react-hook-form + @hookform/resolvers + Zod | ^7.80.0 / ^5.4.0 / ^4.4.3 |
| **Icons** | Lucide React | ^1.21.0 |
| **Carousel** | Embla Carousel React | ^8.6.0 |
| **Date** | date-fns | ^4.4.0 |
| **CSS Utils** | clsx + tailwind-merge + class-variance-authority | ^2.1.1 / ^3.6.0 / ^0.7.1 |
| **Linting** | ESLint (next/core-web-vitals + typescript) | ^9 |
| **PWA** | Manifest | - |
| **i18n** | I18nProvider (ES/ARN Mapudungun) | - |
| **Streaming** | YouTube IFrame API + Reproductor personalizado | - |

---

## 🧩 MÓDULOS DEL SISTEMA

### 🌐 Sitio Público (`src/app/`)
**Deploy:** Pendiente

#### Home (`/`)
- Hero con wallpaper, sports ticker, live now bar
- Cuadrícula de deportes, clubes destacados, últimas noticias, sponsors
- Botón flotante WhatsApp

#### En Vivo (`/en-vivo`, `/tv`, `/radio`)
- Reproductor YouTube live stream + countdown
- Reproductor TV online
- Reproductor Radio online

#### Deportes (`/deportes`)
- Catálogo completo de deportes con iconos SVG
- Página de detalle por deporte

#### Equipos (`/equipos`)
- Listado de equipos con cards (logo, nombre, deporte, colores)
- Página de detalle con plantilla de jugadores

#### Jugadores (`/jugadores/[id]`)
- Perfil de jugador con foto, estadísticas, datos físicos

#### Partidos (`/partidos`)
- Listado de partidos con filtros
- Detalle con marcador, timeline, comentarios en vivo, reacciones

#### Partido en Vivo (`/partido`)
- Centro de partido en vivo: marcador en tiempo real, cronómetro, timeline de eventos, comentarios, reacciones rápidas

#### Noticias (`/noticias`)
- Listado con categorías (partido, torneo, entrevista, general)
- Detalle con contenido rich text (Tiptap)

#### Posiciones (`/posiciones`)
- Tabla de posiciones calculada desde resultados

#### Estadísticas (`/estadisticas`)
- Rankings de goleadores y estadísticas por deporte

#### Programación (`/programacion`)
- Parrilla de programación de Radio y TV

#### Multimedia (`/multimedia`)
- Galería de imágenes, videos y audio

#### Sponsors (`/sponsors`)
- Vitrina de sponsors (principal, oficial, auspiciador, media)

#### Contacto (`/contacto`)
- Formulario de contacto con validación Zod

---

### 🔧 Panel Admin (`src/app/admin/`)
**Protegido:** Firebase Auth email/password — solo `administrador@pasionroja.cl`

| Ruta | Funcionalidad |
|---|---|
| `/admin` | Dashboard con KPIs (deportes, equipos, jugadores, partidos, noticias, sponsors), últimos partidos, estado general |
| `/admin/deportes` | CRUD deportes: nombre, icono, banner, sistema de puntos, estadísticas disponibles |
| `/admin/divisiones` | CRUD divisiones/ligas: tipo (liga/copa/torneo), cuadrangular, liguilla, playoff, ascensos/descensos, promoción |
| `/admin/equipos` | CRUD equipos: logo, colores, estadio, redes sociales, entrenador |
| `/admin/equipos/[id]/jugadores` | Gestión de plantilla por equipo |
| `/admin/jugadores` | CRUD jugadores: foto, posición, datos físicos, estadísticas por temporada |
| `/admin/partidos` | CRUD partidos: navegación por jornada, edición inline de marcador/fecha/estado |
| `/admin/posiciones` | Tabla de posiciones calculada con filtros |
| `/admin/estadisticas` | Editor de estadísticas por jugador |
| `/admin/marcador` | Control de marcador en vivo: goles, tarjetas, cambios, cronómetro |
| `/admin/noticias` | CRUD noticias: editor rich text Tiptap, upload de imágenes (Base64), publish/draft |
| `/admin/transmision` | Configuración de streaming: URL YouTube, estado en vivo |
| `/admin/programacion` | CRUD programación Radio/TV |
| `/admin/sponsors` | CRUD sponsors con tipos y orden |
| `/admin/contacto` | Bandeja de mensajes de contacto |
| `/admin/historial` | Log de auditoría de acciones admin |
| `/admin/multimedia` | Gestión de contenido multimedia |

#### Componentes Admin
- `admin-layout.tsx` — Sidebar colapsable + TopBar + Breadcrumbs
- `metric-card.tsx`, `dashboard-metrics.tsx` — KPIs
- `quick-actions-bar.tsx`, `actions-dropdown.tsx` — Acciones rápidas
- `marcador-form.tsx`, `cronometro-partido.tsx` — Control de partido en vivo
- `noticia-form.tsx`, `noticia-editor.tsx` — Editor de noticias con Tiptap
- `image-uploader.tsx` — Upload y compresión de imágenes
- `contacto-bandeja.tsx`, `historial-cambios.tsx` — Bandejas de datos

---

### ☁️ Backend Firebase (`firebase/`)
**Deploy:** Firebase Cloud Functions (us-central1)

#### Cloud Functions (3 funciones)

| Función | Tipo | Propósito | Seguridad |
|---|---|---|---|
| `checkYoutubeLive` | Pub/Sub (5min) | Verifica estado live del canal YouTube; actualiza `config_transmision/actual` | API Key |
| `onMarcadorUpdate` | Firestore `onWrite` | Registra cambios de marcador en `admin_logs` | Solo admin |
| `onNoticiaCreate` | Firestore `onCreate` | Registra creación de noticias en `admin_logs` | Solo admin |

#### Firestore Collections

| Colección | Lectura | Escritura | Propósito |
|---|---|---|---|
| `deportes` | Público | Admin | Catálogo de deportes |
| `divisiones` | Público | Admin | Ligas/divisiones/torneos |
| `equipos` | Público | Admin | Equipos |
| `jugadores` | Público | Admin | Jugadores |
| `partidos` | Público | Admin | Partidos |
| `partidos_en_vivo` | Público | Admin | Estado de partido en vivo |
| `noticias` | Público | Admin | Artículos de noticias |
| `config_transmision` | Público | Admin | Configuración de streaming |
| `sponsors` | Público | Admin | Sponsors |
| `programas` | Público | Admin | Programación Radio/TV |
| `multimedia` | Público | Admin | Galería multimedia |
| `contacto` | Admin solo create público | Admin | Mensajes de contacto |
| `admin_logs` | Admin | Admin | Auditoría de acciones |

#### Firestore Security Rules
- Admin identificado por email: `request.auth.token.email == 'administrador@pasionroja.cl'`
- Colecciones públicas: `allow read: if true`
- Colección `contacto`: `allow create: if true` (público)
- Catch-all: `allow write: if false`

---

## 🎨 Componentes UI del Sistema

### Públicos
| Componente | Ubicación | Propósito |
|---|---|---|
| `header.tsx` | `components/layout/` | Header sticky con menú mobile sheet |
| `footer.tsx` | `components/layout/` | Footer con secciones y redes |
| `bottom-nav.tsx` | `components/layout/` | Nav inferior mobile (auto-ocultable) |
| `hero.tsx` | `components/layout/` | Hero con wallpaper, ticker, deportes, clubes, noticias, sponsors |
| `sports-ticker.tsx` | `components/shared/` | Ticker de noticias en scroll |
| `sport-icons.tsx` | `components/shared/` | Iconos SVG dinámicos (10 deportes) |
| `live-now-bar.tsx` | `components/shared/` | Barra "EN VIVO" |
| `badge-en-vivo.tsx` | `components/shared/` | Badge pulsante en vivo |
| `whatsapp-float.tsx` | `components/shared/` | Botón flotante WhatsApp |
| `theme-toggle.tsx` | `components/shared/` | Toggle dark/light (bloqueado dark) |
| `network-status.tsx` | `components/shared/` | Banner de conectividad |

### Sistema de Partido en Vivo
| Componente | Ubicación | Propósito |
|---|---|---|
| `match-scoreboard.tsx` | `components/partidos/` | Marcador de partido |
| `marcador-en-vivo.tsx` | `components/partido/` | Scoreboard en tiempo real |
| `live-timeline.tsx` | `components/partido/` | Timeline de eventos del partido |
| `comentarios-en-vivo.tsx` | `components/partido/` | Comentarios en vivo (subcollección) |
| `reacciones-rapidas.tsx` | `components/partido/` | Reacciones emotive |
| `cronometro-partido.tsx` | `components/admin/` | Cronómetro sincronizado Firestore |

### Sistema de Streaming
| Componente | Ubicación | Propósito |
|---|---|---|
| `reproductor-youtube.tsx` | `components/transmision/` | Reproductor YouTube IFrame |
| `banner-stream.tsx` | `components/transmision/` | Banner de stream activo |
| `countdown-stream.tsx` | `components/transmision/` | Countdown para próximo stream |
| `indicador-en-vivo.tsx` | `components/transmision/` | Indicador de estado en vivo |
| `tv-player.tsx` | `components/tv/` | Reproductor TV online |

---

## ⚡ Hooks y Data Fetching

Todos los hooks usan **Firestore real-time listeners** (`onSnapshot`). Sin SSR/SSG ni capa de caché.

| Hook | Colección/Fuente | Propósito |
|---|---|---|
| `use-auth.ts` | Firebase Auth | Listener de autenticación |
| `use-deportes.ts` | `deportes` | Deportes en tiempo real |
| `use-equipos.ts` | `equipos` | Equipos (filtro por deporteId) |
| `use-equipos-map.ts` | `equipos` | Mapa `{id → nombre}` para selects |
| `use-jugadores.ts` | `jugadores` | Jugadores (filtro por equipoId) |
| `use-partidos.ts` | `partidos` | Partidos (filtros: deporteId, estado, max) |
| `use-noticias.ts` | `noticias` | Noticias publicadas |
| `use-marcador.ts` | `partidos_en_vivo/actual` | Marcador en tiempo real |
| `use-transmision.ts` | `config_transmision/actual` | Config de streaming |
| `use-posiciones.ts` | `partidos` (cálculo cliente) | Tabla de posiciones computada |
| `use-estadisticas.ts` | `jugadores` (cálculo cliente) | Rankings computados |
| `use-multimedia.ts` | `multimedia` | Galería multimedia |
| `use-programacion.ts` | `programas` | Programación Radio/TV |
| `use-sponsors.ts` | `sponsors` | Sponsors activos |
| `use-contacto.ts` | `contacto` | Mensajes + envío |
| `use-comentarios.ts` | `partidos_en_vivo/{id}/comentarios` | Comentarios de partido |
| `use-cronometro.ts` | `partidos_en_vivo/actual` | Cronómetro sincronizado |
| `use-auto-save.ts` | localStorage | Auto-guardado de borradores |
| `use-wake-lock.ts` | Screen Wake Lock API | Evita suspensión de pantalla |
| `use-network-status.ts` | Navigator | Estado de conectividad |
| `use-scroll-direction.ts` | Scroll event | Detección de scroll up/down |

---

## 🔒 SEGURIDAD

| Issue | Riesgo | Estado |
|---|---|---|
| Admin email hardcodeado en rules | 🟠 Medio | Hardcodeado `administrador@pasionroja.cl` |
| Sin rate limiting | 🟠 Alto | No implementado |
| Imágenes como Base64 en Firestore | 🟠 Alto | Sin Firebase Storage |
| Sin autenticación de dos factores | 🟠 Medio | Solo email/password |
| Sin tests de seguridad | 🔴 Crítico | No implementados |
| Sin Sentry / monitoreo | 🟠 Alto | No implementado |
| API keys en Firebase config | 🟢 OK | Variables de entorno |
| Headers de seguridad (X-Frame-Options, etc.) | ✅ Configurado en next.config.ts | |

---

## 📁 ESTRUCTURA DEL PROYECTO

```
Pasion-Roja/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Providers + Header + BottomNav + Footer
│   │   ├── page.tsx                  # Home → Hero
│   │   ├── globals.css               # 60+ variables CSS + animaciones
│   │   ├── loading.tsx               # Skeleton global
│   │   ├── error.tsx                 # Error boundary cliente
│   │   ├── not-found.tsx             # 404
│   │   ├── admin/                    # Panel admin (16 rutas)
│   │   │   ├── layout.tsx            # AdminLayout wrapper
│   │   │   ├── page.tsx              # Dashboard KPIs
│   │   │   ├── login/               # Login Firebase
│   │   │   ├── deportes/            # CRUD deportes
│   │   │   ├── divisiones/          # CRUD divisiones
│   │   │   ├── equipos/             # CRUD equipos + plantilla
│   │   │   ├── jugadores/           # CRUD jugadores
│   │   │   ├── partidos/            # CRUD partidos
│   │   │   ├── posiciones/          # Tabla de posiciones
│   │   │   ├── estadisticas/        # Editor estadísticas
│   │   │   ├── marcador/            # Control en vivo
│   │   │   ├── noticias/            # CRUD noticias
│   │   │   ├── transmision/         # Config streaming
│   │   │   ├── programacion/        # Programación Radio/TV
│   │   │   ├── sponsors/            # CRUD sponsors
│   │   │   ├── contacto/            # Bandeja mensajes
│   │   │   ├── historial/           # Auditoría
│   │   │   └── multimedia/          # Gestión multimedia
│   │   ├── api/                     # API routes
│   │   │   ├── youtube/route.ts     # GET: estado live YouTube
│   │   │   └── push/                # Push notifications (stubs)
│   │   ├── noticias/                # Noticias pública
│   │   ├── deportes/                # Deportes pública
│   │   ├── equipos/                 # Equipos pública
│   │   ├── partidos/                # Partidos pública
│   │   ├── jugadores/               # Perfiles jugadores
│   │   ├── en-vivo/                 # Live stream
│   │   ├── tv/                      # TV online
│   │   ├── radio/                   # Radio online
│   │   ├── multimedia/              # Galería
│   │   ├── programacion/            # Parrilla
│   │   ├── posiciones/              # Tabla posiciones
│   │   ├── estadisticas/            # Estadísticas
│   │   ├── sponsors/                # Sponsors
│   │   ├── contacto/                # Contacto
│   │   └── partido/                 # Centro de partido en vivo
│   ├── components/
│   │   ├── admin/                   # 18 componentes admin
│   │   ├── layout/                  # Header, Footer, BottomNav, Hero
│   │   ├── shared/                  # Providers, Skeleton, Ticker, Icons, etc.
│   │   ├── ui/                      # 10+ primitivas Radix UI
│   │   ├── deportes/                # DeportesGrid, etc.
│   │   ├── equipos/                 # EquipoCard, etc.
│   │   ├── jugadores/               # JugadorCard, etc.
│   │   ├── noticias/                # CardNoticia, ListaNoticias, etc.
│   │   ├── partidos/                # MatchCard, MatchScoreboard
│   │   ├── partido/                 # MarcadorEnVivo, LiveTimeline, Comentarios
│   │   ├── posiciones/              # LeagueTable
│   │   ├── estadisticas/            # TopScorers
│   │   ├── transmision/             # ReproductorYoutube, Countdown, Banner
│   │   ├── tv/                      # TvPlayer
│   │   ├── radio/                   # RadioPageClient
│   │   ├── programacion/            # ProgramacionPageClient
│   │   ├── multimedia/              # MultimediaPageClient
│   │   ├── sponsors/                # SponsorsGrid
│   │   ├── contacto/                # ContactForm
│   │   └── clubes/                  # ClubesDestacados, ClubCard
│   ├── providers/                   # AuthProvider, ThemeProvider, I18nProvider
│   ├── hooks/                       # 22 hooks personalizados
│   ├── lib/                         # Firebase, utils, validations, translations
│   └── types/                       # 13 interfaces TypeScript
├── firebase/
│   ├── functions/src/index.ts       # 3 Cloud Functions
│   ├── firestore.rules              # Security rules
│   ├── firestore.indexes.json       # Índices compuestos
│   └── firebase.json                # Config Firebase
├── public/
│   ├── manifest.json                # PWA manifest
│   └── icons/                       # 10 iconos SVG deportes
├── next.config.ts                   # Security headers, image formats
├── package.json                     # Dependencias y scripts
└── tsconfig.json                    # Config TypeScript
```

---

## 📊 ESTADO DEL SISTEMA

| Componente | Funcional | Seguro | Con Tests |
|---|---|---|---|
| **Frontend Público (13 rutas)** | ✅ 100% | ✅ | ❌ 0 tests |
| **Panel Admin (16 rutas)** | ✅ 100% | ✅ | ❌ 0 tests |
| **Cloud Functions (3)** | ✅ 100% | ✅ | ❌ 0 tests |
| **Firestore Rules** | ✅ | ✅ | - |
| **PWA** | ⚠️ Manifest OK, sin service worker | - | - |
| **i18n** | ✅ ES/ARN (Mapudungun) | - | - |
| **CI/CD** | ❌ No configurado | - | - |
| **Monitoreo** | ❌ No configurado | - | - |
| **Testing** | ❌ 0 tests | - | - |

---

## 🌐 Internacionalización (i18n)

- **Provider:** `I18nProvider` en `providers/i18n-provider.tsx`
- **Idiomas:** Español (`es.json` — 43 claves) y Mapudungun (`arn.json` — 11 claves)
- **Auto-detección:** `navigator.language` con prefijo `arn`
- **Fallback:** Clave en español si no existe traducción
- **Uso:** `useI18n()` → `t('key')`

---

## 📝 Tipos de Datos (13 interfaces)

| Tipo | Colección | Campos clave |
|---|---|---|
| `Deporte` | `deportes` | nombre, icono, bannerBase64, sistemaPuntos, estadisticasDisponibles |
| `Division` | `divisiones` | deporteId, tipo, equipoIds, totalJornadas, config cuadrangular/liguilla/promoción |
| `Equipo` | `equipos` | nombre, deporteId, divisionId, logoBase64, colores, redes sociales |
| `Jugador` | `jugadores` | nombre, equipoId, posicion, fotoBase64, stats físicos, estadisticasTemp |
| `Partido` | `partidos` | equipoLocal/Visita, marcador, estado, jornada, eventos[] |
| `Noticia` | `noticias` | titulo, cuerpo (Tiptap), categoria, imagenes Base64, publicado |
| `Sponsor` | `sponsors` | nombre, logoBase64, tipo (principal/oficial/auspiciador/media) |
| `Programa` | `programas` | titulo, tipo (radio/tv), dia, horaInicio, horaFin |
| `ConfigTransmision` | `config_transmision` | youtubeUrl, enVivo, proximoStream |
| `Contacto` | `contacto` | nombre, email, mensaje, leido, respondido |
| `Multimedia` | `multimedia` | tipo (imagen/video/audio), url, descripcion |
| `AdminLog` | `admin_logs` | accion, coleccion, documentoId, usuarioId, timestamp |
| `Estadistica / TablaPosiciones` | Computado cliente | Rankings calculados desde resultados |

---

## 🎯 Funcionalidades Clave

- **Partido en Vivo:** Marcador en tiempo real con cronómetro sincronizado Firestore, timeline de eventos, comentarios y reacciones
- **Cálculo de Posiciones:** Tabla de posiciones computada client-side desde resultados de partidos finalizados
- **Editor de Noticias:** Rich text con Tiptap (starter-kit, image, link, placeholder), imágenes comprimidas a WebP Base64
- **Sistema de Streaming:** Detección automática de live YouTube vía Cloud Function Pub/Sub cada 5 min
- **Modo Oscuro:** UI dark-first con 60+ variables CSS personalizadas y animaciones custom
- **Compresión de Imágenes:** Cliente-side con `compressImage()` a WebP antes de almacenar como Base64
- **Auto-guardado:** Borradores de contenido guardados en localStorage
- **Wake Lock:** Evita suspensión de pantalla durante partidos en vivo
- **Push Notifications:** API stub preparada para FCM (pendiente implementar)

---

## 🐛 Áreas de Mejora / Deuda Técnica

| Área | Problema | Prioridad |
|---|---|---|
| **Testing** | Sin tests unitarios, de integración ni E2E | 🔴 Alta |
| **CI/CD** | Sin pipelines de integración continua | 🔴 Alta |
| **Monitoreo** | Sin Sentry, ni analytics, ni logging centralizado | 🟠 Media |
| **Imágenes** | Almacenadas como Base64 en Firestore (límite 1 MiB por doc) | 🟠 Media |
| **PWA** | Service worker no implementado | 🟠 Media |
| **Seguridad** | Admin email hardcodeado, sin 2FA, sin rate limiting | 🟠 Media |
| **SSR/SEO** | Todo client-side, sin server components ni generación estática | 🟡 Baja |
| **Caché** | Sin TanStack Query ni capa de caché | 🟡 Baja |

---

**PASIÓN ROJA - Angol, Chile - 2026**
*Identidad, Pasión y Deporte*
