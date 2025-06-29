import { render, screen } from '@testing-library/react';
import { HighlightsSection } from './HighlightsSection';
import type { AnalysisHighlight } from '@app-types/analysis';
import { describe, expect, it } from 'vitest';

describe('HighlightsSection', () => {
    const mockHighlights: AnalysisHighlight[] = [
        {
            title: 'Максимальные траты',
            description: 'Цивилизация Альфа потратила 9000 единиц',
        },
        {
            title: 'Минимальные траты',
            description: 'Цивилизация Омега потратила 100 единиц',
        },
    ];

    it('отображает заглушку при пустом списке', () => {
        render(<HighlightsSection highlights={[]} />);
        expect(screen.getByText(/здесь появятся хайлайты/i)).toBeInTheDocument();
    });

    it('рендерит HighlightCard для каждого элемента', () => {
        render(<HighlightsSection highlights={mockHighlights} />);
        for (const h of mockHighlights) {
            expect(screen.getByText(h.title)).toBeInTheDocument();
            expect(screen.getByText(h.description)).toBeInTheDocument();
        }
    });
});
