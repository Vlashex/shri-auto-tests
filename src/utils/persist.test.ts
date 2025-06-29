import { describe, it, expect } from 'vitest';
import { createPersistConfig } from './persist';

describe('createPersistConfig', () => {
    interface State {
        token: string;
        theme: 'light' | 'dark';
        counter: number;
    }

    it('должен вернуть persist-конфигурацию с правильным name', () => {
        const config = createPersistConfig<State>('my-storage', ['token', 'theme']);

        expect(config.name).toBe('my-storage');
        expect(typeof config.partialize).toBe('function');
    });

    it('partialize должен возвращать объект с только указанными ключами', () => {
        const config = createPersistConfig<State>('x', ['token', 'theme']);

        const fullState: State = {
            token: 'abc123',
            theme: 'light',
            counter: 42,
        };

        const partial = (config.partialize as Function)(fullState); // Костыли, это лучше исправить в самой функции

        expect(partial).toEqual({
            token: 'abc123',
            theme: 'light',
        });

        expect(partial).not.toHaveProperty('counter');
    });

    it('partialize должен вернуть пустой объект, если список ключей пуст', () => {
        const config = createPersistConfig<State>('empty', []);

        const fullState: State = {
            token: 'abc',
            theme: 'dark',
            counter: 99,
        };

        const partial = (config.partialize as Function)(fullState);

        expect(partial).toEqual({});
    });

    it('partialize не должен модифицировать оригинальное состояние', () => {
        const config = createPersistConfig<State>('immutability', ['token']);

        const fullState: State = {
            token: 'secure',
            theme: 'dark',
            counter: 123,
        };

        const clone = structuredClone(fullState);

        (config.partialize as Function)(fullState);

        expect(fullState).toEqual(clone);
    });
});
