import { render, screen, fireEvent } from '@testing-library/react';
import { HistoryItem } from './HistoryItem';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { HistoryItemType } from '@app-types/history';
import { formatDate } from '@utils/formateDate';

describe('HistoryItem', () => {
    const timestamp = Date.now();
    const itemWithHighlights: HistoryItemType = {
        id: 'test-id-1',
        fileName: 'mock.csv',
        timestamp,
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
    };

    const itemWithoutHighlights: HistoryItemType = {
        ...itemWithHighlights,
        id: 'test-id-2',
        highlights: undefined,
    };

    const onClick = vi.fn();
    const onDelete = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('отображает имя файла и дату', () => {
        render(<HistoryItem item={itemWithHighlights} onClick={onClick} onDelete={onDelete} />);
        expect(screen.getByText('mock.csv')).toBeInTheDocument();
        expect(screen.getByText(formatDate(timestamp))).toBeInTheDocument();
    });

    it('отображает активный статус "успешно", если есть highlights', () => {
        render(<HistoryItem item={itemWithHighlights} onClick={onClick} onDelete={onDelete} />);
        const success = screen.getByText(/обработан успешно/i).parentElement!;
        const error = screen.getByText(/не удалось обработать/i).parentElement!;
        expect(success.className).toMatch(/active/);
        expect(error.className).not.toMatch(/active/);
    });

    it('отображает активный статус "ошибка", если highlights нет', () => {
        render(<HistoryItem item={itemWithoutHighlights} onClick={onClick} onDelete={onDelete} />);
        const success = screen.getByText(/обработан успешно/i).parentElement!;
        const error = screen.getByText(/не удалось обработать/i).parentElement!;
        expect(success.className).not.toMatch(/active/);
        expect(error.className).toMatch(/active/);
    });

    it('вызывает onClick при клике, если highlights есть', () => {
        render(<HistoryItem item={itemWithHighlights} onClick={onClick} onDelete={onDelete} />);
        fireEvent.click(screen.getByLabelText(/открыть хайлайты/i));
        expect(onClick).toHaveBeenCalledWith(itemWithHighlights);
    });

    it('не вызывает onClick при клике, если highlights нет', () => {
        render(<HistoryItem item={itemWithoutHighlights} onClick={onClick} onDelete={onDelete} />);
        fireEvent.click(screen.getByLabelText(/открыть хайлайты/i));
        expect(onClick).not.toHaveBeenCalled();
    });

    it('вызывает onDelete при клике на кнопку удаления', () => {
        render(<HistoryItem item={itemWithHighlights} onClick={onClick} onDelete={onDelete} />);
        fireEvent.click(screen.getByLabelText(/удалить файл/i));
        expect(onDelete).toHaveBeenCalledWith(itemWithHighlights.id);
    });
});
