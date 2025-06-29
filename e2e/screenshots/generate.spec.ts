import { test, expect } from '@playwright/test';

test.describe('📸 /generate visual tests', () => {
    test('default state renders correctly', async ({ page }) => {
        await page.goto('/generate');

        // Ждём, пока не исчезнет лоадер (если он есть)
        await expect(page.locator('[data-testid=loader]'))
            .toHaveCount(0, { timeout: 5000 })
            .catch(() => {});

        // Скриншот всей страницы
        await expect(page).toHaveScreenshot('generate-default.png');
    });
});
