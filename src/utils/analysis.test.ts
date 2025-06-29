import {
    transformAnalysisData,
    convertHighlightsToArray,
    isCsvFile,
    validateServerResponse,
    InvalidServerResponseError,
} from './analysis';

import { describe, it, expect } from 'vitest';
import { HIGHLIGHT_TITLES } from '@utils/consts';
import { Highlights } from '@app-types/common';

describe('transformAnalysisData', () => {
    it('должен вернуть highlights и highlightsToStore при корректных данных', () => {
        const data = {
            insight1: 123,
            rows_affected: 456,
        };
        const str = JSON.stringify(data) + '\n{"ignored":"data"}';
        const value = new TextEncoder().encode(str);

        const result = transformAnalysisData(value);

        expect(result.highlights).toEqual({ insight1: 123 });
        expect(result.highlightsToStore).toEqual([
            {
                title: '123',
                description: HIGHLIGHT_TITLES['insight1'] ?? 'Неизвестный параметр',
            },
        ]);
    });

    it('должен выбросить ошибку, если нет допустимых ключей', () => {
        const value = new TextEncoder().encode(JSON.stringify({ unknown_key: 1 }));

        expect(() => transformAnalysisData(value)).toThrowError(InvalidServerResponseError);
    });

    it('должен выбросить ошибку, если есть null в данных', () => {
        const value = new TextEncoder().encode(JSON.stringify({ insight1: null }));

        expect(() => transformAnalysisData(value)).toThrowError(InvalidServerResponseError);
    });
});

describe('convertHighlightsToArray', () => {
    it('должен корректно преобразовать числовые и строковые значения', () => {
        const highlights: Highlights = {
            total_spend_galactic: 9000,
            rows_affected: 2000,
            less_spent_at: 4,
            big_spent_at: 6,
            less_spent_value: 1,
            big_spent_value: 200,
            average_spend_galactic: 30,
            big_spent_civ: 'human',
            less_spent_civ: 'cats',
        };

        const result = convertHighlightsToArray(highlights);

        expect(result).toContainEqual({
            title: 'cats',
            description: HIGHLIGHT_TITLES['less_spent_civ'],
        });
    });

    it('должен вернуть "Неизвестный параметр" для неизвестного ключа', () => {
        const highlights = {
            unknown: 1,
        } as unknown as Highlights;

        const result = convertHighlightsToArray(highlights);

        expect(result[0].description).toBe('Неизвестный параметр');
    });
});

describe('isCsvFile', () => {
    it('должен вернуть true для .csv файлов (любой регистр)', () => {
        expect(isCsvFile(new File([], 'data.csv'))).toBe(true);
        expect(isCsvFile(new File([], 'DATA.CSV'))).toBe(true);
        expect(isCsvFile(new File([], 'report.CsV'))).toBe(true);
    });

    it('должен вернуть false для других расширений', () => {
        expect(isCsvFile(new File([], 'data.json'))).toBe(false);
        expect(isCsvFile(new File([], 'data'))).toBe(false);
    });
});

describe('validateServerResponse', () => {
    it('возвращает true, если хотя бы один ключ валиден и нет null', () => {
        const keys = Object.keys(HIGHLIGHT_TITLES);
        const sampleKey = keys[0];

        expect(validateServerResponse({ [sampleKey]: 1, test: 2 })).toBe(true);
    });

    it('возвращает false, если ни один ключ не валиден', () => {
        expect(validateServerResponse({ unknown1: 1, unknown2: 2 })).toBe(false);
    });

    it('выбрасывает ошибку, если есть null значения', () => {
        const keys = Object.keys(HIGHLIGHT_TITLES);
        const sampleKey = keys[0];

        expect(() =>
            validateServerResponse({ [sampleKey]: null } as unknown as Record<string, string | number>)
        ).toThrowError(InvalidServerResponseError);
    });
});
