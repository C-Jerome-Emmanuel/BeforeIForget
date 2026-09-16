import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  BookOpen,
  Calendar,
  Tag,
  Palette,
  Type,
  FileText,
  MessageSquare,
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  JournalStyle,
  Message,
  JournalEntry,
  UserProfile,
  PaperTheme,
  JournalFont,
  JournalCompilationMode,
} from '../types';

interface CreateJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableMessages: Message[]; // All messages from current conversation
  initialSelectedIds: string[]; // Initially checked message IDs
  contactName: string;
  contactId: string;
  onSave: (entry: JournalEntry) => void;
  profile: UserProfile;
}

const STYLE_OPTIONS: { id: JournalStyle; name: string; icon: string }[] = [
  { id: 'scrapbook', name: 'Scrapbook & Polaroid', icon: '🎨' },
  { id: 'letter_diary', name: 'Handwritten Letterhead', icon: '✍️' },
  { id: 'minimalist', name: 'Literary Book Page', icon: '📜' },
  { id: 'timeline', name: 'Journey Timeline', icon: '⏳' },
  { id: 'chat_scroll', name: 'WhatsApp Memory Strip', icon: '💬' },
  { id: 'dark_moody', name: 'Midnight Musing', icon: '🌙' },
];

const FONT_OPTIONS: { id: JournalFont; name: string; sample: string; cssFont: string }[] = [
  { id: 'handwritten', name: 'Handwritten Script', sample: 'Dear Diary...', cssFont: "'Caveat', cursive" },
  { id: 'typewriter', name: 'Vintage Typewriter', sample: 'OCTOBER 14...', cssFont: "'Special Elite', monospace" },
  { id: 'literary_serif', name: 'Literary Book Serif', sample: 'Chapter One...', cssFont: "'Cormorant Garamond', Georgia, serif" },
  { id: 'editorial', name: 'Editorial Display', sample: 'The Golden Hour...', cssFont: "'Playfair Display', serif" },
  { id: 'sans', name: 'Modern Clean', sample: 'Notes & moments...', cssFont: "'Plus Jakarta Sans', sans-serif" },
];

const PAPER_THEMES: { id: PaperTheme; name: string; bgClass: string; borderClass: string }[] = [
  { id: 'parchment', name: 'Aged Parchment', bgClass: 'bg-[#faf5ea]', borderClass: 'border-[#e8dfcd]' },
  { id: 'notebook', name: 'Ruled Notebook', bgClass: 'bg-[#fffdf7]', borderClass: 'border-sky-200' },
  { id: 'botanical', name: 'Botanical Sage', bgClass: 'bg-[#f4f7f4]', borderClass: 'border-emerald-200' },
  { id: 'midnight', name: 'Midnight Velvet', bgClass: 'bg-[#181d24]', borderClass: 'border-stone-700 text-stone-200' },
  { id: 'minimal_white', name: 'Crisp Linen', bgClass: 'bg-white', borderClass: 'border-stone-200' },
];

const MOOD_PRESETS = [
  '☕ Warm & Cozy',
  '🌿 Peaceful & Grounded',
  '💭 Deeply Reflective',
  '✨ Joyful & Excited',
  '🌧️ Melancholy & Honest',
  '💡 Inspired Breakthrough',
  '❤️ Tender & Grateful',
];

export const CreateJournalModal: React.FC<CreateJournalModalProps> = ({
  isOpen,
  onClose,
  availableMessages,
  initialSelectedIds,
  contactName,
  contactId,
  onSave,
  profile,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(initialSelectedIds.length > 0 ? initialSelectedIds : availableMessages.slice(-5).map((m) => m.id))
  );
  const [showTextSelector, setShowTextSelector] = useState(false);
  const [compilationMode, setCompilationMode] = useState<JournalCompilationMode>('literary_journal');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(
    new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  );
  const [style, setStyle] = useState<JournalStyle>('letter_diary');
  const [paperTheme, setPaperTheme] = useState<PaperTheme>('parchment');
  const [fontFamily, setFontFamily] = useState<JournalFont>('handwritten');
  const [narrativeText, setNarrativeText] = useState('');
  const [mood, setMood] = useState('💭 Deeply Reflective');
  const [location, setLocation] = useState('');
  const [tagsInput, setTagsInput] = useState(`memories, ${contactName.toLowerCase()}, life`);
  const [isGenerating, setIsGenerating] = useState(false);

  // Sync selected messages
  const selectedMessages = availableMessages.filter((m) => selectedIds.has(m.id));

  // Initialize or re-populate when messages or modal opens
  useEffect(() => {
    if (isOpen) {
      const currentSelected = availableMessages.filter((m) =>
        selectedIds.has(m.id)
      );
      if (!title) {
        setTitle(`Memories with ${contactName}`);
      }
      if (!narrativeText && currentSelected.length > 0) {
        generateSmartJournal(currentSelected, compilationMode);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleMessageSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      if (next.size > 1) {
        next.delete(id);
      }
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(availableMessages.map((m) => m.id)));
  };

  const generateSmartJournal = async (
    msgsToUse = selectedMessages,
    mode = compilationMode
  ) => {
    if (msgsToUse.length === 0) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/journal/generate-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName,
          messages: msgsToUse,
          preferredStyle: style,
          journalMode: mode,
          customApiKey: profile.customApiKey,
          privacyMode: profile.aiPrivacyMode,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.title) setTitle(data.title);
        if (data.narrativeText) setNarrativeText(data.narrativeText);
        if (data.mood) setMood(data.mood);
        if (data.tags && Array.isArray(data.tags)) {
          setTagsInput(data.tags.join(', '));
        }
      }
    } catch (err) {
      console.error('Failed to generate journal:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleModeChange = (mode: JournalCompilationMode) => {
    setCompilationMode(mode);
    generateSmartJournal(selectedMessages, mode);
  };

  const firstPhoto = selectedMessages.find((m) => m.mediaType === 'image')?.mediaUrl;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newEntry: JournalEntry = {
      id: 'journal_' + Date.now(),
      contactId,
      contactName,
      title: title.trim() || `Memories with ${contactName}`,
      date,
      tags: tags.length > 0 ? tags : ['journal'],
      style,
      paperTheme,
      fontFamily,
      journalMode: compilationMode,
      narrativeText: narrativeText.trim(),
      messageIds: selectedMessages.map((m) => m.id),
      rawMessages: selectedMessages,
      mood,
      location: location.trim() || undefined,
      coverImage: firstPhoto,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newEntry);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div
        id="create-journal-modal"
        className="bg-stone-50 rounded-2xl shadow-2xl max-w-3xl w-full my-auto overflow-hidden border border-stone-300 flex flex-col max-h-[95vh]"
      >
        {/* Header */}
        <div className="bg-[#008069] text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <BookOpen size={20} />
            <div>
              <h2 className="font-bold text-base sm:text-lg leading-tight">Make it into a Journal</h2>
              <p className="text-emerald-100 text-xs">
                Craft an authentic personal journal entry from your conversation with {contactName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-white/15 rounded-full transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleFormSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 text-stone-800 flex-1">
          {/* 1. TEXT SELECTION BAR */}
          <div className="bg-white rounded-xl border border-stone-200 p-3.5 shadow-xs">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                  {selectedIds.size}
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-stone-900">
                    {selectedIds.size} Texts Selected to Compile
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Choose which messages from this thread belong in this memory.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowTextSelector(!showTextSelector)}
                  className="px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 rounded-lg transition flex items-center gap-1 border border-emerald-200"
                >
                  <span>{showTextSelector ? 'Done Picking' : 'Choose Texts'}</span>
                  {showTextSelector ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>
            </div>

            {/* Expandable message selector checkboxes */}
            {showTextSelector && (
              <div className="mt-3 pt-3 border-t border-stone-100 space-y-1.5 max-h-52 overflow-y-auto pr-1 animate-in fade-in">
                <div className="flex items-center justify-between pb-1 text-[11px] text-stone-500">
                  <span>Click to check or uncheck individual texts:</span>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-emerald-700 hover:underline font-semibold"
                  >
                    Select All ({availableMessages.length})
                  </button>
                </div>
                {availableMessages.map((msg) => {
                  const isChecked = selectedIds.has(msg.id);
                  const isUser = msg.sender === 'user';
                  return (
                    <label
                      key={msg.id}
                      className={`flex items-start gap-2.5 p-2 rounded-lg text-xs cursor-pointer transition border ${
                        isChecked
                          ? 'bg-emerald-50/70 border-emerald-200 text-stone-900'
                          : 'bg-stone-50/50 border-stone-100 text-stone-500 hover:bg-stone-100/70'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleMessageSelect(msg.id)}
                        className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                          <span className={isUser ? 'text-emerald-700' : 'text-stone-700'}>
                            {isUser ? 'You' : contactName}
                          </span>
                          <span className="text-stone-400 font-normal text-[10px]">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="truncate mt-0.5 font-sans">
                          {msg.mediaType === 'image'
                            ? '📷 [Photo Attached]'
                            : msg.mediaType === 'voice'
                            ? '🎙️ [Voice Note]'
                            : msg.text}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. COMPILATION MODE: Proper Journal vs. Raw Transcript */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Compilation Mode:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleModeChange('literary_journal')}
                className={`p-3 rounded-xl border text-left transition relative flex items-start gap-2.5 ${
                  compilationMode === 'literary_journal'
                    ? 'border-emerald-600 bg-white ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-stone-200 bg-white/70 hover:bg-white text-stone-600'
                }`}
              >
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
                  <BookOpen size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-stone-900">
                    Proper Literary Journal Entry
                  </h4>
                  <p className="text-[11.5px] text-stone-500 mt-0.5 leading-relaxed">
                    Weaves feelings, thoughts, and moments into genuine, reflective first-person diary prose.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('raw_chat')}
                className={`p-3 rounded-xl border text-left transition relative flex items-start gap-2.5 ${
                  compilationMode === 'raw_chat'
                    ? 'border-emerald-600 bg-white ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-stone-200 bg-white/70 hover:bg-white text-stone-600'
                }`}
              >
                <div className="p-2 rounded-lg bg-stone-100 text-stone-700 shrink-0 mt-0.5">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-stone-900">
                    Raw Chat Transcript Record
                  </h4>
                  <p className="text-[11.5px] text-stone-500 mt-0.5 leading-relaxed">
                    Preserves the verbatim message lines and back-and-forth chat text without rewriting.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* 3. AESTHETIC CUSTOMIZATION: Font & Paper Theme */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Font Picker */}
            <div className="bg-white rounded-xl border border-stone-200 p-3.5 shadow-xs space-y-2">
              <label className="block text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <Type size={14} className="text-emerald-600" />
                <span>Journal Typography</span>
              </label>
              <div className="space-y-1.5">
                {FONT_OPTIONS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFontFamily(f.id)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg border text-xs flex items-center justify-between transition ${
                      fontFamily === f.id
                        ? 'border-emerald-600 bg-emerald-50 font-semibold text-emerald-950 ring-1 ring-emerald-500'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <span>{f.name}</span>
                    <span className="text-[13px] opacity-80" style={{ fontFamily: f.cssFont }}>
                      {f.sample}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Paper Theme Picker */}
            <div className="bg-white rounded-xl border border-stone-200 p-3.5 shadow-xs space-y-2">
              <label className="block text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <Palette size={14} className="text-emerald-600" />
                <span>Paper Canvas Theme</span>
              </label>
              <div className="space-y-1.5">
                {PAPER_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setPaperTheme(theme.id)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg border text-xs flex items-center gap-2.5 transition ${
                      paperTheme === theme.id
                        ? 'border-emerald-600 ring-1 ring-emerald-500 font-semibold text-stone-900 bg-emerald-50/50'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full border shadow-2xs ${theme.bgClass} ${theme.borderClass}`}
                    />
                    <span>{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. TITLE & DATE */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Journal Entry Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Whispers in the Conservatory"
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-sm font-semibold text-stone-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Date
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-sm text-stone-800 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden"
              />
            </div>
          </div>

          {/* 5. NARRATIVE PROSE TEXTAREA with Re-Weave Button */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-stone-700">
                Journal Narrative Prose
              </label>
              <button
                type="button"
                onClick={() => generateSmartJournal()}
                disabled={isGenerating}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Weaving journal entry...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={13} />
                    <span>Re-craft with AI</span>
                  </>
                )}
              </button>
            </div>

            <div
              className={`rounded-2xl border p-4 transition shadow-inner ${
                paperTheme === 'parchment'
                  ? 'bg-[#faf5ea] border-[#e8dfcd]'
                  : paperTheme === 'notebook'
                  ? 'bg-[#fffdf7] border-sky-200'
                  : paperTheme === 'botanical'
                  ? 'bg-[#f4f7f4] border-emerald-200'
                  : paperTheme === 'midnight'
                  ? 'bg-[#181d24] text-stone-100 border-stone-700'
                  : 'bg-white border-stone-300'
              }`}
            >
              <textarea
                rows={6}
                required
                value={narrativeText}
                onChange={(e) => setNarrativeText(e.target.value)}
                placeholder="The story and thoughts of this day..."
                style={{
                  fontFamily:
                    fontFamily === 'handwritten'
                      ? "'Caveat', cursive"
                      : fontFamily === 'typewriter'
                      ? "'Special Elite', monospace"
                      : fontFamily === 'literary_serif'
                      ? "'Cormorant Garamond', Georgia, serif"
                      : fontFamily === 'editorial'
                      ? "'Playfair Display', serif"
                      : "'Plus Jakarta Sans', sans-serif",
                  fontSize: fontFamily === 'handwritten' ? '20px' : '15px',
                  lineHeight: '1.7',
                }}
                className="w-full bg-transparent border-none outline-hidden resize-y text-stone-800 focus:text-stone-900"
              />
            </div>
          </div>

          {/* 6. MOOD PRESETS & TAGS */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-700">
              Mood & Atmosphere
            </label>
            <div className="flex flex-wrap gap-1.5">
              {MOOD_PRESETS.map((mPreset) => (
                <button
                  key={mPreset}
                  type="button"
                  onClick={() => setMood(mPreset)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                    mood === mPreset
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
                  }`}
                >
                  {mPreset}
                </button>
              ))}
            </div>
          </div>

          {/* Layout Style Choice */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Visual Page Style
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {STYLE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setStyle(opt.id)}
                  className={`text-left p-2.5 rounded-xl border text-xs transition flex items-center gap-2 ${
                    style === opt.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-500'
                      : 'border-stone-200 hover:bg-white bg-white/70 text-stone-700'
                  }`}
                >
                  <span className="text-base">{opt.icon}</span>
                  <span className="truncate">{opt.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-600 hover:bg-stone-200/60 rounded-xl text-xs sm:text-sm font-semibold transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isGenerating || selectedMessages.length === 0}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition flex items-center gap-2"
            >
              <CheckCircle2 size={16} />
              <span>Save to Journal Vault</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
