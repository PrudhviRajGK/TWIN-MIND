import { render, screen, fireEvent } from '@testing-library/react';
import SuggestionsPanel from '../SuggestionsPanel';
import { useSuggestions } from '@/hooks/useSuggestions';
import { useAppContext } from '../AppProvider';

jest.mock('@/hooks/useSuggestions');
jest.mock('../AppProvider');

describe('SuggestionsPanel', () => {
  const mockRefresh = jest.fn();
  const mockSendChatMessage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useSuggestions as jest.Mock).mockReturnValue({
      batches: [],
      isLoading: false,
      error: null,
      refresh: mockRefresh,
    });

    (useAppContext as jest.Mock).mockReturnValue({
      sendChatMessage: mockSendChatMessage,
    });
  });

  it('should render panel with header', () => {
    render(<SuggestionsPanel />);
    
    expect(screen.getByText('2. Live Suggestions')).toBeInTheDocument();
    expect(screen.getByText('Auto refresh every 30 seconds')).toBeInTheDocument();
  });

  it('should show empty state when no suggestions', () => {
    render(<SuggestionsPanel />);
    
    expect(screen.getByText('Suggestions appear here once recording starts.')).toBeInTheDocument();
  });

  it('should render refresh button', () => {
    render(<SuggestionsPanel />);
    
    const button = screen.getByRole('button', { name: /reload suggestions/i });
    expect(button).toBeInTheDocument();
  });

  it('should call refresh when button clicked', () => {
    render(<SuggestionsPanel />);
    
    const button = screen.getByRole('button', { name: /reload suggestions/i });
    fireEvent.click(button);

    expect(mockRefresh).toHaveBeenCalled();
  });

  it('should disable refresh button when loading', () => {
    (useSuggestions as jest.Mock).mockReturnValue({
      batches: [],
      isLoading: true,
      error: null,
      refresh: mockRefresh,
    });

    render(<SuggestionsPanel />);
    
    const button = screen.getByRole('button', { name: /reload suggestions/i });
    expect(button).toBeDisabled();
  });

  it('should display suggestion batches', () => {
    (useSuggestions as jest.Mock).mockReturnValue({
      batches: [
        {
          id: 'batch-1',
          createdAt: new Date(),
          suggestions: [
            {
              id: 'sug-1',
              type: 'question',
              title: 'Test Question',
              preview: 'This is a test preview',
            },
          ],
        },
      ],
      isLoading: false,
      error: null,
      refresh: mockRefresh,
    });

    render(<SuggestionsPanel />);
    
    expect(screen.getByText('Test Question')).toBeInTheDocument();
    expect(screen.getByText('This is a test preview')).toBeInTheDocument();
    expect(screen.getByText('Latest suggestions')).toBeInTheDocument();
  });

  it('should send suggestion to chat when clicked', () => {
    (useSuggestions as jest.Mock).mockReturnValue({
      batches: [
        {
          id: 'batch-1',
          createdAt: new Date(),
          suggestions: [
            {
              id: 'sug-1',
              type: 'question',
              title: 'Test Question',
              preview: 'Test preview',
            },
          ],
        },
      ],
      isLoading: false,
      error: null,
      refresh: mockRefresh,
    });

    render(<SuggestionsPanel />);
    
    const suggestionButton = screen.getByText('Test Question').closest('button');
    fireEvent.click(suggestionButton!);

    expect(mockSendChatMessage).toHaveBeenCalledWith('Test Question\n\nTest preview');
  });

  it('should display error banner when error occurs', () => {
    (useSuggestions as jest.Mock).mockReturnValue({
      batches: [],
      isLoading: false,
      error: 'Failed to generate suggestions',
      refresh: mockRefresh,
    });

    render(<SuggestionsPanel />);
    
    expect(screen.getByText('Failed to generate suggestions')).toBeInTheDocument();
  });

  it('should show loading spinner when loading', () => {
    (useSuggestions as jest.Mock).mockReturnValue({
      batches: [],
      isLoading: true,
      error: null,
      refresh: mockRefresh,
    });

    render(<SuggestionsPanel />);
    
    // Check for spinner by looking for the SVG element
    const spinner = screen.getByRole('button', { name: /reload suggestions/i }).querySelector('svg');
    expect(spinner).toHaveClass('animate-spin');
  });

  it('should display multiple suggestion types correctly', () => {
    (useSuggestions as jest.Mock).mockReturnValue({
      batches: [
        {
          id: 'batch-1',
          createdAt: new Date(),
          suggestions: [
            {
              id: 'sug-1',
              type: 'question',
              title: 'Question',
              preview: 'Preview 1',
            },
            {
              id: 'sug-2',
              type: 'talking_point',
              title: 'Talking Point',
              preview: 'Preview 2',
            },
            {
              id: 'sug-3',
              type: 'fact_check',
              title: 'Fact Check',
              preview: 'Preview 3',
            },
          ],
        },
      ],
      isLoading: false,
      error: null,
      refresh: mockRefresh,
    });

    render(<SuggestionsPanel />);
    
    expect(screen.getByText('Question')).toBeInTheDocument();
    expect(screen.getByText('Talking Point')).toBeInTheDocument();
    expect(screen.getByText('Fact Check')).toBeInTheDocument();
  });
});
