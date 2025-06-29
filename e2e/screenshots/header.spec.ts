import { test, expect } from '@playwright/test';

test.describe('📸 Header visual', () => {
    test('renders correctly', async ({ page }) => {
        await page.goto('/'); // или любую страницу, где точно есть хедер

        const header = page.locator('[data-testid=header]'); // адаптируй селектор под себя

        // Убедимся, что он есть и видим
        await expect(header).toBeVisible();

        // Скриншот только хедера (изолированно)
        await expect(header).toHaveScreenshot('header.png');
    });
});
