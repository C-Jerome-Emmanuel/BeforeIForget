import React, { useState } from 'react';
import { X, UserPlus, Sparkles, Smile } from 'lucide-react';
import { Contact } from '../types';
import { isEmojiAvatar, getAvatarColor } from './Avatar';

interface NewContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: Partial<Contact>) => void;
}

// Strictly curated emoji presets organized by categories
const EMOJI_CATEGORIES: { name: string; emojis: string[] }[] = [
  {
    name: 'People & Moods',
    emojis: ['☕', '🏃‍♂️', '🌿', '✨', '🧘‍♀️', '🧗', '🎨', '📚', '🎧', '🎸', '💡', '💭'],
  },
  {
    name: 'Roles & Vibes',
    emojis: ['👑', '🧸', '🌸', '🌻', '🌙', '⭐', '🔥', '🌊', '🍀', '🌈', '🕊️', '💌'],
  },
  {
    name: 'Animals & Friends',
    emojis: ['🐱', '🐶', '🦊', '🐼', '🐨', '🦁', '🦉', '🦋', '🐝', '🐬', '🐧', '🦄'],
  },
  {
    name: 'Food & Cozy',
    emojis: ['🍵', '🥐', '🍕', '🍓', '🥑', '🍩', '🍫', '🍦', '🧁', '🍿', '🍷', '🥂'],
  },
];

const PRESET_PERSONAS = [
  {
    name: 'Claude',
    relationship: 'Dating & Romance Confidant',
    tone: 'Casual, supportive bestie who says bro and gets hyped with you',
    about: 'Always listening to every detail of your love life & dates.',
    emoji: '☕',
  },
  {
    name: 'Jeff',
    relationship: 'Fitness & Workout Companion',
    tone: 'High energy, motivating, disciplined, encouraging',
    about: 'Running, gym logs, milestones, pushing personal bests.',
    emoji: '🏃‍♂️',
  },
  {
    name: 'Eleanor',
    relationship: 'Family & Quiet Wisdom',
    tone: 'Gentle, thoughtful listener, grounded and comforting',
    about: 'Generations, family memories, home recipes, nostalgia.',
    emoji: '🌿',
  },
  {
    name: 'Marcus',
    relationship: 'Career, Ambitions & Venting',
    tone: 'Pragmatic, sharp, empathetic to work stress, honest',
    about: 'Office politics, big project dreams, work-life balance.',
    emoji: '💡',
  },
];

export const NewContactModal: React.FC<NewContactModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [tone, setTone] = useState('');
  const [about, setAbout] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('☕');
  const [customEmojiInput, setCustomEmojiInput] = useState('');

  if (!isOpen) return null;

  const handleSelectPreset = (p: typeof PRESET_PERSONAS[0]) => {
    setName(p.name);
    setRelationship(p.relationship);
    setTone(p.tone);
    setAbout(p.about);
    setSelectedEmoji(p.emoji);
  };

  const handleCustomEmojiChange = (val: string) => {
    setCustomEmojiInput(val);
    const trimmed = val.trim();
    if (trimmed) {
      // Pick the first symbol/emoji
      setSelectedEmoji(trimmed);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: 'contact_' + Date.now(),
      name: name.trim(),
      avatar: selectedEmoji || '👤',
      relationship: relationship.trim() || 'Close Friend',
      tone: tone.trim() || 'Casual, supportive, friendly',
      about: about.trim() || 'Always here to listen.',
      lastActive: 'online',
      messageCountSinceReply: 0,
      unreadCount: 0,
    });

    onClose();
  };

  const previewColor = getAvatarColor(name || selectedEmoji);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        id="new-contact-modal"
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200"
      >
        {/* Header */}
        <div className="bg-[#008069] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus size={20} />
            <h3 className="font-semibold text-base">Create New Contact</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-white/15 rounded-full transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5 max-h-[85vh] overflow-y-auto">
          {/* Quick presets */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
              <Sparkles size={13} className="text-emerald-600" />
              <span>Inspiration Templates</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_PERSONAS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className="text-left p-2.5 rounded-xl border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition text-xs cursor-pointer flex items-center gap-2"
                >
                  <span className="text-xl p-1 rounded-lg bg-stone-100 shrink-0">{p.emoji}</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-stone-800 truncate">{p.name}</p>
                    <p className="text-stone-500 text-[11px] truncate">{p.relationship}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Emoji Avatar Selection (Mandatory Emojis Only) */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <Smile size={14} className="text-emerald-600" />
                <span>Contact Profile Icon (Emoji Only)</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-stone-400">Selected:</span>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xl shadow-xs border ${previewColor}`}>
                  {selectedEmoji}
                </div>
              </div>
            </div>

            <p className="text-xs text-stone-500">
              Pick an emoji that represents this contact's personality or relationship:
            </p>

            {/* Categorized Emojis */}
            <div className="space-y-2.5">
              {EMOJI_CATEGORIES.map((cat) => (
                <div key={cat.name}>
                  <p className="text-[10px] font-semibold text-stone-400 mb-1">{cat.name}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.emojis.map((em) => {
                      const isSelected = selectedEmoji === em;
                      return (
                        <button
                          key={em}
                          type="button"
                          onClick={() => {
                            setSelectedEmoji(em);
                            setCustomEmojiInput('');
                          }}
                          className={`w-9 h-9 text-xl rounded-xl flex items-center justify-center transition cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-md scale-110 ring-2 ring-emerald-300'
                              : 'bg-white hover:bg-stone-200/80 border border-stone-200 text-stone-800 hover:scale-105'
                          }`}
                        >
                          {em}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Emoji typing input */}
            <div className="pt-2 border-t border-stone-200/80 flex items-center gap-2">
              <label className="text-xs text-stone-600 whitespace-nowrap">Or type an emoji:</label>
              <input
                type="text"
                maxLength={4}
                value={customEmojiInput}
                onChange={(e) => handleCustomEmojiChange(e.target.value)}
                placeholder="e.g. 🎯"
                className="w-16 px-2.5 py-1 text-center text-lg bg-white border border-stone-300 rounded-lg focus:border-emerald-500 outline-hidden"
              />
            </div>
          </div>

          {/* Contact Name */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Contact Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Claude, Jeff, Eleanor, Mom"
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm outline-hidden"
            />
          </div>

          {/* Area of life / Relationship */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Area of Life / Relationship
            </label>
            <input
              type="text"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder="e.g. Crush & Dating, Fitness Club, Family reflections, Work"
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm outline-hidden"
            />
          </div>

          {/* Tone / Personality */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Tone & Personality
            </label>
            <textarea
              rows={2}
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              placeholder="e.g. Casual supportive bestie who says bro, or calm wise mentor..."
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm outline-hidden resize-none"
            />
            <p className="text-[11px] text-stone-400 mt-1">
              Remember: This contact replies occasionally (every 5-6 messages), never after every single text.
            </p>
          </div>

          {/* About / Bio */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Status / About
            </label>
            <input
              type="text"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="e.g. Always here to hear about your day ✨"
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm outline-hidden"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl text-sm font-medium transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-xs transition cursor-pointer"
            >
              Create Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
