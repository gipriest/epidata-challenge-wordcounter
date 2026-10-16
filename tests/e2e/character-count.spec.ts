import { test } from '../../src/fixtures';
import { characterCases } from '../../src/data/cases';
import { allureMeta, Story } from '../../src/utils/allure';
import { longText } from '../../src/utils/text';

const FEATURE = 'Número de caracteres';

test.describe(FEATURE, () => {
  test('la página carga con el contador en cero', async ({ wordCounterPage }) => {
    await allureMeta(FEATURE, Story.INITIAL_STATE);
    await wordCounterPage.expectCharacterCount(0);
  });

  for (const { name, text, expected } of characterCases) {
    test(`cuenta caracteres: ${name}`, async ({ wordCounterPage }) => {
      await allureMeta(FEATURE, Story.CURATED_CASES, { Texto: text, Esperado: expected });
      await wordCounterPage.typeText(text);
      await wordCounterPage.expectCharacterCount(expected);
    });
  }

  test('se actualiza al agregar y al borrar texto', async ({ wordCounterPage }) => {
    await allureMeta(FEATURE, Story.LIVE_UPDATE);
    await wordCounterPage.typeText('abc');
    await wordCounterPage.expectCharacterCount(3);
    await wordCounterPage.appendText(' de');
    await wordCounterPage.expectCharacterCount(6);
    await wordCounterPage.clear();
    await wordCounterPage.expectCharacterCount(0);
  });

  test('texto largo (1000 palabras) con separador de miles', async ({ wordCounterPage }) => {
    await allureMeta(FEATURE, Story.VOLUME);
    const text = longText(1000);
    await wordCounterPage.typeText(text);
    await wordCounterPage.expectCharacterCount(text.length);
  });
});
