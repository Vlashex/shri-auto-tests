import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Dropzone } from './Dropzone';
import { isCsvFile } from '@utils/analysis';

vi.mock('@utils/analysis', () => ({
    isCsvFile: vi.fn(),
}));

vi.mock('../FileDisplay', () => ({
    FileDisplay: ({ fileName }: { fileName: string }) => <div>{fileName}</div>,
}));

const mockedIsCsvFile = isCsvFile as unknown as ReturnType<typeof vi.fn>;

const createFile = (name: string, type = 'text/csv') => new File(['content'], name, { type });

describe('<Dropzone />', () => {
    const baseProps = {
        file: null,
        status: 'idle' as const,
        error: null,
        onFileSelect: vi.fn(),
        onClear: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('рендерит кнопку загрузки по умолчанию', () => {
        render(<Dropzone {...baseProps} />);
        expect(screen.getByTestId('upload-button')).toHaveTextContent('Загрузить файл');
        expect(screen.getByText(/перетащите сюда/i)).toBeInTheDocument();
    });

    it('отображает Loader при статусе processing', () => {
        render(<Dropzone {...baseProps} status="processing" />);
        expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    it('отображает FileDisplay, если файл выбран', () => {
        const file = createFile('report.csv');
        render(<Dropzone {...baseProps} file={file} />);
        expect(screen.getByText('report.csv')).toBeInTheDocument();
    });

    it('клик по компоненту вызывает input.click() если нет файла и не processing', () => {
        const { container } = render(<Dropzone {...baseProps} />);
        const input = container.querySelector('input[type="file"]')! as HTMLInputElement;
        const spy = vi.spyOn(input, 'click');
        fireEvent.click(screen.getByTestId('upload-button'));
        expect(spy).toHaveBeenCalled();
    });

    it('drop с csv вызывает onFileSelect', () => {
        mockedIsCsvFile.mockReturnValue(true);

        render(<Dropzone {...baseProps} />);
        const dropzone = screen.getByTestId('upload-button');

        const file = createFile('data.csv');

        fireEvent.drop(dropzone, {
            dataTransfer: { files: [file] },
        });

        expect(baseProps.onFileSelect).toHaveBeenCalledWith(file);
    });

    it('drop с не-csv не вызывает onFileSelect и показывает ошибку', () => {
        mockedIsCsvFile.mockReturnValue(false);

        render(<Dropzone {...baseProps} />);
        const file = createFile('bad.txt', 'text/plain');

        fireEvent.drop(screen.getByTestId('upload-button'), {
            dataTransfer: { files: [file] },
        });

        expect(baseProps.onFileSelect).not.toHaveBeenCalled();
        expect(screen.getByText(/только \*\.csv/i)).toBeInTheDocument();
    });

    it('input[type=file] вызывает onFileSelect и очищается', () => {
        mockedIsCsvFile.mockReturnValue(true);

        const { container } = render(<Dropzone {...baseProps} />);
        const input = container.querySelector('input[type="file"]')! as HTMLInputElement;

        const file = createFile('upload.csv');
        fireEvent.change(input, {
            target: { files: [file] },
        });

        expect(baseProps.onFileSelect).toHaveBeenCalledWith(file);
        expect(input.value).toBe(''); // очищен
    });

    it('показывает ошибку из props.error', () => {
        render(<Dropzone {...baseProps} error="ошибка парсинга" />);
        expect(screen.getByText('ошибка парсинга')).toBeInTheDocument();
    });

    it('показывает "готово!" при статусе completed', () => {
        render(<Dropzone {...baseProps} status="completed" file={createFile('done.csv')} />);
        expect(screen.getByText('готово!')).toBeInTheDocument();
    });
});
