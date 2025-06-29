import { test, expect } from '@playwright/test';

// Тестовый объект истории
const mockHistoryItem = {
    id: 'test-id-123',
    timestamp: Date.now(),
    fileName: 'mock.csv',
    highlights: {
        total_spend_galactic: 10000,
        rows_affected: 42,
        less_spent_at: 12,
        big_spent_at: 200,
        less_spent_value: 123,
        big_spent_value: 9999,
        average_spend_galactic: 450,
        big_spent_civ: 'Andromeda',
        less_spent_civ: 'Terra',
    },
};

test('при нажатии на delete элемент удаляется из истории', async ({ page }) => {
    // Вставляем item в localStorage ДО загрузки страницы
    await page.addInitScript((item) => {
        localStorage.setItem('tableHistory', JSON.stringify([item]));
    }, mockHistoryItem);

    // Теперь переходим на /history
    await page.goto('/history');

    // Проверяем, что элемент отображается
    await expect(page.getByText(/mock\.csv/i)).toBeVisible();

    // Нажимаем кнопку удаления
    const deleteButton = await page.getByRole('button', { name: /удалить/i });
    await deleteButton.click();

    // Проверяем, что элемент исчез из DOM
    await expect(page.getByText(/mock\.csv/i)).toHaveCount(0);

    // Проверяем, что localStorage пуст
    const historyItems = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem('tableHistory') || '[]');
    });
    expect(historyItems).toHaveLength(0);
});

test('при нажатии на >Очистить всё< история очищается', async ({ page }) => {
    // Вставляем item в localStorage ДО загрузки страницы
    await page.addInitScript((item) => {
        localStorage.setItem('tableHistory', JSON.stringify([item]));
    }, mockHistoryItem);

    // Теперь переходим на /history
    await page.goto('/history');

    // Проверяем, что элемент отображается
    await expect(page.getByText(/mock\.csv/i)).toBeVisible();

    // Нажимаем кнопку удаления
    const deleteButton = await page.getByRole('button', { name: /Очистить всё/i });
    await deleteButton.click();

    // Проверяем, что элемент исчез из DOM
    await expect(page.getByText(/mock\.csv/i)).toHaveCount(0);

    // Проверяем, что localStorage пуст
    const historyItems = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem('tableHistory') || '[]');
    });
    expect(historyItems).toHaveLength(0);
});
