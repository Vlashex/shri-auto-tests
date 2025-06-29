import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('После нажатия "Отправить" приходят highlights и статус "готово!"', async ({ page }) => {
    await page.goto('/');

    const csvPath = path.resolve(__dirname, '../tests/fixtures/test.csv');
    const dropzone = page.getByTestId('dropzone');
    const input = await dropzone.locator('input[type="file"]');

    await input.setInputFiles(csvPath);

    const submitButton = page.getByRole('button', { name: /отправить/i });
    await submitButton.click();

    await expect(page.getByTestId('loader')).toBeVisible();

    await expect(page.getByText(/Общие расходы/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('loader')).not.toBeVisible();
    await expect(page.getByText(/готово!/i)).toBeVisible();
});
