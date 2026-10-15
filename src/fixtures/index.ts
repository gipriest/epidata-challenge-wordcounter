import { test as base } from '@playwright/test';
import { WordCounterPage } from '../pages/WordCounterPage';

type Pages = {
  wordCounterPage: WordCounterPage;
};

/** `test` extendido: inyecta los Page Objects ya navegados. */
export const test = base.extend<Pages>({
  wordCounterPage: async ({ page }, use) => {
    const wordCounterPage = new WordCounterPage(page);
    await wordCounterPage.goto();
    await use(wordCounterPage);
  },
});

export { expect } from '@playwright/test';
