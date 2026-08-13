# Mk-Frontend

Frontend de **MKBACBO**: dashboard oscuro de monitoreo de baccarat construido con Vue 3, TypeScript, Vite y Tailwind CSS. Sin backend: todos los datos son mock y la app se ejecuta de forma independiente.

## Rutas

- `/` — Dashboard MKBACBO
- `/legacy` — Dashboard previo en desarrollo

## Estructura de MKBACBO

- `src/views/BacboproDashboard.vue` — layout 12 columnas (main 9 / aside 3)
- `src/components/bacbopro/` — componentes (Header, StatusBadge, ToggleCard, KpiGrid, StreakBoard/StreakColumn, HistoryPanel/HistoryGrid, StatsBar, LastWinnerCard/WinnerIndicator, OperationCard)
- `src/mocks/bacbopro/` — datos mock (resultsData compartido por Tablero de Rachas e Historial, historyData, kpiData, operationData, winnerData)
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

### Comprobar que no existen dependencias de backend

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
