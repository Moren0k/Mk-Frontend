# Changelog

Todas las cambios notables de este proyecto se documentan en este archivo. Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

## [2026-08-14]

### Añadido
- Integración de la API MKBOT documentada en `documentacion_mk_api.md`: capa `src/api` (cliente HTTP con `X-Api-Key` y timeout, cliente SSE con fetch nativo sin dependencias, tipos de contrato y endpoints tipados), `src/stores/bacbopro.ts` (estado por canal, hidratación paralela, filtrado de eventos SSE por `strategyId`, polling de summary a 60s) y `src/mappers/bacboproMapper.ts`
- Configuración por variables de entorno (`VITE_API_BASE_URL`, `VITE_API_KEY`) con `.env.example` y `.env` ignorado por git
- Estados loading/error/empty/disconnected en Header, ToggleCard, OperationCard, KPIs, Stats, StreakBoard, HistoryPanel y LastWinnerCard
- Botón CANCELAR OPERACIÓN (POST `/operations/:id/cancel`) con confirmación y botón ENVIAR RESUMEN (POST `/admin/reports`) con confirmación
- Tests de la capa API: client, SSE, endpoints, mapper y store (144 tests en total)

### Cambiado
- MKBACBO (`/`) consume datos reales de la API en lugar de mocks: KPIs del canal oficial (`GET /reports/summary`), estrategias de `GET /strategies` (`streak-3`/`streak-4`), operaciones por canal con una tarjeta por canal, historial/rachas/porcentajes de `GET /history` + SSE
- `ToggleCard`/`StrategySelector` ahora son prop-driven y emiten la confirmación (PATCH) al store; el switch refleja el estado pendiente hasta confirmar
- `check:no-backend` permite la capa `src/api` y sigue protegiendo el resto de `src/`
- Transformaciones de tablero movidas de `mocks/bacbopro` a `mappers/bacboproMapper` (mocks residuales solo para tests)

### Eliminado
- Mocks runtime de MKBACBO: `kpiData`, `operationData`, `winnerData`, `strategyData`

### Cambiado
- Reorganización de estadísticas: bloques «ÚLTIMAS 200» y «ÚLTIMAS 50» movidos a una fila propia encima del Tablero de Rachas (grid 1 col en móvil, 2 en md+)
- «ÚLTIMAS 100» reemplazada por «ÚLTIMAS 50» con cálculo real sobre la ventana de 50 resultados de `mockResults`
- Panel «ÚLTIMAS JUGADAS» sin columna lateral de porcentajes; el tablero de historial usa todo el ancho disponible (`w-full`)
- Nuevo componente `StatsSection.vue` que reutiliza `StatsBar.vue`
- Tema neón semántico en toda la app: Player `#00b0ff`, Banker `#ff1744`, Tie `#ffee00`, éxito `#39ff14`, warning `#ff9e00`, MG1/MG2/EP `#d500f9`/`#7c4dff`/`#00e5ff`
- Fondo unificado a `#000000` en ambos dashboards; paneles `#050505`/`#0a0a0a`, bordes `#1f1f1f`, texto muted `#9e9e9e`
- Centralización de colores hardcodeados en tokens (`OperationCard`, `ToggleCard`, `WinnerIndicator`, `ToggleSwitch`, `StatusBadge`, `DevControls`, scrollbar y pulse de `bacbopro.css`)
- Nuevos tokens en `@theme`: `--color-bbp-success`, `--color-bbp-warning`, `--color-bbp-mg1/mg2/ep`, `--color-bbp-panel-secondary`, `--color-bbp-text-muted`, `--color-bbp-border-strong`

### Mejorado
- Glow neón sutil y semántico: celdas de rachas e historial, valores KPI, último ganador, badges de resultado, labels de StatsBar y switch ON (via `color-mix` + fallbacks)
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
