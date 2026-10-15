import { test, expect } from '../../src/fixtures';
import { consistencyCases, consistencyDefectCases, keywordCases } from '../../src/data/cases';
import type { WordCounterPage } from '../../src/pages/WordCounterPage';
import { textWithKnownTopKeywords } from '../../src/utils/text';

test.describe('Keyword Density: las 3 palabras más repetidas', () => {
  test('usa la configuración por defecto (modo x1)', async ({ wordCounterPage }) => {
    await expect(wordCounterPage.keywordModeX1).toHaveClass(/active_consecutive/);
  });

  for (const { name, text, expected } of keywordCases) {
    test(`top 3: ${name}`, async ({ wordCounterPage }) => {
      await wordCounterPage.typeText(text);
      await wordCounterPage.expectTopKeywords(expected);
    });
  }

  test('top 3 de un texto aleatorio con frecuencias conocidas', async ({ wordCounterPage }, testInfo) => {
    const seed = Number(process.env.SEED ?? Date.now());
    testInfo.annotations.push({ type: 'seed', description: String(seed) });
    const { text, top, words } = textWithKnownTopKeywords(seed);

    await wordCounterPage.typeText(text);
    await wordCounterPage.expectWordCount(words);
    await wordCounterPage.expectTopKeywords(top);
  });

  test('se actualiza al editar el texto', async ({ wordCounterPage }) => {
    await wordCounterPage.typeText('apple apple banana cherry');
    await wordCounterPage.expectTopKeywords([
      { word: 'apple', count: 2 },
      { word: 'banana', count: 1 },
      { word: 'cherry', count: 1 },
    ]);
    await wordCounterPage.appendText(' cherry cherry banana');
    await wordCounterPage.expectTopKeywords([
      { word: 'cherry', count: 3 },
      { word: 'apple', count: 2 },
      { word: 'banana', count: 2 },
    ]);
  });

  for (const { name, text } of consistencyCases) {
    test(`coincide con el contador de palabras: ${name}`, async ({ wordCounterPage }) => {
      await expectKeywordsMatchWordCount(wordCounterPage, text);
    });
  }

  test.describe('defectos detectados', { tag: '@defect' }, () => {
    for (const { name, text } of consistencyDefectCases) {
      test(`coincide con el contador de palabras: ${name}`, async ({ wordCounterPage }) => {
        await expectKeywordsMatchWordCount(wordCounterPage, text);
      });
    }
  });
});

/**
 * En textos sin stop words y con menos de 10 palabras distintas (el máximo que muestra el panel),
 * la suma de Keyword Density tiene que ser igual al contador de palabras.
 */
async function expectKeywordsMatchWordCount(wordCounterPage: WordCounterPage, text: string): Promise<void> {
  await wordCounterPage.typeText(text);
  await expect(wordCounterPage.keywordRows.first()).toBeVisible();
  const words = await wordCounterPage.getWordCount();
  await expect
    .poll(async () => (await wordCounterPage.getKeywords()).reduce((sum, k) => sum + k.count, 0), {
      message: `La suma de Keyword Density debería ser igual al contador de palabras (${words})`,
    })
    .toBe(words);
}
