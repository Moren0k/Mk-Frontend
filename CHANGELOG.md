# Changelog

Todas las cambios notables de este proyecto se documentan en este archivo. Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

## [2026-08-14]

### Mejorado
- Layout full-height global: `html/body` al 100% y `#app` con `min-height: 100vh/100dvh` en columna flex
- Responsive en cualquier pantalla del dashboard MKBACBO (`/`): paddings y gaps móviles en KpiCard/KpiGrid, StreakBoard, HistoryPanel y header adaptado a <400px
- Margen inferior consistente en el `main` de `BacboproDashboard` (`pb-6`/`pb-8`)
- Dashboard legacy (`/legacy`): breakpoints 480px y 1920px (centrado ultra-wide), `HeaderStatus` con wrap en <480px y `DevControls` con márgenes horizontales

## [2026-08-12]

### Añadido
- Dashboard MKBACBO (`/`) con layout 12 columnas y componentes `bacbopro/` (Header, KpiGrid, StreakBoard, HistoryPanel, StatsBar, LastWinnerCard, OperationCard)
- Dashboard Baccarat legacy (`/legacy`) con simulación, estadísticas y control dev
- Stores (Pinia), mappers, composables, types y datos mock sin backend
- Suite de tests Vitest (53 tests en 6 archivos)
- Script `check:no-backend` que impide dependencias de backend (axios, fetch, WebSocket, supabase)
- Dependencia `@vitest/coverage-v8` para reportes de cobertura
- `CHANGELOG.md` y `TASKS.md`
