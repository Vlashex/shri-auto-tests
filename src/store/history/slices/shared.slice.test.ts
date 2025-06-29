import { describe, it, expect, vi } from 'vitest';
import { createSharedSlice } from './shared.slice';
import type { HistoryState } from '../types';

describe('createSharedSlice', () => {
    const createSlice = (set = vi.fn()) => {
        const mockGet = vi.fn(
            (): HistoryState => ({
                // IHistorySlice
                history: [{ id: '1', timestamp: 0, fileName: 'test.csv' }],
                selectedItem: { id: '1', timestamp: 0, fileName: 'test.csv' },
                addToHistory: vi.fn(),
                removeFromHistory: vi.fn(),
                clearHistory: vi.fn(),
                setSelectedItem: vi.fn(),
                resetSelectedItem: vi.fn(),
                updateHistoryFromStorage: vi.fn(),

                // IModalSlice
                isOpenModal: true,
                showModal: vi.fn(),
                hideModal: vi.fn(),

                // ISharedSlice
                reset: vi.fn(),
            })
        );

        const mockStore = {} as any;

        return {
            slice: createSharedSlice(set, mockGet, mockStore),
            set,
        };
    };

    it('reset должен сбросить selectedItem, isOpenModal и history', () => {
        const { slice, set } = createSlice();

        slice.reset();

        expect(set).toHaveBeenCalledWith(
            {
                selectedItem: null,
                isOpenModal: false,
                history: [],
            },
            false,
            'shared/reset'
        );
    });
});
