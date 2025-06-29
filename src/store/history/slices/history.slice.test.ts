import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createHistorySlice } from './history.slice';
import type { HistoryItemType } from '@app-types/history';
import * as storage from '@utils/storage';
import type { HistoryState } from '../types';

vi.mock('@utils/storage', () => ({
    getHistory: vi.fn(),
}));

const mockItem = (id: string): HistoryItemType => ({
    id,
    timestamp: Date.now(),
    fileName: `file-${id}`,
});

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));
});

afterEach(() => {
    vi.useRealTimers();
});

describe('createHistorySlice', () => {
    const createSlice = (set = vi.fn()) => {
        const mockGet = vi.fn(
            (): HistoryState => ({
                // IHistorySlice
                history: [],
                selectedItem: null,
                addToHistory: vi.fn(),
                removeFromHistory: vi.fn(),
                clearHistory: vi.fn(),
                setSelectedItem: vi.fn(),
                resetSelectedItem: vi.fn(),
                updateHistoryFromStorage: vi.fn(),

                // IModalSlice
                isOpenModal: false,
                showModal: vi.fn(),
                hideModal: vi.fn(),

                // ISharedSlice
                reset: vi.fn(),
            })
        );

        const mockStore = {} as any;
        return { slice: createHistorySlice(set, mockGet, mockStore), set };
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (storage.getHistory as ReturnType<typeof vi.fn>).mockReturnValue([mockItem('1')]);
    });

    it('инициализируется с history из getHistory()', () => {
        const { slice } = createSlice();
        expect(slice.history).toEqual([mockItem('1')]);
        expect(slice.selectedItem).toBeNull();
    });

    it('addToHistory добавляет элемент в конец', () => {
        const { slice, set } = createSlice();
        const newItem = mockItem('2');

        slice.addToHistory(newItem);

        expect(set).toHaveBeenCalledWith(expect.any(Function), false, 'history/addToHistory');

        const updater = set.mock.calls[0][0];
        const updated = updater({ history: [mockItem('1')] });

        expect(updated.history).toEqual([mockItem('1'), newItem]);
    });

    it('removeFromHistory удаляет элемент по id', () => {
        const { slice, set } = createSlice();

        slice.removeFromHistory('1');

        expect(set).toHaveBeenCalledWith(expect.any(Function), false, 'history/removeFromHistory');

        const updater = set.mock.calls[0][0];
        const updated = updater({ history: [mockItem('1'), mockItem('2')] });

        expect(updated.history).toEqual([mockItem('2')]);
    });

    it('clearHistory очищает историю', () => {
        const { slice, set } = createSlice();
        slice.clearHistory();
        expect(set).toHaveBeenCalledWith({ history: [] }, false, 'history/clearHistory');
    });

    it('setSelectedItem устанавливает выбранный элемент', () => {
        const { slice, set } = createSlice();
        const item = mockItem('5');
        slice.setSelectedItem(item);
        expect(set).toHaveBeenCalledWith({ selectedItem: item }, false, 'history/setSelectedItem');
    });

    it('resetSelectedItem сбрасывает выбранный элемент', () => {
        const { slice, set } = createSlice();
        slice.resetSelectedItem();
        expect(set).toHaveBeenCalledWith({ selectedItem: null }, false, 'history/resetSelectedItem');
    });

    it('updateHistoryFromStorage подгружает данные из getHistory()', () => {
        const { slice, set } = createSlice();
        (storage.getHistory as ReturnType<typeof vi.fn>).mockReturnValue([mockItem('999')]);
        slice.updateHistoryFromStorage();
        expect(storage.getHistory).toHaveBeenCalled();
        expect(set).toHaveBeenCalledWith({ history: [mockItem('999')] }, false, 'history/updateHistoryFromStorage');
    });
});
