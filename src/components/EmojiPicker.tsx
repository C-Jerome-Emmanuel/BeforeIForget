import React from 'react';
import { Smile, X } from 'lucide-react';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose?: () => void;
  quickReactionsOnly?: boolean;
}

const QUICK_REACTIONS = ['❤️', '👍', '😂', '😮', '😢', '🙏', '🔥', '✨'];

const POPULAR_EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
  '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😋',
  '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐',
  '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌',
  '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧',
  '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐',
  '😕', '😟', '🙁', '😮', '😯', '😲', '😳', '🥺', '😦', '😧',
  '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓',
  '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀',
  '💩', '🤡', '👻', '👽', '🤖', '🎃', '😺', '😸', '😹', '😻',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
  '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
  '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲',
  '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦵', '🦶', '👂', '🦻',
  '☕', '🍵', '🧃', '🥤', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸',
  '🍕', '🍔', '🍟', '🌭', '🍿', '🥓', '🥞', '🧇', '🥐', '🍞',
  '🌱', '🌿', '☘️', '🍀', '🎍', '🪴', '🌲', '🌳', '🌴', '🌸',
  '🌺', '🌻', '🌹', '🌷', '💐', '🍄', '⭐', '🌟', '✨', '⚡',
];

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  onSelect,
  onClose,
  quickReactionsOnly = false,
}) => {
  if (quickReactionsOnly) {
    return (
      <div
        id="quick-emoji-reaction-bar"
        className="flex items-center gap-1.5 p-1.5 bg-white border border-stone-200 rounded-full shadow-lg z-50 animate-in fade-in zoom-in-95 duration-150"
      >
        {QUICK_REACTIONS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onSelect(emoji)}
            className="w-8 h-8 flex items-center justify-center text-xl hover:scale-125 hover:bg-stone-100 rounded-full transition-transform active:scale-95"
            aria-label={`React with ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      id="full-emoji-picker-container"
      className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-80 max-w-[95vw] overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 flex flex-col"
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-stone-100 bg-stone-50">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-600">
          <Smile size={14} className="text-emerald-600" />
          <span>Emojis & Reactions</span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-full hover:bg-stone-200/60"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Quick reaction top bar */}
      <div className="flex items-center justify-around py-2 px-2 bg-stone-50/50 border-b border-stone-100">
        {QUICK_REACTIONS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onSelect(emoji)}
            className="text-xl hover:scale-125 transition-transform"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="p-2 grid grid-cols-8 gap-1 max-h-52 overflow-y-auto overscroll-contain">
        {POPULAR_EMOJIS.map((emoji, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(emoji)}
            className="w-8 h-8 flex items-center justify-center text-lg hover:bg-stone-100 rounded-lg hover:scale-110 active:scale-95 transition"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};
