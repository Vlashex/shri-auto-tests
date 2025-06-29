import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const csvPath = path.resolve(__dirname, '../tests/fixtures/test.csv');

test('CSV загружается, отправляется по кнопке и отображается как highlights', async ({ page }) => {
    await page.goto('/');

    // Находим dropzone и загружаем файл
    const dropzone = page.getByTestId('dropzone');
    await expect(dropzone).toBeVisible();

    const input = await dropzone.locator('input[type="file"]');
    await input.setInputFiles(csvPath);

    // Ждём появления кнопки "Отправить"
    const submitButton = page.getByRole('button', { name: /отправить/i });
    await expect(submitButton).toBeVisible();

    await submitButton.click();

    await expect(page.getByTestId('loader')).toBeVisible();

    // Проверяем, что приходят стримингово highlights
    await expect(page.getByText(/Общие расходы/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Общие расходы/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Общие расходы/i)).toBeVisible({ timeout: 5000 });

    // Проверяем финальный статус
    await expect(page.getByText(/готово!/i)).toBeVisible();
});
