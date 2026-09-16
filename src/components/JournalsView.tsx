import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Tag,
  Calendar,
  Sparkles,
  Filter,
  Mic,
  Camera,
  Trash2,
  FileText,
  MessageSquare,
} from 'lucide-react';
import { JournalEntry, JournalStyle, PaperTheme } from '../types';
import { DeleteJournalModal } from './DeleteJournalModal';

interface JournalsViewProps {
  journals: JournalEntry[];
  onSelectJournal: (entry: JournalEntry) => void;
  onDeleteJournal: (id: string) => void;
  onNavigateToChats: () => void;
}

const THEME_CARD_STYLES: Record<
  PaperTheme,
  {
    bg: string;
    border: string;
    text: string;
    badgeBg: string;
    badgeText: string;
    accent: string;
  }
> = {
  parchment: {
    bg: 'bg-[#faf4e6]',
    border: 'border-[#e4dac1]',
    text: 'text-stone-900',
    badgeBg: 'bg-amber-100/90',
    badgeText: 'text-amber-900',
    accent: 'text-amber-800',
  },
  notebook: {
    bg: 'bg-[#fffef8]',
    border: 'border-sky-200',
    text: 'text-stone-900',
    badgeBg: 'bg-sky-100',
    badgeText: 'text-sky-900',
    accent: 'text-sky-700',
  },
  botanical: {
    bg: 'bg-[#f3f7f3]',
    border: 'border-emerald-200',
    text: 'text-stone-900',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-900',
    accent: 'text-emerald-700',
  },
  midnight: {
    bg: 'bg-[#151921]',
    border: 'border-stone-800',
    text: 'text-stone-100',
    badgeBg: 'bg-stone-800',
    badgeText: 'text-amber-300',
    accent: 'text-amber-400',
  },
  minimal_white: {
    bg: 'bg-white',
    border: 'border-stone-200',
    text: 'text-stone-900',
    badgeBg: 'bg-stone-100',
    badgeText: 'text-stone-800',
    accent: 'text-stone-700',
  },
};

export const JournalsView: React.FC<JournalsViewProps> = ({
  journals,
  onSelectJournal,
  onDeleteJournal,
  onNavigateToChats,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [journalToDelete, setJournalToDelete] = useState<JournalEntry | null>(null);

  // Collect all unique tags
  const allTags = Array.from(
    new Set(journals.flatMap((j) => j.tags || []))
  ).filter(Boolean);

  const filteredJournals = journals.filter((j) => {
    const matchesSearch =
      searchQuery === '' ||
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.narrativeText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.contactName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag = selectedTag === 'all' || j.tags.includes(selectedTag);
    const matchesTheme = selectedTheme === 'all' || (j.paperTheme || 'parchment') === selectedTheme;

    return matchesSearch && matchesTag && matchesTheme;
  });

  return (
    <div id="journals-view-container" className="h-full flex flex-col bg-stone-100 overflow-y-auto">
      {/* Top Header */}
      <div className="bg-[#008069] text-white px-4 sm:px-6 py-6 shadow-sm">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen size={24} />
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Your Journal Vault</h1>
            </div>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1">
              Thoughtful entries, reflections, and genuine memories compiled from your conversations.
            </p>
          </div>

          <button
            type="button"
            onClick={onNavigateToChats}
            className="self-start sm:self-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
          >
            <Sparkles size={14} />
            <span>Chat to Create More</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border-b border-stone-200 px-4 sm:px-6 py-3 sticky top-0 z-10 shadow-2xs">
        <div className="max-w-5xl mx-auto space-y-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search journal titles, narratives, feelings, or tags..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-100 border border-transparent focus:border-emerald-500 focus:bg-white text-sm outline-hidden transition"
            />
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-stone-400 font-medium flex items-center gap-1">
              <Filter size={12} /> Paper Theme:
            </span>
            {['all', 'parchment', 'notebook', 'botanical', 'midnight', 'minimal_white'].map((th) => (
              <button
                key={th}
                type="button"
                onClick={() => setSelectedTheme(th)}
                className={`px-2.5 py-1 rounded-full capitalize transition ${
                  selectedTheme === th
                    ? 'bg-emerald-700 text-white font-medium shadow-2xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                }`}
              >
                {th.replace('_', ' ')}
              </button>
            ))}

            {allTags.length > 0 && (
              <div className="flex items-center gap-1.5 ml-auto overflow-x-auto no-scrollbar">
                <span className="text-stone-400 font-medium">Tag:</span>
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="bg-stone-100 border border-stone-200 rounded-lg px-2 py-1 text-xs text-stone-700 outline-hidden"
                >
                  <option value="all">All Tags</option>
                  {allTags.map((t) => (
                    <option key={t} value={t}>
                      #{t}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Journal Content Grid */}
      <div className="max-w-5xl mx-auto w-full p-4 sm:p-6 flex-1">
        {filteredJournals.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center max-w-md mx-auto my-12 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <BookOpen size={28} />
            </div>
            <h3 className="font-bold text-stone-800 text-base mb-1">
              {journals.length === 0 ? 'Your Journal Vault is Empty' : 'No matching entries found'}
            </h3>
            <p className="text-stone-500 text-xs sm:text-sm mb-6 leading-relaxed">
              {journals.length === 0
                ? "Start chatting or select messages in any conversation and click 'Make it into a Journal' to weave authentic diary entries."
                : 'Try clearing your search filters to find other preserved memories.'}
            </p>
            <button
              type="button"
              onClick={onNavigateToChats}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              Open Conversations
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredJournals.map((journal) => {
              const theme = THEME_CARD_STYLES[journal.paperTheme || 'parchment'] || THEME_CARD_STYLES.parchment;
              const hasVoice = journal.rawMessages?.some((m) => m.mediaType === 'voice');
              const hasPhotos = journal.rawMessages?.some((m) => m.mediaType === 'image');
              const isHandwritten = journal.fontFamily === 'handwritten';

              return (
                <div
                  key={journal.id}
                  id={`journal-card-${journal.id}`}
                  onClick={() => onSelectJournal(journal)}
                  className={`${theme.bg} rounded-2xl border ${theme.border} shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col overflow-hidden group relative`}
                >
                  {/* Subtle simulated notebook ruling lines if notebook */}
                  {journal.paperTheme === 'notebook' && (
                    <div
                      className="absolute inset-0 pointer-events-none opacity-40"
                      style={{
                        backgroundImage:
                          'repeating-linear-gradient(transparent, transparent 23px, rgba(65, 105, 225, 0.15) 23px, rgba(65, 105, 225, 0.15) 24px)',
                        backgroundPosition: '0 20px',
                      }}
                    />
                  )}

                  {/* Card Cover or Polaroid Header */}
                  {journal.coverImage ? (
                    <div className="h-44 w-full overflow-hidden relative bg-stone-200">
                      <img
                        src={journal.coverImage}
                        alt={journal.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                        <span className="font-semibold">{journal.date}</span>
                        <span className="bg-black/40 px-2 py-0.5 rounded-full text-[10px] backdrop-blur-xs">
                          {journal.journalMode === 'raw_chat' ? 'Transcript' : 'Diary Entry'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 pb-2 flex items-center justify-between border-b border-black/5">
                      <span className="text-xs font-mono font-semibold opacity-70">
                        {journal.date}
                      </span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${theme.badgeBg} ${theme.badgeText}`}>
                        {journal.mood || 'Reflection'}
                      </span>
                    </div>
                  )}

                  {/* Card Main Body */}
                  <div className={`p-4 flex-1 flex flex-col justify-between ${theme.text} relative z-1`}>
                    <div>
                      {/* Meta chips */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className="text-[11px] font-semibold opacity-75 truncate">
                          with {journal.contactName || 'Companion'}
                        </span>

                        <div className="flex items-center gap-1 text-[11px] opacity-60 shrink-0">
                          {hasVoice && <Mic size={12} className="text-emerald-600" />}
                          {hasPhotos && <Camera size={12} className="text-sky-600" />}
                          <span>{journal.rawMessages?.length || 0} msgs</span>
                        </div>
                      </div>

                      {/* Title in font */}
                      <h3
                        className="font-bold text-lg leading-snug line-clamp-2 mb-2 group-hover:text-emerald-700 transition"
                        style={{
                          fontFamily: isHandwritten
                            ? "'Caveat', cursive"
                            : journal.fontFamily === 'typewriter'
                            ? "'Special Elite', monospace"
                            : journal.fontFamily === 'literary_serif'
                            ? "'Cormorant Garamond', Georgia, serif"
                            : journal.fontFamily === 'editorial'
                            ? "'Playfair Display', serif"
                            : 'inherit',
                          fontSize: isHandwritten ? '22px' : '17px',
                        }}
                      >
                        {journal.title}
                      </h3>

                      {/* Snippet */}
                      <p
                        className="text-xs leading-relaxed line-clamp-3 opacity-80"
                        style={{
                          fontFamily: isHandwritten
                            ? "'Caveat', cursive"
                            : journal.fontFamily === 'typewriter'
                            ? "'Special Elite', monospace"
                            : 'inherit',
                          fontSize: isHandwritten ? '16px' : '12px',
                        }}
                      >
                        {journal.narrativeText}
                      </p>
                    </div>

                    {/* Card Footer */}
                    <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-[11px]">
                      <div className="flex flex-wrap gap-1">
                        {journal.tags.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${theme.badgeBg} ${theme.badgeText}`}
                          >
                            #{t}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setJournalToDelete(journal);
                          }}
                          className="opacity-40 hover:opacity-100 hover:text-rose-600 p-1.5 rounded-full hover:bg-rose-50 transition cursor-pointer"
                          title="Delete journal entry"
                        >
                          <Trash2 size={14} />
                        </button>

                        <span className="font-semibold text-emerald-700 group-hover:translate-x-0.5 transition">
                          Open →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Robust, in-app Delete Journal Modal */}
      <DeleteJournalModal
        isOpen={!!journalToDelete}
        journal={journalToDelete}
        onClose={() => setJournalToDelete(null)}
        onConfirmDelete={(id) => {
          onDeleteJournal(id);
          setJournalToDelete(null);
        }}
      />
    </div>
  );
};
