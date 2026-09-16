import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Lock,
  Unlock,
  Quote,
  BookOpen,
  Mail,
  FileText,
  Trash2,
  Calendar,
  X,
  Clock,
  Heart,
  Search,
} from 'lucide-react';
import { PersonalItemType, PersonalSpaceItem } from '../types';

interface PersonalSpaceViewProps {
  items: PersonalSpaceItem[];
  onAddItem: (item: PersonalSpaceItem) => void;
  onDeleteItem: (id: string) => void;
}

const TYPE_TABS: { type: 'all' | PersonalItemType; label: string; icon: string }[] = [
  { type: 'all', label: 'All Entries', icon: '✨' },
  { type: 'thought', label: 'Thoughts of the Day', icon: '💭' },
  { type: 'quote', label: 'Quotes & Mantras', icon: '💡' },
  { type: 'verse', label: 'Verses & Reflections', icon: '📖' },
  { type: 'letter', label: 'Letters to Future Self', icon: '✉️' },
  { type: 'note', label: 'Freeform Notes', icon: '📝' },
];

export const PersonalSpaceView: React.FC<PersonalSpaceViewProps> = ({
  items,
  onAddItem,
  onDeleteItem,
}) => {
  const [selectedType, setSelectedType] = useState<'all' | PersonalItemType>('all');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [unlockedPreviewItem, setUnlockedPreviewItem] = useState<PersonalSpaceItem | null>(null);

  // Form states for new entry
  const [newType, setNewType] = useState<PersonalItemType>('thought');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newAuthorOrRef, setNewAuthorOrRef] = useState('');
  const [newUnlockDate, setNewUnlockDate] = useState('2026-12-31');
  const [newTags, setNewTags] = useState('');

  const filteredItems = items.filter((item) => {
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesSearch =
      search === '' ||
      item.content.toLowerCase().includes(search.toLowerCase()) ||
      (item.title && item.title.toLowerCase().includes(search.toLowerCase())) ||
      (item.authorOrRef && item.authorOrRef.toLowerCase().includes(search.toLowerCase()));

    return matchesType && matchesSearch;
  });

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const tags = newTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const isLocked = newType === 'letter' && newUnlockDate ? new Date(newUnlockDate) > new Date() : false;

    const newItem: PersonalSpaceItem = {
      id: 'ps_' + Date.now(),
      type: newType,
      title: newTitle.trim() || undefined,
      content: newContent.trim(),
      authorOrRef: newAuthorOrRef.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      unlockDate: newType === 'letter' ? newUnlockDate : undefined,
      isLocked,
      createdAt: new Date().toISOString(),
    };

    onAddItem(newItem);
    setShowAddModal(false);
    // Reset
    setNewTitle('');
    setNewContent('');
    setNewAuthorOrRef('');
    setNewTags('');
  };

  const calculateDaysLeft = (targetDateStr: string) => {
    try {
      const target = new Date(targetDateStr).getTime();
      const now = Date.now();
      const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    } catch {
      return 0;
    }
  };

  return (
    <div id="personal-space-container" className="h-full flex flex-col bg-[#fbf9f5] overflow-y-auto">
      {/* Top Banner */}
      <div className="bg-[#1b4332] text-white px-4 sm:px-6 py-6 shadow-sm">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={24} className="text-emerald-400" />
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Personal Space</h1>
            </div>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1">
              Your quiet sanctuary for thoughts, sacred verses, future letters, and mantras.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="self-start sm:self-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
          >
            <Plus size={16} />
            <span>Add Reflection</span>
          </button>
        </div>
      </div>

      {/* Tabs and Filter Bar */}
      <div className="bg-white border-b border-stone-200 px-4 sm:px-6 py-3 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto space-y-2.5">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search thoughts, verses, quotes, letters..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-100 border border-transparent focus:border-emerald-500 focus:bg-white text-sm outline-hidden transition"
            />
          </div>

          {/* Categories Tab Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
            {TYPE_TABS.map((tab) => (
              <button
                key={tab.type}
                type="button"
                onClick={() => setSelectedType(tab.type)}
                className={`px-3 py-1.5 rounded-full font-medium transition shrink-0 flex items-center gap-1.5 ${
                  selectedType === tab.type
                    ? 'bg-[#1b4332] text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-5xl mx-auto w-full p-4 sm:p-6 flex-1">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8 shadow-xs">
            <Sparkles size={40} className="mx-auto text-stone-300 mb-3" />
            <h3 className="text-base font-semibold text-stone-700">No Entries in this Section</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-4">
              Capture a fleeting thought, a motivating quote, a favorite scripture, or seal a letter to your future self.
            </p>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              Write First Entry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => {
              const isFutureLetter = item.type === 'letter';
              const daysLeft = item.unlockDate ? calculateDaysLeft(item.unlockDate) : 0;
              const isLocked = isFutureLetter && daysLeft > 0;

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border transition-all p-5 flex flex-col justify-between shadow-xs hover:shadow-md relative overflow-hidden ${
                    item.type === 'thought'
                      ? 'bg-amber-50/50 border-amber-200/80'
                      : item.type === 'quote'
                      ? 'bg-sky-50/50 border-sky-200/80'
                      : item.type === 'verse'
                      ? 'bg-emerald-50/50 border-emerald-200/80'
                      : item.type === 'letter'
                      ? 'bg-rose-50/50 border-rose-200/80'
                      : 'bg-white border-stone-200'
                  }`}
                >
                  <div>
                    {/* Header Pill */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                        {item.type === 'thought' && '💭 Thought'}
                        {item.type === 'quote' && '💡 Quote'}
                        {item.type === 'verse' && '📖 Reflection'}
                        {item.type === 'letter' && '✉️ Future Self'}
                        {item.type === 'note' && '📝 Scratchpad'}
                      </span>

                      <button
                        type="button"
                        onClick={() => onDeleteItem(item.id)}
                        className="text-stone-300 hover:text-rose-600 p-1 rounded-md transition"
                        title="Delete entry"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Title if present */}
                    {item.title && (
                      <h3 className="font-bold text-stone-900 text-base leading-snug mb-2">
                        {item.title}
                      </h3>
                    )}

                    {/* Body rendering */}
                    {isLocked ? (
                      /* Sealed Letter Card */
                      <div className="py-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center mx-auto mb-3 shadow-inner">
                          <Lock size={20} />
                        </div>
                        <p className="font-bold text-sm text-stone-800">Sealed Letter</p>
                        <p className="text-xs text-rose-700 font-semibold mt-1">
                          Unlocks in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
                        </p>
                        <p className="text-[11px] text-stone-400 mt-1 font-mono">
                          Target date: {item.unlockDate}
                        </p>
                      </div>
                    ) : (
                      /* Open Content */
                      <div className="space-y-2">
                        <p
                          className={`text-stone-800 leading-relaxed ${
                            item.type === 'verse' || item.type === 'quote'
                              ? 'font-serif text-base italic'
                              : 'text-sm'
                          }`}
                        >
                          {item.type === 'quote' ? `"${item.content}"` : item.content}
                        </p>

                        {item.authorOrRef && (
                          <p className="text-xs font-semibold text-stone-600 text-right mt-2 font-serif">
                            — {item.authorOrRef}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-400">
                    <span>
                      {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>

                    {item.tags && item.tags.length > 0 && (
                      <div className="flex gap-1.5">
                        {item.tags.map((t) => (
                          <span key={t} className="text-stone-500">#{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Reflection Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            id="add-personal-space-modal"
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200"
          >
            <div className="bg-[#1b4332] text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Sparkles size={18} />
                <span>Add to Personal Space</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-white/15 rounded-full transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="p-5 space-y-4">
              {/* Type Select */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Entry Category
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {(['thought', 'quote', 'verse', 'letter', 'note'] as PersonalItemType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewType(t)}
                      className={`p-2 rounded-xl border text-center font-medium capitalize transition ${
                        newType === t
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600'
                          : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {t === 'thought' && '💭 Thought'}
                      {t === 'quote' && '💡 Quote'}
                      {t === 'verse' && '📖 Verse'}
                      {t === 'letter' && '✉️ Letter'}
                      {t === 'note' && '📝 Note'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. A lesson from Sunday morning..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:border-emerald-500 text-sm outline-hidden"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Content *
                </label>
                <textarea
                  rows={4}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder={
                    newType === 'letter'
                      ? 'Dear Future Me, When you open this...'
                      : newType === 'verse'
                      ? 'Write or paste the verse and your reflection...'
                      : 'Write down your thought before it fades...'
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:border-emerald-500 text-sm outline-hidden resize-y"
                />
              </div>

              {/* Author / Reference (if quote or verse) */}
              {(newType === 'quote' || newType === 'verse') && (
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Author or Reference
                  </label>
                  <input
                    type="text"
                    value={newAuthorOrRef}
                    onChange={(e) => setNewAuthorOrRef(e.target.value)}
                    placeholder="e.g. Proverbs 3:5-6 or Marcus Aurelius"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:border-emerald-500 text-sm outline-hidden"
                  />
                </div>
              )}

              {/* Unlock Date (for future letter) */}
              {newType === 'letter' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1 flex items-center gap-1">
                    <Lock size={12} className="text-rose-600" />
                    <span>Seal until date (Unlock Date)</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={newUnlockDate}
                    onChange={(e) => setNewUnlockDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:border-emerald-500 text-sm outline-hidden"
                  />
                </div>
              )}

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="e.g. peace, habit, gratitude"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:border-emerald-500 text-sm outline-hidden"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold shadow-xs transition"
                >
                  Save Reflection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
