import { render, screen, fireEvent } from '@testing-library/react';
import { HistoryModal } from './HistoryModal';
import { useHistoryStore } from '@store/historyStore';
import type { HistoryItemType } from '@app-types/history';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('HistoryModal', () => {
    const mockItem: HistoryItemType = {
        id: 'test-id',
        fileName: 'test.csv',
        timestamp: Date.now(),
        highlights: {
            total_spend_galactic: 12345,
            rows_affected: 42,
            less_spent_at: 10,
            big_spent_at: 20,
            less_spent_value: 5,
            big_spent_value: 999,
            average_spend_galactic: 456,
            big_spent_civ: 'Alpha',
            less_spent_civ: 'Beta',
        },
    };

    const hideModal = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        useHistoryStore.setState({
            isOpenModal: true,
            selectedItem: mockItem,
            hideModal,
        });
    });

    it('рендерит модалку с хайлайтами, если selectedItem задан', () => {
        render(<HistoryModal />);
        expect(screen.getByText(/общие расходы/i)).toBeInTheDocument(); // один из заголовков HighlightCard
        expect(screen.getByText(/alpha/i)).toBeInTheDocument(); // big_spent_civ
    });

    it('не рендерит модалку, если selectedItem отсутствует', () => {
        useHistoryStore.setState({ selectedItem: null });
        const { container } = render(<HistoryModal />);
        expect(container.firstChild).toBeNull();
    });

    it('не рендерит модалку, если highlights отсутствуют', () => {
        useHistoryStore.setState({
            selectedItem: { ...mockItem, highlights: undefined },
        });
        const { container } = render(<HistoryModal />);
        expect(container.firstChild).toBeNull();
    });

    it('вызов hideModal при закрытии модалки', () => {
        render(<HistoryModal />);
        const overlay = screen.getByTestId('modal-backdrop');

        fireEvent.click(overlay);
        expect(hideModal).toHaveBeenCalled();
    });
});
