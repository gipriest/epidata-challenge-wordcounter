import { defineConfig } from 'allure';

/** Configuración del reporte de Allure 3 (`npm run allure:generate` / `npm run allure:open`). */
export default defineConfig({
  name: 'wordcounter.net: pruebas automatizadas',
  output: './allure-report',
  plugins: {
    awesome: {
      options: {
        reportName: 'wordcounter.net: pruebas automatizadas',
        reportLanguage: 'es',
        // Reporte en carpeta (no un único HTML): los traces y screenshots quedan como archivos
        // aparte en lugar de incrustarse en base64, que generaba un HTML de cientos de MB.
        singleFile: false,
        groupBy: ['feature', 'story'],
      },
    },
  },
});
