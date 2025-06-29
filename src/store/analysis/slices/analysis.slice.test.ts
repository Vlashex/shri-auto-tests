import { describe, it, expect, vi } from 'vitest';
import { createAnalysisSlice } from './analysis.slice';
import { type AnalysisState } from '../types';

describe('createAnalysisSlice', () => {
    const createSlice = () => {
        const mockSet = vi.fn();
        const mockGet = vi.fn(() => ({
            // IFileSlice
            file: null,
            status: 'idle',
            setFile: vi.fn(),
            setStatus: vi.fn(),

            // IAnalysisSlice
            highlights: [],
            error: null,
            setHighlights: vi.fn(),
            setError: vi.fn(),

            // ISharedSlice
            reset: vi.fn(),
        })) as () => AnalysisState;

        const mockStore = {} as any;

        const slice = createAnalysisSlice(mockSet, mockGet, mockStore);
        return { slice, mockSet };
    };

    it('должен установить начальное состояние', () => {
        const { slice } = createSlice();
        expect(slice.highlights).toEqual([]);
        expect(slice.error).toBeNull();
    });

    it('setHighlights должен обновлять highlights и вызывать set с action name', () => {
        const { slice, mockSet } = createSlice();

        const newHighlights = [{ title: 'abc', description: 'desc' }];
        slice.setHighlights(newHighlights);

        expect(mockSet).toHaveBeenCalledWith({ highlights: newHighlights }, false, 'analysis/setHighlights');
    });

    it('setError должен обновлять error и вызывать set с статусом и action name', () => {
        const { slice, mockSet } = createSlice();

        slice.setError('Ошибка анализа');

        expect(mockSet).toHaveBeenCalledWith({ error: 'Ошибка анализа', status: 'error' }, false, 'analysis/setError');
    });

    it('setError должен позволять сбросить ошибку', () => {
        const { slice, mockSet } = createSlice();

        slice.setError(null);

        expect(mockSet).toHaveBeenCalledWith({ error: null, status: 'error' }, false, 'analysis/setError');
    });
});
