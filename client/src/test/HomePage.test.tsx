import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { HomePage } from '../pages/HomePage';

// Mock fetch
global.fetch = vi.fn();

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the main UI elements', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    // Check for main heading
    expect(screen.getByText('Online Coding Interview')).toBeInTheDocument();
    
    // Check for description
    expect(screen.getByText(/Real-time collaborative code editor/i)).toBeInTheDocument();
    
    // Check for create session button
    expect(screen.getByRole('button', { name: /Create New Session/i })).toBeInTheDocument();
    
    // Check for feature cards
    expect(screen.getByText('Real-time Sync')).toBeInTheDocument();
    expect(screen.getByText('Easy Sharing')).toBeInTheDocument();
    expect(screen.getByText('Multi-language')).toBeInTheDocument();
  });

  it('creates a session and navigates when clicking create button', async () => {
    const user = userEvent.setup();
    const mockSessionId = 'test-session-123';

    // Mock successful API response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ sessionId: mockSessionId }),
    });

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    const createButton = screen.getByRole('button', { name: /Create New Session/i });
    await user.click(createButton);

    // Wait for navigation
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(`/session/${mockSessionId}`);
    });
  });

  it('displays error message when session creation fails', async () => {
    const user = userEvent.setup();

    // Mock failed API response
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    const createButton = screen.getByRole('button', { name: /Create New Session/i });
    await user.click(createButton);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to create session/i)).toBeInTheDocument();
    });
  });
});
