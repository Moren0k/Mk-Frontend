# Mk-Frontend

Frontend de **MKBACBO**: dashboard oscuro de monitoreo de baccarat construido con Vue 3, TypeScript, Vite y Tailwind CSS. Consume la API MKBOT documentada en `documentacion_mk_api.md` (base `/api/v1`, auth por header `X-Api-Key`, SSE en vivo). El dashboard legacy (`/legacy`) sigue siendo 100% mock con simulación dev.

## Rutas

- `/` — Dashboard MKBACBO (datos reales de la API)
- `/legacy` — Dashboard previo en desarrollo (mock + simulación)

## Configuración

Copiar `.env.example` a `.env` (no versionado) y completar:

- `VITE_API_BASE_URL` — base de la API, p. ej. `http://localhost:3000/api/v1`
- `VITE_API_KEY` — valor del header `X-Api-Key` (secreto compartido del backend)

## Estructura de MKBACBO

- `src/api/` — cliente HTTP, cliente SSE (fetch nativo), tipos de contrato y endpoints
- `src/stores/bacbopro.ts` — estado por canal (oficial/pruebas), hidratación, SSE y acciones
- `src/mappers/bacboproMapper.ts` — transformaciones contrato API → modelos de UI
- `src/views/BacboproDashboard.vue` — layout 12 columnas (main 9 / aside 3)
- `src/components/bacbopro/` — componentes (Header, StatusBadge, ToggleCard, KpiGrid, StreakBoard/StreakColumn, HistoryPanel/HistoryGrid, StatsBar, LastWinnerCard/WinnerIndicator, OperationCard)
- `src/mocks/bacbopro/` — datos mock residuales (solo para tests del tablero)
- `src/assets/images/` — logos de la app (MKBACBO_LOGO, MKBACBO_PRUEBA, MKBACBO_OFICIAL)

## Project Setup

```sh
npm install
```

o con pnpm:

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### Comprobar que no existen dependencias de backend fuera de `src/api`

```sh
npm run check:no-backend
```

### Tests unitarios con [Vitest](https://vitest.dev/)

```sh
# Ejecutar una vez (CI)
npm test

# Modo watch durante el desarrollo
npm run test:watch

# Ejecutar con reporte de cobertura
npm run test:coverage
```

Los tests viven en `src/__tests__/` y cubren: `BacboproDashboard` (mount), `buildStreakColumns`/`historyGrid`, `dashboardMapper`/`useStats`, `dashboardStore` (Pinia) y `gameGenerator`.

## Checklist pre-commit

Ejecutar en este orden antes de commitear:

```sh
npm run check:no-backend   # sin dependencias de backend
npm run lint               # oxlint + eslint con autofix
npm run type-check         # vue-tsc
npm test                   # vitest (53 tests)
npm run test:coverage      # cobertura
npm run build              # type-check + build de producción
```
