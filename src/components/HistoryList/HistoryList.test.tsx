import { render, screen, fireEvent } from '@testing-library/react';
import { HistoryList } from './HistoryList';
import { useHistoryStore } from '@store/historyStore';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { HistoryItemType } from '@app-types/history';

vi.mock('@utils/storage', async () => {
    const actual = await vi.importActual<typeof import('@utils/storage')>('@utils/storage');

    return {
        ...actual,
        removeFromHistory: vi.fn(),
        getHistory: vi.fn(() => []), // <— добавь нужный экспорт
    };
});

const mockHistory: HistoryItemType[] = [
    {
        id: '1',
        timestamp: Date.now(),
        fileName: 'mock.csv',
        highlights: {
            total_spend_galactic: 1000,
            rows_affected: 100000,
            less_spent_at: 12,
            big_spent_at: 13,
            less_spent_value: 1,
            big_spent_value: 1975,
            average_spend_galactic: 6,
            big_spent_civ: 'cat',
            less_spent_civ: 'dog',
        },
    },
];

describe('HistoryList', () => {
    const showModal = vi.fn();
    const setSelectedItem = vi.fn();
    const removeFromHistoryStore = vi.fn();
    const updateHistoryFromStorage = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        useHistoryStore.setState({
            history: mockHistory,
            showModal,
            setSelectedItem,
            removeFromHistory: removeFromHistoryStore,
            updateHistoryFromStorage,
        });
    });

    it('отрисовывает список элементов истории', () => {
        render(<HistoryList />);
        expect(screen.getByText('mock.csv')).toBeInTheDocument();
    });

    it('инициализирует стор из localStorage при монтировании', () => {
        render(<HistoryList />);
        expect(updateHistoryFromStorage).toHaveBeenCalled();
    });

    it('при клике вызывает showModal и setSelectedItem', () => {
        render(<HistoryList />);
        fireEvent.click(screen.getByLabelText(/открыть хайлайты/i));
        expect(showModal).toHaveBeenCalled();
        expect(setSelectedItem).toHaveBeenCalledWith(mockHistory[0]);
    });

    it('при клике по кнопке удаления удаляет из store и localStorage', async () => {
        const { removeFromHistory } = await import('@utils/storage');

        render(<HistoryList />);
        fireEvent.click(screen.getByLabelText(/удалить файл/i));
        expect(removeFromHistory).toHaveBeenCalledWith('1');
        expect(removeFromHistoryStore).toHaveBeenCalledWith('1');
    });
});
