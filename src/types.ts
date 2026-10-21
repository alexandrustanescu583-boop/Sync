export type AssistantModeId = 'general' | 'search' | 'homework' | 'creative' | 'code' | 'game3d';
export type UserRole = 'fondator' | 'superuser' | 'teacher' | 'student';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  dailyMessageCount: number;
  lastMessageDate: string; // YYYY-MM-DD
  maxDailyMessages: number; // exactly 23
  createdAt: number;
}

export interface AssistantMode {
  id: AssistantModeId;
  name: string;
  shortDesc: string;
  badge: string;
  starterSuggestions: {
    title: string;
    prompt: string;
    icon: string;
  }[];
}

export interface VerificationCheck {
  title: string;
  passed: boolean;
  score: number;
  details: string;
}

export interface VerificationResult {
  check1: VerificationCheck;
  check2: VerificationCheck;
  overallConfidence: number;
  verdict: string;
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  verification?: VerificationResult;
  imageUrl?: string;
  sources?: GroundingSource[];
}

export interface ChatSession {
  id: string;
  title: string;
  mode: AssistantModeId;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface MemoryItem {
  id: string;
  text: string;
  createdAt: number;
}
