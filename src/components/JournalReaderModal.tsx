import React, { useState } from 'react';
import {
  X,
  Palette,
  Type,
  BookOpen,
  Calendar,
  Tag,
  Printer,
  Copy,
  Check,
  MapPin,
  Heart,
  Clock,
  Sparkles,
  Edit3,
  Save,
  MessageSquare,
  Volume2,
  Trash2,
} from 'lucide-react';
import { JournalEntry, JournalStyle, PaperTheme, JournalFont } from '../types';
import { AudioPlayer } from './AudioPlayer';

interface JournalReaderModalProps {
  entry: JournalEntry;
  isOpen: boolean;
  onClose: () => void;
  onUpdateJournal: (updated: JournalEntry) => void;
  onDelete?: (id: string) => void;
}

const FONT_CLASSES: Record<JournalFont, { name: string; style: string }> = {
  handwritten: { name: 'Handwritten', style: "'Caveat', cursive" },
  typewriter: { name: 'Typewriter', style: "'Special Elite', monospace" },
  literary_serif: { name: 'Literary Serif', style: "'Cormorant Garamond', Georgia, serif" },
  editorial: { name: 'Editorial Serif', style: "'Playfair Display', serif" },
  sans: { name: 'Clean Sans', style: "'Plus Jakarta Sans', sans-serif" },
};

const THEME_STYLES: Record<
  PaperTheme,
  {
    name: string;
    bg: string;
    text: string;
    subtext: string;
    border: string;
    accent: string;
    tapeColor: string;
  }
> = {
  parchment: {
    name: 'Aged Parchment',
    bg: 'bg-[#faf4e6]',
    text: 'text-stone-900',
    subtext: 'text-stone-600',
    border: 'border-[#e4dac1]',
    accent: 'text-amber-800',
    tapeColor: 'bg-amber-200/80 border-amber-300',
  },
  notebook: {
    name: 'Ruled Notebook',
    bg: 'bg-[#fffef8]',
    text: 'text-stone-800',
    subtext: 'text-stone-500',
    border: 'border-sky-200',
    accent: 'text-sky-800',
    tapeColor: 'bg-sky-200/80 border-sky-300',
  },
  botanical: {
    name: 'Botanical Sage',
    bg: 'bg-[#f3f7f3]',
    text: 'text-stone-900',
    subtext: 'text-emerald-800',
    border: 'border-emerald-200',
    accent: 'text-emerald-800',
    tapeColor: 'bg-emerald-200/80 border-emerald-300',
  },
  midnight: {
    name: 'Midnight Velvet',
    bg: 'bg-[#15191f]',
    text: 'text-stone-100',
    subtext: 'text-stone-400',
    border: 'border-stone-800',
    accent: 'text-amber-400',
    tapeColor: 'bg-stone-700/80 border-stone-600',
  },
  minimal_white: {
    name: 'Crisp Linen',
    bg: 'bg-white',
    text: 'text-stone-900',
    subtext: 'text-stone-500',
    border: 'border-stone-200',
    accent: 'text-stone-700',
    tapeColor: 'bg-stone-200/80 border-stone-300',
  },
};

export const JournalReaderModal: React.FC<JournalReaderModalProps> = ({
  entry,
  isOpen,
  onClose,
  onUpdateJournal,
  onDelete,
}) => {
  const [currentStyle, setCurrentStyle] = useState<JournalStyle>(entry.style || 'scrapbook');
  const [currentTheme, setCurrentTheme] = useState<PaperTheme>(entry.paperTheme || 'parchment');
  const [currentFont, setCurrentFont] = useState<JournalFont>(entry.fontFamily || 'handwritten');
  const [showRuledLines, setShowRuledLines] = useState(entry.paperTheme === 'notebook');
  const [showRawChat, setShowRawChat] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(entry.title);
  const [editNarrative, setEditNarrative] = useState(entry.narrativeText);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen) return null;

  const handleSaveEdits = () => {
    const updated: JournalEntry = {
      ...entry,
      title: editTitle.trim() || entry.title,
      narrativeText: editNarrative.trim() || entry.narrativeText,
      style: currentStyle,
      paperTheme: currentTheme,
      fontFamily: currentFont,
      updatedAt: new Date().toISOString(),
    };
    onUpdateJournal(updated);
    setIsEditing(false);
  };

  const handleCopy = () => {
    const text = `${entry.title}\n${entry.date}\nMood: ${entry.mood || ''}\n\n${entry.narrativeText}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const themeConfig = THEME_STYLES[currentTheme] || THEME_STYLES.parchment;
  const fontConfig = FONT_CLASSES[currentFont] || FONT_CLASSES.handwritten;

  const photos = entry.rawMessages.filter((m) => m.mediaType === 'image' && m.mediaUrl);
  const voiceNotes = entry.rawMessages.filter((m) => m.mediaType === 'voice' && m.mediaUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div
        id="journal-reader-container"
        className="bg-stone-900 rounded-2xl shadow-2xl max-w-4xl w-full my-auto overflow-hidden border border-stone-800 flex flex-col max-h-[96vh]"
      >
        {/* Top Aesthetic Toolbar */}
        <div className="bg-stone-950 text-stone-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 shrink-0 select-none">
          {/* Customization Selectors */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Font Picker */}
            <div className="flex items-center gap-1 bg-stone-900 px-2.5 py-1 rounded-full border border-stone-800">
              <Type size={13} className="text-emerald-400" />
              <select
                value={currentFont}
                onChange={(e) => setCurrentFont(e.target.value as JournalFont)}
                className="bg-transparent text-stone-200 text-xs outline-hidden cursor-pointer"
              >
                {Object.entries(FONT_CLASSES).map(([key, val]) => (
                  <option key={key} value={key} className="bg-stone-900 text-white">
                    {val.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Paper Theme Picker */}
            <div className="flex items-center gap-1 bg-stone-900 px-2.5 py-1 rounded-full border border-stone-800">
              <Palette size={13} className="text-amber-400" />
              <select
                value={currentTheme}
                onChange={(e) => {
                  const t = e.target.value as PaperTheme;
                  setCurrentTheme(t);
                  if (t === 'notebook') setShowRuledLines(true);
                }}
                className="bg-transparent text-stone-200 text-xs outline-hidden cursor-pointer"
              >
                {Object.entries(THEME_STYLES).map(([key, val]) => (
                  <option key={key} value={key} className="bg-stone-900 text-white">
                    {val.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Toggle Ruled Lines */}
            <button
              type="button"
              onClick={() => setShowRuledLines(!showRuledLines)}
              className={`px-2.5 py-1 rounded-full transition text-[11px] font-medium border ${
                showRuledLines
                  ? 'bg-emerald-800 text-emerald-100 border-emerald-600'
                  : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200'
              }`}
              title="Toggle notebook ruling lines"
            >
              {showRuledLines ? 'Lines: ON' : 'Lines: OFF'}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 text-xs">
            {/* Toggle Raw Chat vs Prose */}
            <button
              type="button"
              onClick={() => setShowRawChat(!showRawChat)}
              className={`px-3 py-1 rounded-full font-medium transition flex items-center gap-1.5 ${
                showRawChat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              <MessageSquare size={13} />
              <span>{showRawChat ? 'Prose View' : 'Raw Chat'}</span>
            </button>

            {/* Edit Prose Button */}
            {!showRawChat && (
              <button
                type="button"
                onClick={() => {
                  if (isEditing) {
                    handleSaveEdits();
                  } else {
                    setEditTitle(entry.title);
                    setEditNarrative(entry.narrativeText);
                    setIsEditing(true);
                  }
                }}
                className={`px-3 py-1 rounded-full font-medium transition flex items-center gap-1.5 ${
                  isEditing
                    ? 'bg-emerald-500 text-white font-bold'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                {isEditing ? <Save size={13} /> : <Edit3 size={13} />}
                <span>{isEditing ? 'Save' : 'Edit'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 bg-stone-800 hover:bg-stone-700 rounded-full text-stone-300 transition"
              title="Copy narrative"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 bg-stone-800 hover:bg-stone-700 rounded-full text-stone-300 transition hidden sm:flex"
              title="Print memory page"
            >
              <Printer size={14} />
            </button>

            {onDelete && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 bg-stone-800 hover:bg-rose-950 text-stone-400 hover:text-rose-400 rounded-full transition cursor-pointer"
                title="Delete Journal"
              >
                <Trash2 size={14} />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 bg-stone-800 hover:bg-stone-700 rounded-full text-stone-300 transition ml-1"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Delete Confirmation Overlay */}
        {showDeleteConfirm && (
          <div className="bg-rose-950/95 border-b border-rose-800 p-4 text-white flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in shrink-0 z-30">
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <Trash2 size={16} className="text-rose-400 shrink-0" />
              <span>Are you sure you want to permanently delete this journal entry?</span>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDelete) {
                    onDelete(entry.id);
                  }
                  onClose();
                }}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-lg transition cursor-pointer shadow-xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        )}

        {/* Modal Scroll Body */}
        <div className="overflow-y-auto p-3 sm:p-8 flex-1 bg-stone-900/90 flex justify-center">
          {showRawChat ? (
            /* Verbatim Chat Log View */
            <div className="max-w-2xl w-full space-y-3 py-2 animate-in fade-in">
              <div className="text-center pb-4 border-b border-stone-800">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">
                  Verbatim Chat Transcript
                </span>
                <h3 className="text-lg font-bold text-stone-100 mt-1">{entry.title}</h3>
                <p className="text-xs text-stone-400">
                  Shared with {entry.contactName || 'Companion'} • {entry.date}
                </p>
              </div>

              {entry.rawMessages.map((m) => {
                const isUser = m.sender === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col max-w-[85%] sm:max-w-[75%] p-3 rounded-2xl text-sm ${
                      isUser
                        ? 'ml-auto bg-emerald-800 text-emerald-50 rounded-tr-xs border border-emerald-700'
                        : 'mr-auto bg-stone-800 text-stone-100 rounded-tl-xs border border-stone-700'
                    }`}
                  >
                    <span className="text-[11px] font-semibold opacity-70 mb-0.5">
                      {isUser ? 'You' : entry.contactName || 'Friend'}
                    </span>
                    {m.mediaType === 'image' && m.mediaUrl && (
                      <img
                        src={m.mediaUrl}
                        alt="Shared in chat"
                        className="rounded-xl max-h-60 object-cover mb-2"
                      />
                    )}
                    {m.mediaType === 'voice' && (
                      <div className="my-1">
                        <AudioPlayer src={m.mediaUrl} duration={m.audioDuration} isSender={isUser} />
                      </div>
                    )}
                    {m.text && <p className="leading-relaxed font-sans">{m.text}</p>}
                    <span className="text-[10px] opacity-60 self-end mt-1">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Tactile Journal Page Presentation */
            <div
              className={`max-w-2xl w-full ${themeConfig.bg} ${themeConfig.text} p-6 sm:p-12 rounded-2xl shadow-2xl border ${themeConfig.border} relative overflow-hidden transition-colors duration-200`}
              style={
                showRuledLines
                  ? {
                      backgroundImage:
                        currentTheme === 'midnight'
                          ? 'repeating-linear-gradient(transparent, transparent 31px, rgba(255,255,255,0.06) 31px, rgba(255,255,255,0.06) 32px)'
                          : 'repeating-linear-gradient(transparent, transparent 31px, rgba(65, 105, 225, 0.12) 31px, rgba(65, 105, 225, 0.12) 32px)',
                      backgroundPosition: '0 40px',
                    }
                  : undefined
              }
            >
              {/* Washi-tape & Bookmark Accents */}
              <div
                className={`absolute top-2 left-8 w-24 h-6 ${themeConfig.tapeColor} -rotate-6 shadow-xs border-dashed border-t border-b`}
              />
              <div
                className={`absolute top-3 right-10 w-20 h-6 ${themeConfig.tapeColor} rotate-12 shadow-xs border-dashed border-t border-b`}
              />

              {/* Red Notebook Margin line if notebook theme with lines */}
              {showRuledLines && currentTheme === 'notebook' && (
                <div className="absolute top-0 bottom-0 left-12 w-px bg-rose-300 pointer-events-none" />
              )}

              {/* Journal Page Header: Date & Mood Stamp */}
              <div className="flex items-center justify-between border-b-2 border-stone-300/40 pb-3 mt-4 mb-6 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono uppercase tracking-widest font-semibold opacity-75 flex items-center gap-1.5">
                    <Calendar size={13} className={themeConfig.accent} />
                    <span>{entry.date}</span>
                  </span>
                  {entry.location && (
                    <span className="flex items-center gap-1 opacity-70">
                      <MapPin size={11} />
                      <span>{entry.location}</span>
                    </span>
                  )}
                </div>

                {entry.mood && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold shadow-2xs border ${
                      currentTheme === 'midnight'
                        ? 'bg-stone-800 text-amber-300 border-stone-700'
                        : 'bg-white/80 text-stone-800 border-stone-200'
                    }`}
                  >
                    {entry.mood}
                  </span>
                )}
              </div>

              {/* Title Header */}
              {isEditing ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-2xl sm:text-3xl font-bold bg-white/60 p-2 rounded-xl border border-stone-300 mb-6 outline-hidden"
                  style={{ fontFamily: fontConfig.style }}
                />
              ) : (
                <h1
                  className="text-3xl sm:text-4xl font-bold tracking-tight mb-6 leading-snug"
                  style={{ fontFamily: fontConfig.style }}
                >
                  {entry.title}
                </h1>
              )}

              {/* Polaroid Photo Frame if cover image attached */}
              {entry.coverImage && (
                <div className="my-6 mx-auto w-fit p-3.5 pb-8 bg-white text-stone-800 shadow-md rounded-xs border border-stone-200 rotate-1 transform hover:rotate-0 transition duration-300">
                  <img
                    src={entry.coverImage}
                    alt="Memory polaroid"
                    className="max-h-72 w-auto object-cover rounded-xs"
                  />
                  <p
                    className="text-center mt-3 text-stone-600 text-lg font-medium"
                    style={{ fontFamily: "'Caveat', cursive" }}
                  >
                    {entry.location || 'Moment frozen in time'}
                  </p>
                </div>
              )}

              {/* Main Narrative Body */}
              {isEditing ? (
                <textarea
                  rows={10}
                  value={editNarrative}
                  onChange={(e) => setEditNarrative(e.target.value)}
                  className="w-full text-base sm:text-lg bg-white/60 p-4 rounded-xl border border-stone-300 outline-hidden resize-y leading-relaxed font-sans"
                />
              ) : (
                <div
                  className="text-lg sm:text-xl leading-relaxed whitespace-pre-wrap space-y-4"
                  style={{
                    fontFamily: fontConfig.style,
                    lineHeight: currentFont === 'handwritten' ? '2.1' : '1.8',
                    fontSize: currentFont === 'handwritten' ? '22px' : '17px',
                  }}
                >
                  {entry.narrativeText}
                </div>
              )}

              {/* Attached Voice Reflection */}
              {voiceNotes.length > 0 && (
                <div
                  className={`mt-8 p-3.5 rounded-xl border shadow-xs ${
                    currentTheme === 'midnight'
                      ? 'bg-stone-900 border-stone-800'
                      : 'bg-white/80 border-stone-200'
                  }`}
                >
                  <p className="text-xs font-semibold opacity-80 mb-1.5 flex items-center gap-1.5">
                    <Volume2 size={14} className="text-emerald-500" />
                    <span>Attached Audio Reflection</span>
                  </p>
                  <AudioPlayer src={voiceNotes[0].mediaUrl} duration={voiceNotes[0].audioDuration} />
                </div>
              )}

              {/* Sign-off & Tags Footer */}
              <div className="mt-10 pt-6 border-t border-dashed border-stone-300/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`px-2.5 py-0.5 rounded-md font-mono ${
                        currentTheme === 'midnight'
                          ? 'bg-stone-800 text-stone-300'
                          : 'bg-stone-200/70 text-stone-700'
                      }`}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div
                  className="italic text-lg"
                  style={{ fontFamily: "'Caveat', cursive" }}
                >
                  <span>— penned through thoughts with {entry.contactName || 'Companion'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
