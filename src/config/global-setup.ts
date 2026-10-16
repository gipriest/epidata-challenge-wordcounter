import { rmSync } from 'node:fs';

/** Corre una vez antes de la suite: borra los resultados de Allure de la ejecución anterior. */
export default function globalSetup(): void {
  rmSync('allure-results', { recursive: true, force: true });
}
