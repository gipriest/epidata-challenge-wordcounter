import { test, expect } from '../../src/fixtures';
import { wordCases } from '../../src/data/cases';
import { countWords, longText } from '../../src/utils/text';

test.describe('Número de palabras', () => {
  test('la página carga con el contador en cero', async ({ wordCounterPage, page }) => {
    await expect(page).toHaveTitle(/WordCounter/);
    await expect(wordCounterPage.textArea).toBeVisible();
    await wordCounterPage.expectWordCount(0);
  });

  for (const { name, text, expected } of wordCases) {
    test(`cuenta palabras: ${name}`, async ({ wordCounterPage }) => {
      await wordCounterPage.typeText(text);
      await wordCounterPage.expectWordCount(expected);
    });
  }

  test('cuenta palabras al tipear tecla por tecla', async ({ wordCounterPage }) => {
    await wordCounterPage.typeSequentially('Typing works fine fine');
    await wordCounterPage.expectWordCount(4);
  });

  test('se actualiza al agregar y al borrar texto', async ({ wordCounterPage }) => {
    await wordCounterPage.typeText('one two three');
    await wordCounterPage.expectWordCount(3);
    await wordCounterPage.appendText(' four five');
    await wordCounterPage.expectWordCount(5);
    await wordCounterPage.clear();
    await wordCounterPage.expectWordCount(0);
  });

  test('texto largo (1000 palabras) con separador de miles', async ({ wordCounterPage }) => {
    const text = longText(1000);
    await wordCounterPage.typeText(text);
    await wordCounterPage.expectWordCount(countWords(text));
  });
});
