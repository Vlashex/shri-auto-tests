import { render, screen } from '@testing-library/react';
import { HighlightCard } from './HighlightCard';
import type { AnalysisHighlight } from '@app-types/analysis';
import { describe, expect, it } from 'vitest';

describe('HighlightCard', () => {
    const highlight: AnalysisHighlight = {
        title: 'Общие расходы',
        description: 'Всего было потрачено 10000 единиц',
    };

    it('отображает title и description', () => {
        render(<HighlightCard highlight={highlight} />);
        expect(screen.getByText(highlight.title)).toBeInTheDocument();
        expect(screen.getByText(highlight.description)).toBeInTheDocument();
    });

    it('применяет переданный className', () => {
        const { container } = render(<HighlightCard highlight={highlight} className="test-class" />);
        const root = container.firstChild as HTMLElement;
        expect(root.className).toMatch(/test-class/);
    });
});
