import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeneratePage } from './GeneratePage';

beforeEach(() => {
    vi.resetAllMocks();
    vi.restoreAllMocks();

    // замена глобальных объектов
    global.fetch = vi.fn();
    URL.createObjectURL = vi.fn(() => 'blob:url') as typeof URL.createObjectURL;
    URL.revokeObjectURL = vi.fn();
});

describe('<GeneratePage />', () => {
    it('успешно загружает и показывает сообщение', async () => {
        const blob = new Blob(['test'], { type: 'text/csv' });

        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            headers: new Headers({ 'Content-Disposition': 'attachment; filename="report.csv"' }),
            blob: () => Promise.resolve(blob),
        } as Response);

        render(<GeneratePage />);
        fireEvent.click(screen.getByRole('button', { name: /начать генерацию/i }));

        await waitFor(() => {
            expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
        });

        expect(await screen.findByText(/отчёт успешно сгенерирован/i)).toBeInTheDocument();
        expect(URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('использует fallback имя файла, если нет Content-Disposition', async () => {
        const blob = new Blob(['test'], { type: 'text/csv' });

        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            headers: new Headers(), // нет Content-Disposition
            blob: () => Promise.resolve(blob),
        } as Response);

        // Перехват создания <a>
        const createElement = vi.spyOn(document, 'createElement');
        render(<GeneratePage />);
        fireEvent.click(screen.getByRole('button', { name: /начать генерацию/i }));

        await waitFor(() => {
            expect(createElement).toHaveBeenCalledWith('a');
        });
    });

    it('отображает ошибку при 500', async () => {
        vi.mocked(fetch).mockResolvedValue(
            new Response(JSON.stringify({ error: 'Server Error' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            })
        );

        render(<GeneratePage />);
        fireEvent.click(screen.getByRole('button', { name: /начать генерацию/i }));

        expect(await screen.findByText(/ошибка/i)).toBeInTheDocument();
    });

    it('отключает кнопку во время загрузки', async () => {
        let resolve!: (value: Response) => void;
        const fetchPromise = new Promise<Response>((r) => (resolve = r));
        vi.mocked(fetch).mockReturnValue(fetchPromise);

        render(<GeneratePage />);
        const button = screen.getByRole('button', { name: /начать генерацию/i });

        fireEvent.click(button);
        expect(button).toBeDisabled();

        resolve({
            ok: true,
            headers: new Headers(),
            blob: async () => new Blob(),
        } as Response);

        await waitFor(() => expect(button).not.toBeDisabled());
    });
});
