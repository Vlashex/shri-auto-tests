import { describe, it, expect, vi } from 'vitest';
import { createFileSlice } from './file.slice';
import type { AnalysisState } from '../types';

describe('createFileSlice', () => {
    const createSlice = (set: ReturnType<typeof vi.fn> = vi.fn()) => {
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

        const slice = createFileSlice(set, mockGet, mockStore);
        return { slice, set };
    };

    it('должен иметь начальное состояние file = null и status = idle', () => {
        const set = vi.fn();
        const { slice } = createSlice(set);

        expect(slice.file).toBe(null);
        expect(slice.status).toBe('idle');
    });

    it('setFile устанавливает новый файл и сбрасывает highlights/error/status', () => {
        const mockFile = new File(['data'], 'test.csv', { type: 'text/csv' });
        const set = vi.fn();

        const { slice } = createSlice(set);

        slice.setFile(mockFile);

        expect(set).toHaveBeenCalledWith(
            {
                file: mockFile,
                status: 'idle',
                highlights: [],
                error: null,
            },
            false,
            'file/setFile'
        );
    });

    it('setFile(null) должен сбросить file и состояние', () => {
        const set = vi.fn();

        const { slice } = createSlice(set);

        slice.setFile(null);

        expect(set).toHaveBeenCalledWith(
            {
                file: null,
                status: 'idle',
                highlights: [],
                error: null,
            },
            false,
            'file/setFile'
        );
    });

    it('setStatus обновляет статус и вызывает set с action name', () => {
        const set = vi.fn();

        const { slice } = createSlice(set);

        slice.setStatus('processing');

        expect(set).toHaveBeenCalledWith({ status: 'processing' }, false, 'file/setStatus');
    });
});
