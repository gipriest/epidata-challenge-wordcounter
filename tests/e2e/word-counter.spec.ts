import { test, expect } from '../../src/fixtures';
import cases from '../../src/data/texts.json';
import { countWords, randomWords } from '../../src/utils/text';

test.describe('Contador de palabras', () => {
  test('carga la página con contadores en cero', async ({ wordCounterPage, page }) => {
    await expect(page).toHaveTitle(/WordCounter/);
    await expect(wordCounterPage.textArea).toBeVisible();
    await expect(wordCounterPage.wordCount).toHaveText('0');
    await expect(wordCounterPage.characterCount).toHaveText('0');
  });

  for (const { name, text, words, characters } of cases) {
    test(`cuenta correctamente: ${name}`, async ({ wordCounterPage }) => {
      await wordCounterPage.typeText(text);
      await wordCounterPage.expectCounts({ words, characters });
    });
  }

  test('cuenta un texto aleatorio de 50 palabras', async ({ wordCounterPage }) => {
    const text = randomWords(50);
    await wordCounterPage.typeText(text);
    await wordCounterPage.expectCounts({ words: countWords(text), characters: text.length });
  });

  test('vuelve a cero al borrar el texto', async ({ wordCounterPage }) => {
    await wordCounterPage.typeText('algo de texto');
    await wordCounterPage.clear();
    await wordCounterPage.expectCounts({ words: 0, characters: 0 });
  });
});
