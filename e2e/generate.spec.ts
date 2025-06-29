import { test, expect } from '@playwright/test';

test.describe('GeneratePage', () => {
    test.use({ acceptDownloads: true });

    test('скачивание CSV-файла работает корректно', async ({ page }) => {
        await page.goto('/generate'); // или '/', если страница — корневая

        // Находим и нажимаем кнопку генерации
        const generateButton = page.getByRole('button', { name: /начать генерацию/i });
        await expect(generateButton).toBeVisible();

        // Ожидаем начало скачивания
        const [download] = await Promise.all([page.waitForEvent('download'), generateButton.click()]);

        // Проверяем имя файла
        const suggestedFilename = download.suggestedFilename();
        expect(suggestedFilename).toMatch(/\.csv$/);

        // Проверяем, что файл действительно существует
        const filePath = await download.path();
        expect(filePath).toBeTruthy();
    });
});
