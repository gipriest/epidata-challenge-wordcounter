# epidata-challenge-wordcounter

Suite de pruebas automatizadas con **Playwright + TypeScript** que valida que [wordcounter.net](https://wordcounter.net) muestre correctamente:

1. el **número de palabras**,
2. el **número de caracteres**,
3. las **3 palabras más repetidas** con su cantidad (sección **Keyword Density**).

Los resultados se reportan con **[Allure](https://allurereport.org/)**: cuántos escenarios se ejecutaron, pasaron y fallaron, con la descripción del error, steps y evidencia de cada uno.

## Cómo ejecutarlo

### Requisitos

- [Node.js](https://nodejs.org/) 20 o superior (probado con 24)
- Conexión a internet (las pruebas corren contra el sitio real)

### Instalación

```bash
git clone https://github.com/gipriest/epidata-challenge-wordcounter.git
cd epidata-challenge-wordcounter
npm install
npx playwright install chromium
```

> En Linux puede hacer falta `npx playwright install --with-deps chromium` para instalar las dependencias del sistema.

### Correr las pruebas

```bash
npm test
```

Corre todos los escenarios en Chromium (más un smoke test HTTP). Al final se imprime el resumen en consola:

```
Resumen: 54 ejecutados · 51 pasaron · 3 fallaron
```

Los 3 fallos son **defectos reales del sitio** (ver [Defectos encontrados](#defectos-encontrados)), no errores de la suite.

### Ver el reporte de Allure

```bash
npm run allure:generate
npm run allure:open
```

`allure:generate` arma el reporte en `allure-report/` y `allure:open` lo sirve en el navegador (hace falta servirlo: abrir el `index.html` con doble clic no funciona). `npm run allure:serve` hace los dos pasos en uno. Usa Allure 3, que viene como dependencia npm: **no hace falta instalar Java ni nada global**.

| Comando                      | Qué hace                                                                    |
| ---------------------------- | --------------------------------------------------------------------------- |
| `npm test`                   | Suite completa (Chromium + API)                                             |
| `npm run test:stable`        | Excluye los escenarios que documentan defectos (`@defect`): todo debe pasar |
| `npm run test:defects`       | Solo los escenarios que documentan defectos                                 |
| `npm run test:all`           | Suite completa en Chromium, Firefox, WebKit y mobile                        |
| `npm run test:headed`        | Chromium con el navegador visible                                           |
| `npm run test:ui`            | Modo UI interactivo de Playwright                                           |
| `npm run allure:generate`    | Genera el reporte de Allure a partir de `allure-results/`                   |
| `npm run allure:open`        | Abre el reporte de Allure generado                                          |
| `npm run allure:serve`       | Genera y abre el reporte de Allure en un paso, sin guardarlo                |
| `npm run report`             | Abre el reporte HTML nativo de Playwright                                   |
| `npm run lint` / `typecheck` | Calidad de código                                                           |

Variables de entorno opcionales (ver `.env.example`):

| Variable            | Default                   | Uso                                                                       |
| ------------------- | ------------------------- | ------------------------------------------------------------------------- |
| `BASE_URL`          | `https://wordcounter.net` | Sitio bajo prueba                                                         |
| `HEADLESS`          | `true`                    | `false` para ver el navegador                                             |
| `BLOCK_THIRD_PARTY` | `true`                    | Bloquea publicidad, banner de consentimiento y analytics (ver Decisiones) |
| `SEED`              | aleatoria                 | Semilla del escenario con texto aleatorio, para reproducirlo              |

## Reportes

### Allure (reporte principal)

Lo genera [`allure-playwright`](https://www.npmjs.com/package/allure-playwright) y se arma con Allure 3 ([`allurerc.mjs`](allurerc.mjs)). Incluye:

- **Resumen**: total de escenarios ejecutados, pasados, fallidos y rotos, con gráficos.
- **Descripción del error** de cada fallo, con el diff entre lo esperado y lo obtenido.
- **Agrupación** por funcionalidad (Palabras / Caracteres / Keyword Density) y por historia (casos curados, actualización al editar, consistencia, defectos conocidos).
- **Steps legibles** de cada escenario ("Escribir el texto…", "Verificar que el número de palabras sea 3"), los **parámetros** del caso (texto y valor esperado), la **severidad** y la etiqueta `@defect`.
- **Evidencia**: screenshot y trace de Playwright en cada fallo, y lo que mostraba el panel de Keyword Density en cada verificación del top 3.
- **Categorías** de fallos: defectos del sitio, resultado distinto al esperado y problemas de infraestructura (timeouts). Así se distingue un bug del sitio de un problema de red.
- **Entorno**: URL bajo prueba, bloqueo de terceros, versión de Node y sistema operativo.

Los resultados crudos van a `allure-results/` y se limpian al empezar cada ejecución ([`global-setup.ts`](src/config/global-setup.ts)), para que el reporte refleje solo la última corrida.

### Otros reportes

| Archivo                        | Contenido                                                                                                               |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `summary-report/summary.html`  | Resumen liviano propio (ejecutados / pasaron / fallaron con el error). En CI se publica en la pestaña _Summary_ del job |
| `playwright-report/index.html` | Reporte HTML nativo de Playwright                                                                                       |
| `test-results/junit.xml`       | JUnit, para integrarlo con otras herramientas de CI                                                                     |

En CI hay reintentos: un test que falla y pasa al reintentar se marca como **inestable** (_flaky_), no como pasado.

## Escenarios

54 escenarios en total.

| Área                     | Escenarios                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Palabras** (20)        | carga en cero · texto vacío · solo espacios · una palabra · frase · espacios múltiples · espacios al inicio y al final · saltos de línea · tabs · puntuación pegada o separada · solo puntuación · guiones · contracciones · números · acentos · alfabetos no latinos · tipeo tecla por tecla · se actualiza al agregar y al borrar · texto de 1000 palabras (separador de miles)                        |
| **Caracteres** (15)      | carga en cero · vacío · solo espacios · palabra · espacios · espacios múltiples y en los bordes · puntuación · acentos · tabs · los saltos de línea (LF y CRLF) no cuentan · se actualiza al editar · 1000 palabras                                                                                                                                                                                      |
| **Keyword Density** (18) | configuración por defecto (modo x1) · top 3 con frecuencias distintas · no distingue mayúsculas · excluye stop words · ignora la puntuación · palabras con guion · acentos · empate total · empate en el 3er puesto · menos de 3 palabras distintas · texto vacío · texto aleatorio con top 3 conocido · se actualiza al editar · consistencia con el contador de palabras (2 casos OK + **3 defectos**) |
| **API** (1)              | smoke test: la home responde 200                                                                                                                                                                                                                                                                                                                                                                         |

Los datos de cada caso y su resultado esperado están en [`src/data/cases.ts`](src/data/cases.ts). Los esperados **se calcularon a mano** a partir de los supuestos de abajo, no copiando lo que muestra el sitio. Si no, la prueba no validaría nada.

## Supuestos

No modifiqué ninguna configuración del sitio. Las reglas que tomé como "correctas" son estas:

**Palabras**

- Una palabra es una secuencia de caracteres separada por espacios, tabs o saltos de línea.
- La puntuación suelta (`,` `!` `...`) no es una palabra.
- `well-known` y `state-of-the-art` cuentan como 1 palabra; `don't` también.
- Los números (`2026`, `3.14`, `1,000`) cuentan como palabras.
- Los acentos, la `ñ` y los alfabetos no latinos se cuentan igual que el resto.

**Caracteres**

- Se valida el contador principal ("Characters"), que **incluye espacios**.
- Los espacios, tabs y la puntuación cuentan. **Los saltos de línea no cuentan** (es el comportamiento del sitio y lo tomo como regla de negocio).

**Keyword Density** (con la configuración por defecto: modo **x1**, top 10)

- Se excluyen las _stop words_ del sitio (`the`, `and`, `of`, pronombres, etc.). Las "3 más repetidas" son las que quedan **después** de excluirlas.
- No distingue mayúsculas (`Apple` = `apple`) y la puntuación pegada no forma parte de la palabra.
- **Empates**: se ordenan por primera aparición en el texto.
- Si hay menos de 3 palabras distintas, se muestran las que haya.
- Se valida la palabra y la cantidad. El porcentaje no se valida (no lo pide el enunciado).
- Si un texto no tiene stop words y tiene menos de 10 palabras distintas, la suma de Keyword Density tiene que ser igual al contador de palabras. Si no, los dos componentes del mismo sitio separan las palabras distinto.

**Alcance**

- Navegador de referencia: Chromium (desktop). La suite también corre en Firefox, WebKit y mobile (`npm run test:all`), pero no está dentro del alcance pedido.
- Textos de prueba en inglés, más casos puntuales con acentos y alfabetos no latinos.

## Defectos encontrados

Los escenarios con la etiqueta `@defect` fallan a propósito: validan el comportamiento esperado y el sitio no lo cumple.

> 📄 **Reporte completo de bugs**, con pasos para reproducir, severidad, evidencia y causa probable: [`docs/BUG_REPORT.md`](docs/BUG_REPORT.md) (también en Word: [`docs/BUG_REPORT.docx`](docs/BUG_REPORT.docx)).

| #   | Defecto                                                                                      | Ejemplo                                    | Esperado                | Actual                                        |
| --- | -------------------------------------------------------------------------------------------- | ------------------------------------------ | ----------------------- | --------------------------------------------- |
| 1   | La puntuación sin espacios se separa distinto en el contador y en Keyword Density            | `one.two,three;four`                       | igual cantidad en ambos | 3 palabras vs. 4 keywords                     |
| 2   | El espacio de no separación (NBSP) separa palabras en el contador pero no en Keyword Density | `word⍽word` (NBSP)                         | `word` ×2               | 2 palabras, pero la keyword es `word word` ×1 |
| 3   | URLs y emails: el contador los toma como 1 palabra y Keyword Density los parte               | `https://wordcounter.net test@example.com` | igual cantidad en ambos | 3 palabras vs. 6 keywords                     |

Otras observaciones (no las tomé como defecto):

- La lista de stop words por defecto incluye palabras poco obvias, como `ruby` o `river`.
- Los números se cuentan como palabras pero no aparecen en Keyword Density.

## Decisiones técnicas

- **Page Object Model** ([`WordCounterPage`](src/pages/WordCounterPage.ts)) y un fixture que entrega la página ya cargada.
- **El texto se ingresa como lo haría un usuario: pegándolo.** El editor del sitio recalcula los contadores con eventos de teclado, `paste` y `focus`, pero **no** con `input`. Por eso `fill()` de Playwright (que solo dispara `input`) funcionaba de casualidad la primera vez y dejaba el contador en 0 en las siguientes. El Page Object selecciona todo (`Ctrl+A`) y dispara un evento `paste` real con el texto. Para borrar usa `Ctrl+A` + `Backspace`, y para el tipeo usa teclas reales.
- **Esperar a que el editor esté listo.** Antes de interactuar se espera a que el handler de `paste` del editor esté enganchado. Si no, el primer cambio puede perderse.
- **Aserciones que reintentan.** El sitio actualiza los contadores con un pequeño retardo, así que se usan `toHaveText` y `expect.poll` en vez de `waitForTimeout`.
- **Bloqueo de terceros** (`BLOCK_THIRD_PARTY`). El sitio carga Google Ads, un banner de consentimiento (Funding Choices), Facebook, Twitter y Analytics. No son parte de lo que se prueba y hacían la suite 3 veces más lenta e inestable. Bloquear esas requests **no modifica ninguna configuración del sitio**. Con `BLOCK_THIRD_PARTY=false` corre con todo cargado.
- **Pocos workers** (4 local, 2 en CI): es un sitio de terceros y no conviene saturarlo.
- **Texto aleatorio reproducible.** Un escenario genera un texto con Faker y un top 3 conocido. La semilla aparece como parámetro en Allure y se puede repetir con `SEED=<n> npm test`.
- **Allure 3** (paquete npm `allure`) en lugar de Allure 2: genera el mismo tipo de reporte pero corre sobre Node, así que quien clone el repo no necesita instalar Java.

## Estructura

```
├── playwright.config.ts           # Proyectos, reporters (Allure incluido), timeouts
├── allurerc.mjs                   # Configuración del reporte de Allure
├── src/
│   ├── config/env.ts              # Variables de entorno tipadas
│   ├── config/global-setup.ts     # Limpia allure-results antes de cada corrida
│   ├── data/cases.ts              # Casos de prueba y resultados esperados
│   ├── fixtures/index.ts          # `test` extendido: bloqueo de terceros + Page Object navegado
│   ├── pages/                     # Page Object Model
│   ├── reporters/summary-reporter.ts  # Reporte resumen (HTML / Markdown / JSON)
│   ├── utils/allure.ts            # Labels de Allure (feature, story, severidad, parámetros)
│   └── utils/text.ts              # Generación de textos de prueba
├── tests/
│   ├── e2e/word-count.spec.ts
│   ├── e2e/character-count.spec.ts
│   ├── e2e/keyword-density.spec.ts
│   └── api/health.spec.ts
└── .github/workflows/playwright.yml   # CI: lint, typecheck, pruebas y reportes como artefacto
```

## CI

GitHub Actions corre lint, typecheck y la suite en cada push o PR a `main`, y después genera el reporte de Allure. El resumen aparece en la pestaña **Summary** del job, y todos los reportes (Allure incluido) se descargan como artefacto `reportes`.
