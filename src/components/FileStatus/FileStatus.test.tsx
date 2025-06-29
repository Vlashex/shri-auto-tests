import { render, screen } from '@testing-library/react';
import { FileStatus } from './FileStatus';
import { describe, expect, it } from 'vitest';

describe('FileStatus', () => {
    it('отображает статус успеха и иконку Smile', () => {
        render(<FileStatus type="success" isActive={false} />);
        expect(screen.getByText(/обработан успешно/i)).toBeInTheDocument();
        expect(screen.getByTestId('smile')).toBeInTheDocument(); // Иконка без role может потребовать hidden: true
    });

    it('отображает статус ошибки и иконку SmileSad', () => {
        render(<FileStatus type="error" isActive={false} />);
        expect(screen.getByText(/не удалось обработать/i)).toBeInTheDocument();
        expect(screen.getByTestId('smile-sad')).toBeInTheDocument();
    });

    it('добавляет класс .active при isActive = true', () => {
        const { container } = render(<FileStatus type="success" isActive={true} />);
        const root = container.querySelector('span');
        expect(root?.className).toMatch(/active/);
    });
});
