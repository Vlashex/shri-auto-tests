import { describe, it, expect, vi } from 'vitest';
import { createModalSlice } from './modal.slice';
import type { HistoryState } from '../types';

describe('createModalSlice', () => {
    const createSlice = (set = vi.fn()) => {
        const mockGet = vi.fn(
            (): HistoryState => ({
                // IModalSlice
                isOpenModal: false,
                showModal: vi.fn(),
                hideModal: vi.fn(),

                // IHistorySlice
                history: [],
                selectedItem: null,
                addToHistory: vi.fn(),
                removeFromHistory: vi.fn(),
                clearHistory: vi.fn(),
                setSelectedItem: vi.fn(),
                resetSelectedItem: vi.fn(),
                updateHistoryFromStorage: vi.fn(),

                // ISharedSlice
                reset: vi.fn(),
            })
        );

        const mockStore = {} as any;

        return {
            slice: createModalSlice(set, mockGet, mockStore),
            set,
        };
    };

    it('showModal вызывает set с isOpenModal = true', () => {
        const { slice, set } = createSlice();
        slice.showModal();

        expect(set).toHaveBeenCalledWith({ isOpenModal: true }, false, 'modal/showModal');
    });

    it('hideModal вызывает set с isOpenModal = false', () => {
        const { slice, set } = createSlice();
        slice.hideModal();

        expect(set).toHaveBeenCalledWith({ isOpenModal: false }, false, 'modal/hideModal');
    });
});
