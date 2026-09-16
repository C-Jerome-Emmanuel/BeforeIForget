export type MediaType = 'text' | 'image' | 'voice';

export interface Reaction {
  emoji: string;
  sender: 'user' | 'companion';
}

export interface Message {
  id: string;
  contactId: string;
  sender: 'user' | 'companion';
  text: string;
  mediaType: MediaType;
  mediaUrl?: string; // base64 or blob url
  audioDuration?: number; // in seconds
  quotedMessageId?: string;
  reactions?: string[]; // e.g. ["❤️", "😂"]
  timestamp: string; // ISO string
  status: 'sent' | 'delivered' | 'read';
}

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  relationship: string; // e.g. "Best friend / Dating talk", "Club & Fitness", "Family", "Creative partner"
  tone: string; // e.g. "Casual, supportive bestie who says bro and matches your vibe", "Thoughtful listener", "Excited hype friend"
  about: string; // short status/bio
  lastActive: string;
  messageCountSinceReply: number;
  unreadCount: number;
}

export type JournalStyle =
  | 'scrapbook'
  | 'minimalist'
  | 'chat_scroll'
  | 'letter_diary'
  | 'timeline'
  | 'dark_moody';

export type PaperTheme = 'parchment' | 'notebook' | 'botanical' | 'midnight' | 'minimal_white';
export type JournalFont = 'handwritten' | 'typewriter' | 'literary_serif' | 'editorial' | 'sans';
export type JournalCompilationMode = 'literary_journal' | 'raw_chat';

export interface JournalEntry {
  id: string;
  contactId?: string;
  contactName?: string;
  title: string;
  date: string;
  tags: string[];
  style: JournalStyle;
  paperTheme?: PaperTheme;
  fontFamily?: JournalFont;
  journalMode?: JournalCompilationMode;
  narrativeText: string;
  messageIds: string[];
  rawMessages: Message[];
  mood?: string;
  location?: string;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventSuggestion {
  id: string;
  contactId: string;
  title: string;
  summary: string;
  dateRange: string;
  messageIds: string[];
  mood: string;
  suggestedTags: string[];
}

export type PersonalItemType = 'thought' | 'quote' | 'verse' | 'letter' | 'note';

export interface PersonalSpaceItem {
  id: string;
  type: PersonalItemType;
  title?: string;
  content: string;
  authorOrRef?: string;
  tags?: string[];
  unlockDate?: string; // for letters to future self
  isLocked?: boolean;
  colorTheme?: string;
  createdAt: string;
}

export interface UserProfile {
  email: string;
  name: string;
  avatar: string;
  statusText: string;
  aiPrivacyMode: 'built-in' | 'custom-key' | 'offline-mock';
  customApiKey?: string;
  disguiseModeEnabled: boolean; // disguise app as a standard messenger
  themePreference: 'light' | 'dark' | 'system';
  appLockPin?: string; // 4-digit PIN for session app lock
  appLockEnabled?: boolean; // whether app lock is active on open
}

export interface AppData {
  contacts: Contact[];
  messages: Record<string, Message[]>; // contactId -> messages
  journals: JournalEntry[];
  personalSpace: PersonalSpaceItem[];
  profile: UserProfile;
}
