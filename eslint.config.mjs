import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      'node_modules',
      'playwright-report',
      'test-results',
      'blob-report',
      'summary-report',
      'allure-results',
      'allure-report',
    ],
  },
  ...tseslint.configs.recommended,
  {
    files: ['tests/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/expect-expect': [
        'warn',
        {
          assertFunctionNames: [
            'expectKeywordsMatchWordCount',
            'expectCounts',
            'expectWordCount',
            'expectCharacterCount',
            'expectTopKeywords',
          ],
        },
      ],
    },
  },
  prettier,
);
