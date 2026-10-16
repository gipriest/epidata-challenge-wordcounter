import { test, expect } from '@playwright/test';
import { allureMeta, Story } from '../../src/utils/allure';

test.describe('Salud del sitio', () => {
  test('la home responde 200 con HTML', async ({ request }) => {
    await allureMeta('Disponibilidad', Story.INITIAL_STATE);
    const response = await request.get('/');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/html');
  });
});
