# Changelog

Todas las cambios notables de este proyecto se documentan en este archivo. Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

## [2026-08-12]

### Añadido
- Dashboard MKBACBO (`/`) con layout 12 columnas y componentes `bacbopro/` (Header, KpiGrid, StreakBoard, HistoryPanel, StatsBar, LastWinnerCard, OperationCard)
- Dashboard Baccarat legacy (`/legacy`) con simulación, estadísticas y control dev
- Stores (Pinia), mappers, composables, types y datos mock sin backend
- Suite de tests Vitest (53 tests en 6 archivos)
- Script `check:no-backend` que impide dependencias de backend (axios, fetch, WebSocket, supabase)
- Dependencia `@vitest/coverage-v8` para reportes de cobertura
- `CHANGELOG.md` y `TASKS.md`
