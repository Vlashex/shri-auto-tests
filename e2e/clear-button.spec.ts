import { test, expect } from '@playwright/test';
import { AnalysisState } from '@store/analysis';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const csvPath = path.resolve(__dirname, '../tests/fixtures/test.csv');

declare global {
    interface Window {
        __APP_STATE__?: {
            getState: () => AnalysisState;
            clear: () => void;
        };
    }
}

test('Кнопка "Очистить" сбрасывает состояние страницы CSV Аналитик', async ({ page }) => {
    await page.goto('/');

    // Загружаем файл
    const dropzone = page.getByTestId('dropzone');
    await expect(dropzone).toBeVisible();
    const input = await dropzone.locator('input[type="file"]');
    await input.setInputFiles(csvPath);

    // Ожидаем появления кнопки "Отправить" и отправляем
    const submitButton = page.getByRole('button', { name: /отправить/i });
    await submitButton.click();

    // Ожидаем появления хайлайтов
    await expect(page.getByText(/общие расходы/i)).toBeVisible({ timeout: 5000 });

    // Убеждаемся, что кнопка "Очистить" появилась
    const clearButton = page.getByTestId('clear');
    await expect(clearButton).toBeVisible();

    // Кликаем "Очистить"
    await clearButton.click();

    // Проверяем, что хайлайтов больше нет
    await expect(page.getByText(/общие расходы/i)).not.toBeVisible();

    // Проверяем, что кнопка "Очистить" исчезла
    await expect(page.getByTestId('clear')).toHaveCount(0);

    // Проверяем, что снова отображается кнопка "Загрузить файл"
    await expect(page.getByTestId('upload-button')).toBeVisible();

    // Проверка zustand состояния (если экспортирован window.debug)
    const analysisState = await page.evaluate(() => window?.__APP_STATE__?.getState?.().highlights);
    expect(analysisState).toBeFalsy();
});
