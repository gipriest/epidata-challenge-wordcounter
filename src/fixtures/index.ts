import { test as base } from '@playwright/test';
import { env } from '../config/env';
import { WordCounterPage } from '../pages/WordCounterPage';

type Pages = {
  wordCounterPage: WordCounterPage;
};

/** Hosts que el sitio necesita para funcionar. El resto es publicidad, consentimiento y analytics. */
const ALLOWED_HOSTS = ['wordcounter.net', 'cdnjs.cloudflare.com'];

const isAllowed = (url: string): boolean => {
  const { protocol, hostname } = new URL(url);
  if (protocol === 'data:' || protocol === 'blob:') return true;
  return ALLOWED_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`));
};

/** `test` extendido: inyecta los Page Objects ya navegados. */
export const test = base.extend<Pages>({
  page: async ({ page }, use) => {
    // Los anuncios y el banner de consentimiento no son parte de lo que se prueba y vuelven
    // lenta e inestable la suite. Bloquearlos no cambia ninguna configuración del sitio.
    if (env.BLOCK_THIRD_PARTY) {
      await page.route('**/*', (route) =>
        isAllowed(route.request().url()) ? route.continue() : route.abort(),
      );
    }
    await use(page);
  },

  wordCounterPage: async ({ page }, use) => {
    const wordCounterPage = new WordCounterPage(page);
    await wordCounterPage.goto();
    await use(wordCounterPage);
  },
});

export { expect } from '@playwright/test';
