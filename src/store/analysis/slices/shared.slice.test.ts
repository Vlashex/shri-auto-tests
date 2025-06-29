import { describe, it, vi, expect } from 'vitest';
import { createSharedSlice } from './shared.slice';
import { AnalysisStatus } from '@app-types/analysis';

describe('createSharedSlice', () => {
    const createSlice = (set = vi.fn()) => {
        const get = vi.fn(() => ({
            file: null,
            status: 'idle' as AnalysisStatus,
            highlights: [],
            error: null,
            setFile: vi.fn(),
            setStatus: vi.fn(),
            setHighlights: vi.fn(),
            setError: vi.fn(),
            reset: vi.fn(),
        }));

        const store = {} as any;

        const slice = createSharedSlice(set, get, store);
        return { slice, set };
    };

    it('reset должен сбрасывать состояние', () => {
        const { slice, set } = createSlice();

        slice.reset();

        expect(set).toHaveBeenCalledWith(
            {
                file: null,
                status: 'idle',
                highlights: [],
                error: null,
            },
            false,
            'store/reset'
        );
    });
});
