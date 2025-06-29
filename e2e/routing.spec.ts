import { test, expect } from '@playwright/test';

test.describe('Навигация по приложению', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('Переход между /, /generate и /history работает корректно', async ({ page }) => {
        await expect(page.getByText(/загрузите csv файл/i)).toBeVisible();

        await page.getByRole('link', { name: /csv генератор/i }).click();
        await expect(page).toHaveURL(/\/generate/);
        await expect(page.getByText(/Сгенерируйте готовый csv-файл/i)).toBeVisible();

        await page.getByRole('link', { name: /история/i }).click();
        await expect(page).toHaveURL(/\/history/);
        await expect(page.getByText(/Сгенерировать больше/i, { exact: false })).toBeVisible();

        await page.getByRole('link', { name: /csv аналитик/i }).click();
        await expect(page).toHaveURL('/');
        await expect(page.getByText(/загрузите csv файл/i)).toBeVisible();
    });
});
