# Tareas

Backlog de tareas pendientes y completadas del proyecto.

## Pendientes

- [ ] Tests para `useGameSimulation.ts`
- [ ] Tests de componentes individuales de `src/components/dashboard/`
- [ ] Tests de componentes individuales de `src/components/bacbopro/`
- [ ] Umbral de cobertura en `vitest.config.ts` (p. ej. `coverage.thresholds`)
- [ ] CI (GitHub Actions) que ejecute el checklist pre-commit
- [ ] Confirmar shape exacto de `SummaryReportResult` en `POST /admin/reports` (tipado conservador actual: `Record<string, unknown>`)
- [ ] Sin URL de backend estable: validar en vivo contra un despliegue real (CORS, SSE y API key)

## Completadas

- [x] [2026-08-14] Integración completa de la API MKBOT en MKBACBO: cliente HTTP + SSE (fetch nativo), tipos de contrato, endpoints, mapper, store por canal y UI con estados loading/error/empty
- [x] [2026-08-14] Tests de la capa API (144 tests): client, sse, endpoints, mapper, store y dashboard integrado
- [x] [2026-08-14] Stats sobre Tablero de Rachas con ÚLTIMAS 200/50 y tablero de jugadas a ancho completo
- [x] [2026-08-14] Tema neón semántico: tokens centralizados, glow controlado y fondo negro unificado
- [x] [2026-08-14] Front responsive en cualquier pantalla con márgenes y layout 100vh (ambos dashboards)
- [x] [2026-08-12] Dashboards MKBACBO y Baccarat con mocks y sin backend
- [x] [2026-08-12] Suite de tests Vitest (53 tests)
- [x] [2026-08-12] Script `check:no-backend` y gates de calidad documentados en README
- [x] [2026-08-12] Soporte de cobertura con `@vitest/coverage-v8`
