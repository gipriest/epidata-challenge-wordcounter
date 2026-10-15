import 'dotenv/config';

const bool = (value: string | undefined, fallback: boolean): boolean =>
  value === undefined ? fallback : ['1', 'true', 'yes'].includes(value.toLowerCase());

/** Variables de entorno tipadas. Se pueden sobrescribir con un archivo .env */
export const env = {
  BASE_URL: process.env.BASE_URL ?? 'https://wordcounter.net',
  HEADLESS: bool(process.env.HEADLESS, true),
  CI: bool(process.env.CI, false),
} as const;
