# epidata-challenge-wordcounter

Framework de pruebas E2E con **Playwright + TypeScript** para [wordcounter.net](https://wordcounter.net).

## Requisitos

- Node.js 20+ (probado con 24)

## Instalación

```bash
npm install
npx playwright install --with-deps
cp .env.example .env   # opcional
```

## Estructura

```
├── playwright.config.ts     # Config: proyectos (api, chromium, firefox, webkit, mobile), reporters, traces
├── src/
│   ├── config/env.ts        # Variables de entorno tipadas (BASE_URL, HEADLESS, CI)
│   ├── pages/               # Page Object Model (BasePage + WordCounterPage)
│   ├── fixtures/index.ts    # `test` extendido que inyecta los Page Objects
│   ├── data/texts.json      # Casos data-driven
│   └── utils/text.ts        # Helpers y generación de datos con Faker
├── tests/
│   ├── e2e/                 # Pruebas de UI
│   └── api/                 # Pruebas HTTP con `request`
└── .github/workflows/       # CI en GitHub Actions
```

## Scripts

| Comando                 | Descripción                     |
| ----------------------- | ------------------------------- |
| `npm test`              | Corre todos los proyectos       |
| `npm run test:chromium` | Solo Chromium                   |
| `npm run test:api`      | Solo pruebas de API             |
| `npm run test:headed`   | Chromium con navegador visible  |
| `npm run test:ui`       | Modo UI interactivo             |
| `npm run test:debug`    | Inspector de Playwright         |
| `npm run report`        | Abre el reporte HTML            |
| `npm run codegen`       | Graba pasos contra el sitio     |
| `npm run typecheck`     | Chequeo de tipos                |
| `npm run lint`          | ESLint (+ reglas de Playwright) |
| `npm run format`        | Prettier                        |

## Reportes

HTML en `playwright-report/`, y JUnit/JSON en `test-results/`. Ante un fallo se guardan trace, screenshot y video.
