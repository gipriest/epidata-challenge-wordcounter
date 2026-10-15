import { test, expect } from '@playwright/test';

test.describe('Salud del sitio', () => {
  test('la home responde 200 con HTML', async ({ request }) => {
    const response = await request.get('/');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/html');
  });
});
