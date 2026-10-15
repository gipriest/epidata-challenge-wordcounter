import { test } from '../../src/fixtures';
import { characterCases } from '../../src/data/cases';
import { longText } from '../../src/utils/text';

test.describe('Número de caracteres', () => {
  test('la página carga con el contador en cero', async ({ wordCounterPage }) => {
    await wordCounterPage.expectCharacterCount(0);
  });

  for (const { name, text, expected } of characterCases) {
    test(`cuenta caracteres: ${name}`, async ({ wordCounterPage }) => {
      await wordCounterPage.typeText(text);
      await wordCounterPage.expectCharacterCount(expected);
    });
  }

  test('se actualiza al agregar y al borrar texto', async ({ wordCounterPage }) => {
    await wordCounterPage.typeText('abc');
    await wordCounterPage.expectCharacterCount(3);
    await wordCounterPage.appendText(' de');
    await wordCounterPage.expectCharacterCount(6);
    await wordCounterPage.clear();
    await wordCounterPage.expectCharacterCount(0);
  });

  test('texto largo (1000 palabras) con separador de miles', async ({ wordCounterPage }) => {
    const text = longText(1000);
    await wordCounterPage.typeText(text);
    await wordCounterPage.expectCharacterCount(text.length);
  });

  test.describe('defectos detectados', { tag: '@defect' }, () => {
    test('un emoji cuenta como un solo caracter', async ({ wordCounterPage }) => {
      // 'Hola 👋 mundo 🌍' tiene 14 caracteres visibles; el sitio cuenta unidades UTF-16 (16).
      const text = 'Hola 👋 mundo 🌍';
      await wordCounterPage.typeText(text);
      await wordCounterPage.expectCharacterCount([...text].length);
    });
  });
});
