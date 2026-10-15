import { type Locator, type Page } from '@playwright/test';

/** Comportamiento común a todas las páginas. */
export abstract class BasePage {
  protected abstract readonly path: string;

  constructor(protected readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto(this.path, { waitUntil: 'domcontentloaded' });
  }

  async title(): Promise<string> {
    return this.page.title();
  }

  protected async numberFrom(locator: Locator): Promise<number> {
    const text = (await locator.textContent())?.replace(/[^\d]/g, '') ?? '';
    return Number(text);
  }
}
