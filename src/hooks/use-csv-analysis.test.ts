import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useCsvAnalysis } from './use-csv-analysis';
import { InvalidServerResponseError, transformAnalysisData } from '@utils/analysis';
import { API_HOST } from '@utils/consts';

vi.mock('@utils/analysis', async () => {
    const actual = await vi.importActual<any>('@utils/analysis');
    return {
        ...actual,
        transformAnalysisData: vi.fn(),
    };
});

describe('useCsvAnalysis', () => {
    const mockCsvFile = new File(['mock content'], 'test.csv', { type: 'text/csv' });

    let onData: ReturnType<typeof vi.fn>;
    let onError: ReturnType<typeof vi.fn>;
    let onComplete: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        onData = vi.fn();
        onError = vi.fn();
        onComplete = vi.fn();

        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it('должен обработать happy path с несколькими чанками', async () => {
        const mockReader = {
            read: vi
                .fn()
                .mockResolvedValueOnce({ done: false, value: new Uint8Array([1]) })
                .mockResolvedValueOnce({ done: true, value: undefined }),
        };

        const mockResponse = {
            ok: true,
            body: {
                getReader: () => mockReader,
            },
        };

        (global.fetch as any).mockResolvedValue(mockResponse);

        (transformAnalysisData as any).mockReturnValue({
            highlights: { summary: 'some' },
            highlightsToStore: [{ id: 1 }],
        });

        const { result } = renderHook(() => useCsvAnalysis({ onData, onError, onComplete }));

        await act(async () => {
            await result.current.analyzeCsv(mockCsvFile);
        });

        expect(global.fetch).toHaveBeenCalledWith(
            `${API_HOST}/aggregate?rows=10000`,
            expect.objectContaining({
                method: 'POST',
                body: expect.any(FormData),
            })
        );

        expect(transformAnalysisData).toHaveBeenCalledTimes(1);
        expect(onData).toHaveBeenCalledWith([{ id: 1 }]);
        expect(onComplete).toHaveBeenCalledWith({ summary: 'some' });
        expect(onError).not.toHaveBeenCalled();
    });

    it('должен вызвать onError, если response.ok === false', async () => {
        const response = { ok: false, body: {} };
        (global.fetch as any).mockResolvedValue(response);

        const { result } = renderHook(() => useCsvAnalysis({ onData, onError, onComplete }));

        await act(() => result.current.analyzeCsv(mockCsvFile));

        expect(onError).toHaveBeenCalledWith(expect.any(Error));
        expect(onError.mock.calls[0][0].message).toMatch(/Неизвестная ошибка/);
        expect(onData).not.toHaveBeenCalled();
        expect(onComplete).not.toHaveBeenCalled();
    });

    it('должен вызвать onError, если response.body отсутствует', async () => {
        const response = { ok: true, body: null };
        (global.fetch as any).mockResolvedValue(response);

        const { result } = renderHook(() => useCsvAnalysis({ onData, onError, onComplete }));

        await act(() => result.current.analyzeCsv(mockCsvFile));

        expect(onError).toHaveBeenCalledWith(expect.any(Error));
        expect(onError.mock.calls[0][0].message).toMatch(/Неизвестная ошибка парсинга/);
    });

    it('должен вызвать onComplete с undefined, если reader.read сразу завершён', async () => {
        const mockReader = {
            read: vi.fn().mockResolvedValue({ done: true, value: undefined }),
        };

        const mockResponse = {
            ok: true,
            body: { getReader: () => mockReader },
        };

        (global.fetch as any).mockResolvedValue(mockResponse);

        const { result } = renderHook(() => useCsvAnalysis({ onData, onError, onComplete }));

        await act(() => result.current.analyzeCsv(mockCsvFile));

        expect(onData).not.toHaveBeenCalled();
        expect(onComplete).toHaveBeenCalledWith(undefined);
    });

    it('должен вызвать onError при ошибке fetch', async () => {
        (global.fetch as any).mockRejectedValue(new Error('fetch failed'));

        const { result } = renderHook(() => useCsvAnalysis({ onData, onError, onComplete }));

        await act(() => result.current.analyzeCsv(mockCsvFile));

        expect(onError).toHaveBeenCalledWith(expect.any(Error));
        expect(onError.mock.calls[0][0].message).toMatch(/парсинга/);
    });

    it('должен обработать InvalidServerResponseError из transformAnalysisData', async () => {
        const mockReader = {
            read: vi
                .fn()
                .mockResolvedValueOnce({ done: false, value: new Uint8Array([1]) })
                .mockResolvedValueOnce({ done: true, value: undefined }),
        };

        const mockResponse = {
            ok: true,
            body: {
                getReader: () => mockReader,
            },
        };

        (global.fetch as any).mockResolvedValue(mockResponse);
        (transformAnalysisData as any).mockImplementation(() => {
            throw new InvalidServerResponseError('invalid');
        });

        const { result } = renderHook(() => useCsvAnalysis({ onData, onError, onComplete }));

        await act(() => result.current.analyzeCsv(mockCsvFile));

        expect(onError).toHaveBeenCalledWith(expect.any(InvalidServerResponseError));
        expect(onData).not.toHaveBeenCalled();
        expect(onComplete).not.toHaveBeenCalled();
    });
});
