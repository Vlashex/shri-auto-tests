import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Drop .csv файл успешно загружает его', async ({ page }) => {
    await page.goto('/');

    const filePath = path.resolve(__dirname, '../tests/fixtures/test.csv');
    const dropzone = await page.getByTestId('dropzone');
    const input = await dropzone.locator('input[type="file"]');

    await dropzone.dispatchEvent('dragenter');
    await input.setInputFiles(filePath);

    await expect(page.getByText(/файл загружен!/i)).toBeVisible();
});
