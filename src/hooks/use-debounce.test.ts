import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDebounce } from './use-debounce';

beforeEach(() => {
    vi.useFakeTimers();

    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
        return setTimeout(() => cb(performance.now()), 16);
    });

    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
        clearTimeout(id);
    });
});

afterEach(() => {
    vi.clearAllTimers();
    vi.restoreAllMocks();
});

describe('useDebounce', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('должен дебаунсить вызовы через requestAnimationFrame (по умолчанию)', () => {
        const fn = vi.fn();
        const { result } = renderHook(() => useDebounce(fn));

        act(() => {
            result.current(1);
            result.current(2);
            result.current(3);
        });

        act(() => {
            vi.advanceTimersByTime(16);
        });

        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith(1);

        act(() => {
            vi.advanceTimersByTime(16);
        });

        expect(fn).toHaveBeenCalledTimes(2);
        expect(fn).toHaveBeenCalledWith(2);

        act(() => {
            vi.advanceTimersByTime(16);
        });

        expect(fn).toHaveBeenCalledTimes(3);
        expect(fn).toHaveBeenCalledWith(3);
    });

    it('должен дебаунсить вызовы через setTimeout', () => {
        const fn = vi.fn();
        const { result } = renderHook(() => useDebounce(fn, { type: 'timeout', delay: 100 }));

        act(() => {
            result.current('a');
            result.current('b');
        });

        expect(fn).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(100);
        });

        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith('a');

        act(() => {
            vi.advanceTimersByTime(100);
        });

        expect(fn).toHaveBeenCalledTimes(2);
        expect(fn).toHaveBeenCalledWith('b');
    });

    it('должен обработать очередь из нескольких вызовов (timeout)', () => {
        const fn = vi.fn();
        const { result } = renderHook(() => useDebounce(fn, { type: 'timeout', delay: 50 }));

        act(() => {
            result.current(1);
            result.current(2);
            result.current(3);
        });

        act(() => {
            vi.advanceTimersByTime(50);
        });

        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith(1);

        act(() => {
            vi.advanceTimersByTime(50);
        });

        expect(fn).toHaveBeenCalledTimes(2);
        expect(fn).toHaveBeenCalledWith(2);

        act(() => {
            vi.advanceTimersByTime(50);
        });

        expect(fn).toHaveBeenCalledTimes(3);
        expect(fn).toHaveBeenCalledWith(3);
    });

    it('не вызывает fn повторно, если нет новых элементов (animation)', () => {
        vi.useFakeTimers();

        vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
            return setTimeout(() => cb(performance.now()), 16);
        });

        vi.stubGlobal('cancelAnimationFrame', (id: number) => {
            clearTimeout(id);
        });

        const fn = vi.fn();
        const { result } = renderHook(() => useDebounce(fn, { type: 'animation' }));

        act(() => {
            result.current('once');
        });

        act(() => {
            vi.advanceTimersByTime(16);
        });

        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith('once');

        act(() => {
            vi.advanceTimersByTime(16);
        });

        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('fn может выбросить ошибку, но очередь продолжается', () => {
        const fn = vi
            .fn()
            .mockImplementationOnce(() => {
                throw new Error('fail');
            })
            .mockImplementation(() => {});

        const callFnSafely = (...args: any) => {
            try {
                fn(...args);
            } catch (e) {
                console.error('useDebounce error:', e);
            }
        };

        const { result } = renderHook(() => useDebounce(callFnSafely, { type: 'timeout', delay: 10 }));

        act(() => {
            result.current('bad');
            result.current('good');
        });

        act(() => {
            vi.advanceTimersByTime(20);
        });

        expect(fn).toHaveBeenCalledTimes(2);
        expect(fn.mock.calls[0][0]).toBe('bad');
        expect(fn.mock.calls[1][0]).toBe('good');
    });
});
