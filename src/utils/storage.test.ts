import { getHistory, addToHistory, removeFromHistory, clearHistory } from './storage';

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { STORAGE_KEY } from './consts';

vi.stubGlobal('crypto', {
    randomUUID: () => 'mock-uuid',
});

const mockNow = 1650000000000;
vi.setSystemTime(mockNow);

describe('history storage utils', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    describe('getHistory', () => {
        it('должен вернуть массив из localStorage', () => {
            const items = [{ id: '1', timestamp: 1, value: 'a' }];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));

            expect(getHistory()).toEqual(items);
        });

        it('должен вернуть пустой массив, если записи нет', () => {
            expect(getHistory()).toEqual([]);
        });

        it('должен вернуть пустой массив, если JSON сломан', () => {
            localStorage.setItem(STORAGE_KEY, 'невалидный json');
            expect(getHistory()).toEqual([]);
        });

        it('должен вернуть пустой массив при исключении', () => {
            vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
                throw new Error('fail');
            });

            expect(getHistory()).toEqual([]);
        });
    });

    describe('addToHistory', () => {
        it('должен добавить элемент в начало истории', () => {
            const previous = [{ id: '2', timestamp: 2, value: 'b' }];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(previous));

            const newItem = addToHistory({ value: 'new' } as any);

            expect(newItem).toMatchObject({
                value: 'new',
                id: 'mock-uuid',
                timestamp: mockNow,
            });

            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
            expect(stored[0]).toEqual(newItem);
            expect(stored[1]).toEqual(previous[0]);
        });

        it('должен создать историю, если она пустая', () => {
            const item = addToHistory({ value: 'first' } as any);
            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);

            expect(stored).toEqual([item]);
        });

        it('должен выбросить ошибку при сбое setItem', () => {
            vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
                throw new Error('fail');
            });

            expect(() => addToHistory({ value: 'err' } as any)).toThrowError('fail');
        });
    });

    describe('removeFromHistory', () => {
        it('должен удалить элемент по id', () => {
            const initial = [
                { id: '1', timestamp: 1, value: 'a' },
                { id: '2', timestamp: 2, value: 'b' },
            ];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));

            removeFromHistory('1');

            const result = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
            expect(result).toEqual([{ id: '2', timestamp: 2, value: 'b' }]);
        });

        it('должен выбросить ошибку при сбое setItem внутри removeFromHistory', () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([{ id: '1', timestamp: 1 }]));

            vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
                throw new Error('fail');
            });

            expect(() => removeFromHistory('1')).toThrowError('fail');
        });
    });

    describe('clearHistory', () => {
        it('должен удалить ключ из localStorage', () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([{ id: '1', timestamp: 1 }]));

            const spy = vi.spyOn(Storage.prototype, 'removeItem');

            clearHistory();

            expect(spy).toHaveBeenCalledWith(STORAGE_KEY);
            expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
        });

        it('должен выбросить ошибку при сбое removeItem', () => {
            vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
                throw new Error('fail');
            });

            expect(() => clearHistory()).toThrowError('fail');
        });
    });
});
