import { describe, it, expect } from 'vitest';
import { formatDate } from './formateDate';

describe('formatDate', () => {
    it('должен форматировать объект Date в строку ДД.ММ.ГГГГ', () => {
        const date = new Date(2023, 4, 1); // 1 мая 2023
        expect(formatDate(date)).toBe('01.05.2023');
    });

    it('должен форматировать таймстамп в строку ДД.ММ.ГГГГ', () => {
        const timestamp = Date.UTC(2022, 0, 15); // 15 января 2022
        expect(formatDate(timestamp)).toBe('15.01.2022');
    });

    it('должен добавлять нули к дню и месяцу, если они < 10', () => {
        const date = new Date(1999, 0, 5); // 5 января 1999
        expect(formatDate(date)).toBe('05.01.1999');
    });

    it('должен корректно обрабатывать 31 декабря', () => {
        const date = new Date(2020, 11, 31); // 31 декабря 2020
        expect(formatDate(date)).toBe('31.12.2020');
    });

    it('должен корректно обрабатывать 1 января', () => {
        const date = new Date(2000, 0, 1); // 1 января 2000
        expect(formatDate(date)).toBe('01.01.2000');
    });
});
