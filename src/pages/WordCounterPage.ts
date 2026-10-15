import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

/** Page Object de https://wordcounter.net */
export class WordCounterPage extends BasePage {
  protected readonly path = '/';

  readonly textArea: Locator;
  readonly wordCount: Locator;
  readonly characterCount: Locator;

  constructor(page: Page) {
    super(page);
    this.textArea = page.locator('#box');
    this.wordCount = page.locator('#word_count');
    this.characterCount = page.locator('#character_count');
  }

  async typeText(text: string): Promise<void> {
    await this.textArea.fill(text);
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

  async expectCounts({ words, characters }: { words: number; characters: number }): Promise<void> {
    await expect(this.wordCount).toHaveText(String(words));
    await expect(this.characterCount).toHaveText(String(characters));
  }
}
