import { render, screen, fireEvent } from '@testing-library/react';
import { FileUploadSection } from './FileUploadSection';
import { describe, expect, it, vi } from 'vitest';
import { AnalysisStatus } from '@app-types/analysis';

describe('FileUploadSection', () => {
    const file = new File(['csv content'], 'test.csv', { type: 'text/csv' });
    const onFileSelect = vi.fn();
    const onSend = vi.fn();
    const onClear = vi.fn();

    const defaultProps = {
        file: null,
        status: 'idle' as AnalysisStatus,
        error: null,
        onFileSelect,
        onSend,
        onClear,
    };

    it('рендерит Dropzone всегда', () => {
        render(<FileUploadSection {...defaultProps} />);
        expect(screen.getByTestId('dropzone')).toBeInTheDocument();
    });

    it('не рендерит кнопку "Отправить", если file = null', () => {
        render(<FileUploadSection {...defaultProps} />);
        expect(screen.queryByRole('button', { name: /отправить/i })).not.toBeInTheDocument();
    });

    it('рендерит кнопку "Отправить", если file задан и статус не completed/processing', () => {
        render(<FileUploadSection {...defaultProps} file={file} status="idle" />);
        expect(screen.getByRole('button', { name: /отправить/i })).toBeInTheDocument();
    });

    it('не рендерит кнопку "Отправить", если статус processing', () => {
        render(<FileUploadSection {...defaultProps} file={file} status="processing" />);
        expect(screen.queryByRole('button', { name: /отправить/i })).not.toBeInTheDocument();
    });

    it('не рендерит кнопку "Отправить", если статус completed', () => {
        render(<FileUploadSection {...defaultProps} file={file} status="completed" />);
        expect(screen.queryByRole('button', { name: /отправить/i })).not.toBeInTheDocument();
    });

    it('клик по кнопке вызывает onSend', () => {
        render(<FileUploadSection {...defaultProps} file={file} status="idle" />);
        fireEvent.click(screen.getByRole('button', { name: /отправить/i }));
        expect(onSend).toHaveBeenCalled();
    });
});
