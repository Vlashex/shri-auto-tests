import { render, screen, fireEvent } from '@testing-library/react';
import { FileDisplay } from './FileDisplay';
import { describe, expect, it, vi } from 'vitest';

describe('FileDisplay', () => {
    const fileName = 'test.csv';
    const onClear = vi.fn();

    it('отображает имя файла', () => {
        render(<FileDisplay fileName={fileName} onClear={onClear} />);
        expect(screen.getByText(fileName)).toBeInTheDocument();
    });

    it('вызывает onClear при клике по кнопке', () => {
        render(<FileDisplay fileName={fileName} onClear={onClear} />);
        fireEvent.click(screen.getByTestId('clear'));
        expect(onClear).toHaveBeenCalled();
    });

    it('дизаблит кнопку при isProcessing = true', () => {
        render(<FileDisplay fileName={fileName} onClear={onClear} isProcessing />);
        expect(screen.getByTestId('clear')).toBeDisabled();
    });

    it('добавляет класс завершения при isCompleted = true', () => {
        render(<FileDisplay fileName={fileName} onClear={onClear} isCompleted />);
        const name = screen.getByText(fileName);
        expect(name.className).toMatch(/fileNameCompleted/);
    });
});
