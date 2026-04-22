import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TranscriptPanel from '../TranscriptPanel';
import { useTranscriptStore } from '@/store/useTranscriptStore';
import { useMicrophoneRecorder } from '@/hooks/useMicrophoneRecorder';

jest.mock('@/hooks/useMicrophoneRecorder');
jest.mock('@/store/useTranscriptStore');

describe('TranscriptPanel', () => {
  const mockStartRecording = jest.fn();
  const mockStopRecording = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useMicrophoneRecorder as jest.Mock).mockReturnValue({
      isRecording: false,
      error: null,
      startRecording: mockStartRecording,
      stopRecording: mockStopRecording,
      retryCount: 0,
    });

    (useTranscriptStore as unknown as jest.Mock).mockReturnValue({
      transcripts: [],
      isLoading: false,
      error: null,
    });
  });

  it('should render panel with header', () => {
    render(<TranscriptPanel />);
    
    expect(screen.getByText('1. Mic & Transcript')).toBeInTheDocument();
  });

  it('should show empty state when no transcripts', () => {
    render(<TranscriptPanel />);
    
    expect(screen.getByText('No transcript yet — start the mic.')).toBeInTheDocument();
  });

  it('should render mic button', () => {
    render(<TranscriptPanel />);
    
    const button = screen.getByRole('button', { name: /start recording/i });
    expect(button).toBeInTheDocument();
  });

  it('should start recording when mic button clicked', async () => {
    render(<TranscriptPanel />);
    
    const button = screen.getByRole('button', { name: /start recording/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockStartRecording).toHaveBeenCalled();
    });
  });

  it('should stop recording when button clicked while recording', async () => {
    (useMicrophoneRecorder as jest.Mock).mockReturnValue({
      isRecording: true,
      error: null,
      startRecording: mockStartRecording,
      stopRecording: mockStopRecording,
      retryCount: 0,
    });

    render(<TranscriptPanel />);
    
    const button = screen.getByRole('button', { name: /stop recording/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockStopRecording).toHaveBeenCalled();
    });
  });

  it('should show recording indicator when recording', () => {
    (useMicrophoneRecorder as jest.Mock).mockReturnValue({
      isRecording: true,
      error: null,
      startRecording: mockStartRecording,
      stopRecording: mockStopRecording,
      retryCount: 0,
    });

    render(<TranscriptPanel />);
    
    expect(screen.getByText('Recording')).toBeInTheDocument();
  });

  it('should show loading indicator when processing', () => {
    (useTranscriptStore as unknown as jest.Mock).mockReturnValue({
      transcripts: [],
      isLoading: true,
      error: null,
    });

    render(<TranscriptPanel />);
    
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('should display transcripts', () => {
    (useTranscriptStore as unknown as jest.Mock).mockReturnValue({
      transcripts: [
        {
          id: '1',
          timestamp: '00:30',
          speaker: 'user',
          text: 'Hello world',
          createdAt: new Date(),
        },
        {
          id: '2',
          timestamp: '01:00',
          speaker: 'user',
          text: 'Second message',
          createdAt: new Date(),
        },
      ],
      isLoading: false,
      error: null,
    });

    render(<TranscriptPanel />);
    
    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(screen.getByText('Second message')).toBeInTheDocument();
    expect(screen.getByText('[00:30]')).toBeInTheDocument();
    expect(screen.getByText('[01:00]')).toBeInTheDocument();
  });

  it('should display error banner when error occurs', () => {
    (useMicrophoneRecorder as jest.Mock).mockReturnValue({
      isRecording: false,
      error: {
        type: 'permission',
        message: 'Microphone permission denied',
      },
      startRecording: mockStartRecording,
      stopRecording: mockStopRecording,
      retryCount: 0,
    });

    render(<TranscriptPanel />);
    
    expect(screen.getByText('Microphone permission denied')).toBeInTheDocument();
  });

  it('should show retry count when retrying', () => {
    (useMicrophoneRecorder as jest.Mock).mockReturnValue({
      isRecording: true,
      error: null,
      startRecording: mockStartRecording,
      stopRecording: mockStopRecording,
      retryCount: 2,
    });

    (useTranscriptStore as unknown as jest.Mock).mockReturnValue({
      transcripts: [],
      isLoading: true,
      error: null,
    });

    render(<TranscriptPanel />);
    
    expect(screen.getByText('Retrying (2)...')).toBeInTheDocument();
  });
});
