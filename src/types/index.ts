export interface TranscriptEntry {
  id: string;
  timestamp: string;
  speaker: string;
  text: string;
  createdAt: Date;
}

export interface AudioChunk {
  id: string;
  blob: Blob;
  timestamp: Date;
  duration: number;
}

export interface RecordingError {
  type: 'permission' | 'network' | 'upload' | 'unknown';
  message: string;
}

export type SuggestionType = 
  | 'question' 
  | 'talking_point' 
  | 'answer' 
  | 'fact_check' 
  | 'clarification';

export interface Suggestion {
  id: string;
  type: SuggestionType;
  title: string;
  preview: string;
}

export interface SuggestionBatch {
  id: string;
  suggestions: Suggestion[];
  createdAt: Date;
}
