import { expect, type Locator, type Page } from '@playwright/test';
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

  /** Navega y espera a que el script del editor esté inicializado (si no, los primeros cambios se pierden). */
  override async goto(): Promise<void> {
    await this.page.goto(this.path, { waitUntil: 'load' });
    await this.page.waitForFunction(() => 'editor' in window);
    await expect(this.textArea).toBeEditable();
  }

  /** Reemplaza el contenido del editor (equivale a pegar el texto). */
  async typeText(text: string): Promise<void> {
    await this.textArea.fill(text);
  }

  /** Tipea tecla por tecla, como lo haría un usuario. */
  async typeSequentially(text: string): Promise<void> {
    await this.textArea.pressSequentially(text, { delay: 10 });
  }

  async appendText(text: string): Promise<void> {
    await this.textArea.press('End');
    await this.textArea.pressSequentially(text);
  }

  async clear(): Promise<void> {
    await this.textArea.fill('');
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
    await expect(this.wordCount, 'Número de palabras').toHaveText(formatCount(words));
  }

  async expectCharacterCount(characters: number): Promise<void> {
    await expect(this.characterCount, 'Número de caracteres').toHaveText(formatCount(characters));
  }

  async expectCounts({ words, characters }: { words: number; characters: number }): Promise<void> {
    await this.expectWordCount(words);
    await this.expectCharacterCount(characters);
  }

  async expectTopKeywords(expected: Keyword[]): Promise<void> {
    await expect
      .poll(() => this.getTopKeywords(3), { message: 'Top 3 de Keyword Density' })
      .toEqual(expected);
  }
}

/** El sitio muestra los números con separador de miles en inglés (1,000). */
export const formatCount = (n: number): string => n.toLocaleString('en-US');
