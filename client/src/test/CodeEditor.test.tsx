import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CodeEditor } from '../components/CodeEditor';

describe('CodeEditor', () => {
  const mockOnChange = vi.fn();
  const mockOnLanguageChange = vi.fn();
  const mockOnRunCode = vi.fn();

  const defaultProps = {
    code: 'console.log("Hello, World!");',
    language: 'javascript',
    onChange: mockOnChange,
    onLanguageChange: mockOnLanguageChange,
    onRunCode: mockOnRunCode,
  };

  it('renders the editor component with language selector', () => {
    render(<CodeEditor {...defaultProps} />);

    // Check for editor heading
    expect(screen.getByText('Code Editor')).toBeInTheDocument();

    // Check for language selector
    const languageSelect = screen.getByRole('combobox');
    expect(languageSelect).toBeInTheDocument();
    expect(languageSelect).toHaveValue('javascript');

    // Check for Run button
    expect(screen.getByRole('button', { name: /Run Code/i })).toBeInTheDocument();
  });

  it('changes language when selector is changed', async () => {
    const user = userEvent.setup();
    render(<CodeEditor {...defaultProps} />);

    const languageSelect = screen.getByRole('combobox');
    await user.selectOptions(languageSelect, 'python');

    expect(mockOnLanguageChange).toHaveBeenCalledWith('python');
  });

  it('calls onRunCode when Run button is clicked', async () => {
    const user = userEvent.setup();
    render(<CodeEditor {...defaultProps} />);

    const runButton = screen.getByRole('button', { name: /Run Code/i });
    await user.click(runButton);

    expect(mockOnRunCode).toHaveBeenCalledTimes(1);
  });

  it('displays both JavaScript and Python language options', () => {
    render(<CodeEditor {...defaultProps} />);

    const languageSelect = screen.getByRole('combobox');
    const options = Array.from(languageSelect.querySelectorAll('option')).map(
      (option) => option.textContent
    );

    expect(options).toContain('JavaScript');
    expect(options).toContain('Python');
  });
});
