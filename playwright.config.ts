import { defineConfig, devices } from '@playwright/test';
import { env } from './src/config/env';

/**
 * Configuración de Playwright.
 * Docs: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: env.CI,
  retries: env.CI ? 1 : 0,
  // Es un sitio externo: pocos workers para no saturarlo ni recibir rate limiting.
  workers: env.CI ? 2 : 4,
  timeout: 45_000,
  expect: { timeout: 7_000 },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['./src/reporters/summary-reporter.ts', { outputDir: 'summary-report' }],
  ],
  use: {
    baseURL: env.BASE_URL,
    headless: env.HEADLESS,
    testIdAttribute: 'data-testid',
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    locale: 'es-AR',
    timezoneId: 'America/Argentina/Buenos_Aires',
  },
  projects: [
    { name: 'api', testDir: './tests/api' },
    { name: 'chromium', testDir: './tests/e2e', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', testDir: './tests/e2e', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', testDir: './tests/e2e', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', testDir: './tests/e2e', use: { ...devices['Pixel 7'] } },
  ],
});
