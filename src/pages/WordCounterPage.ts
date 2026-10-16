import { expect, test, type Locator, type Page } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { BasePage } from './BasePage';

export type Keyword = { word: string; count: number };

/** Page Object de https://wordcounter.net */
export class WordCounterPage extends BasePage {
  protected readonly path = '/';

  readonly textArea: Locator;
  readonly wordCount: Locator;
  readonly characterCount: Locator;
  readonly keywordRows: Locator;
  readonly keywordModeX1: Locator;

  constructor(page: Page) {
    super(page);
    this.textArea = page.locator('#box');
    this.wordCount = page.locator('#word_count');
    this.characterCount = page.locator('#character_count');
    this.keywordRows = page.locator('#kwd-accordion-data a.list-group-item');
    this.keywordModeX1 = page.locator('#consecutive-1-link');
  }

  /**
   * Navega y espera a que el editor tenga sus handlers enganchados.
   * El sitio recalcula con eventos de teclado, `paste` y `focus` (no con `input`), así que
   * si se interactúa antes de que existan esos handlers el cambio no se cuenta.
   */
  override async goto(): Promise<void> {
    await this.page.goto(this.path, { waitUntil: 'load' });
    await this.page.waitForFunction(() => {
      const $ = (
        window as unknown as { jQuery?: { _data: (el: Element, key: string) => Record<string, unknown> } }
      ).jQuery;
      const box = document.querySelector('#box');
      return Boolean($ && box && $._data(box, 'events')?.paste);
    });
    await expect(this.textArea).toBeEditable();
  }

  /**
   * Reemplaza el contenido del editor pegando el texto, como un usuario con Ctrl+A y Ctrl+V.
   * No se usa `fill()`: dispara solo `input`, que el sitio no escucha, y el contador no se actualiza.
   */
  async typeText(text: string): Promise<void> {
    await step(`Pegar el texto ${preview(text)}`, async () => {
      await this.selectAll();
      await this.textArea.evaluate((box, value) => {
        const data = new DataTransfer();
        data.setData('text/plain', value);
        box.dispatchEvent(
          new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }),
        );
      }, text);
    });
  }

  /** Tipea tecla por tecla, como lo haría un usuario. */
  async typeSequentially(text: string): Promise<void> {
    await step(`Tipear tecla por tecla ${preview(text)}`, () =>
      this.textArea.pressSequentially(text, { delay: 10 }),
    );
  }

  async appendText(text: string): Promise<void> {
    await step(`Agregar al final ${preview(text)}`, async () => {
      await this.textArea.press('ControlOrMeta+End');
      await this.textArea.pressSequentially(text);
    });
  }

  async clear(): Promise<void> {
    await step('Borrar todo el texto', async () => {
      await this.selectAll();
      await this.textArea.press('Backspace');
    });
  }

  private async selectAll(): Promise<void> {
    await this.textArea.click();
    await this.textArea.press('ControlOrMeta+A');
  }

  async getWordCount(): Promise<number> {
    return this.numberFrom(this.wordCount);
  }

  async getCharacterCount(): Promise<number> {
    return this.numberFrom(this.characterCount);
  }

  /** Lista completa de Keyword Density tal como la muestra el sitio (orden incluido). */
  async getKeywords(): Promise<Keyword[]> {
    const rows = await this.keywordRows.evaluateAll((items) =>
      items.map((item) => ({
        word: item.querySelector('.word')?.textContent ?? '',
        badge: item.querySelector('.badge')?.textContent ?? '',
      })),
    );
    // El badge tiene el formato " 4 (33%)": nos quedamos con la cantidad.
    return rows.map(({ word, badge }) => ({
      word: word.trim(),
      count: Number(badge.trim().split(' ')[0].replace(/,/g, '')),
    }));
  }

  async getTopKeywords(n = 3): Promise<Keyword[]> {
    return (await this.getKeywords()).slice(0, n);
  }

  /** El sitio actualiza los contadores con debounce: estas aserciones reintentan hasta que coinciden. */
  async expectWordCount(words: number): Promise<void> {
    await step(`Verificar que el número de palabras sea ${formatCount(words)}`, () =>
      expect(this.wordCount, 'Número de palabras').toHaveText(formatCount(words)),
    );
  }

  async expectCharacterCount(characters: number): Promise<void> {
    await step(`Verificar que el número de caracteres sea ${formatCount(characters)}`, () =>
      expect(this.characterCount, 'Número de caracteres').toHaveText(formatCount(characters)),
    );
  }

  async expectCounts({ words, characters }: { words: number; characters: number }): Promise<void> {
    await this.expectWordCount(words);
    await this.expectCharacterCount(characters);
  }

  async expectTopKeywords(expected: Keyword[]): Promise<void> {
    const summary = expected.map((k) => `${k.word} (${k.count})`).join(', ') || 'vacío';
    await step(`Verificar el top 3 de Keyword Density: ${summary}`, async () => {
      try {
        await expect
          .poll(() => this.getTopKeywords(3), { message: 'Top 3 de Keyword Density' })
          .toEqual(expected);
      } finally {
        // Evidencia en el reporte: lo que mostraba el panel, haya pasado o no.
        await allure.attachment(
          'Keyword Density mostrado por el sitio',
          JSON.stringify(await this.getKeywords(), null, 2),
          'application/json',
        );
      }
    });
  }
}

/** El sitio muestra los números con separador de miles en inglés (1,000). */
export const formatCount = (n: number): string => n.toLocaleString('en-US');

/** Step visible en los reportes. `box` hace que el error apunte al test y no al Page Object. */
const step = <T>(title: string, body: () => Promise<T>): Promise<T> => test.step(title, body, { box: true });

/** Texto acotado y con los caracteres invisibles escapados, para los títulos de los steps. */
const preview = (text: string): string => {
  const shown = JSON.stringify(text);
  return shown.length > 60 ? `${shown.slice(0, 57)}…"` : shown;
};
