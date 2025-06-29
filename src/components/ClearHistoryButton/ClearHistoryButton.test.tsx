import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClearHistoryButton } from './ClearHistoryButton';
import { useHistoryStore } from '@store/historyStore';
import { clearHistory as clearHistoryStorage } from '@utils/storage';

vi.mock('@store/historyStore', () => ({
    useHistoryStore: vi.fn(),
}));

vi.mock('@utils/storage', () => ({
    clearHistory: vi.fn(),
}));

const mockedUseHistoryStore = useHistoryStore as unknown as ReturnType<typeof vi.fn>;
const mockedClearHistoryStorage = clearHistoryStorage as unknown as ReturnType<typeof vi.fn>;

const mockClearHistory = vi.fn();

describe('<ClearHistoryButton />', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('не рендерится, если история пустая', () => {
        mockedUseHistoryStore.mockReturnValue({
            history: [],
            clearHistory: mockClearHistory,
        });

        render(<ClearHistoryButton />);
        expect(screen.queryByRole('button')).toBeNull();
    });

    it('рендерится, если история непустая', () => {
        mockedUseHistoryStore.mockReturnValue({
            history: [{ id: '1', timestamp: 0, fileName: 'test.csv' }],
            clearHistory: mockClearHistory,
        });

        render(<ClearHistoryButton />);
        const button = screen.getByRole('button');
        expect(button).toHaveTextContent('Очистить всё');
    });

    it('при клике вызывает clearHistory и clearHistoryStorage', () => {
        mockedUseHistoryStore.mockReturnValue({
            history: [{ id: '1', timestamp: 0, fileName: 'test.csv' }],
            clearHistory: mockClearHistory,
        });

        render(<ClearHistoryButton />);
        fireEvent.click(screen.getByRole('button'));

        expect(mockClearHistory).toHaveBeenCalledTimes(1);
        expect(mockedClearHistoryStorage).toHaveBeenCalledTimes(1);
    });
});
