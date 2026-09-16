import React, { useState } from 'react';
import { CheckCheck, Check, CornerUpLeft, BookOpen, Smile, MoreVertical, Trash2 } from 'lucide-react';
import { Message } from '../types';
import { AudioPlayer } from './AudioPlayer';
import { EmojiPicker } from './EmojiPicker';

interface ChatMessageProps {
  message: Message;
  quotedMessage?: Message;
  companionName: string;
  isSelectionMode: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onReply: (message: Message) => void;
  onReact: (id: string, emoji: string) => void;
  onDelete: (id: string) => void;
  onImageClick?: (url: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  quotedMessage,
  companionName,
  isSelectionMode,
  isSelected,
  onToggleSelect,
  onReply,
  onReact,
  onDelete,
  onImageClick,
}) => {
  const [showQuickReactions, setShowQuickReactions] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);

  const isUser = message.sender === 'user';

  const formatMessageTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return '';
    }
  };

  const handleBubbleClick = (e: React.MouseEvent) => {
    if (isSelectionMode) {
      e.stopPropagation();
      onToggleSelect(message.id);
    }
  };

  return (
    <div
      id={`message-${message.id}`}
      className={`group relative flex items-end gap-2 my-1 px-3 transition-colors ${
        isUser ? 'justify-end' : 'justify-start'
      } ${isSelected ? 'bg-emerald-50/60 rounded-xl py-1' : ''}`}
      onClick={handleBubbleClick}
    >
      {/* Selection checkbox in selection mode */}
      {isSelectionMode && (
        <div className={`order-first flex items-center pr-1 ${isUser ? 'order-first' : 'order-first'}`}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(message.id)}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer border-stone-300"
          />
        </div>
      )}

      {/* Action triggers for desktop hover / quick taps */}
      {!isSelectionMode && (
        <div
          className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 self-center ${
            isUser ? 'order-first mr-1' : 'order-last ml-1'
          }`}
        >
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowQuickReactions(!showQuickReactions)}
              className="p-1.5 text-stone-400 hover:text-stone-700 bg-white/90 hover:bg-white rounded-full shadow-sm border border-stone-200"
              title="React"
            >
              <Smile size={14} />
            </button>
            {showQuickReactions && (
              <div className="absolute bottom-full mb-1 left-0 z-50">
                <EmojiPicker
                  quickReactionsOnly
                  onSelect={(emoji) => {
                    onReact(message.id, emoji);
                    setShowQuickReactions(false);
                  }}
                />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => onReply(message)}
            className="p-1.5 text-stone-400 hover:text-stone-700 bg-white/90 hover:bg-white rounded-full shadow-sm border border-stone-200"
            title="Reply"
          >
            <CornerUpLeft size={14} />
          </button>

          <button
            type="button"
            onClick={() => onToggleSelect(message.id)}
            className="p-1.5 text-stone-400 hover:text-emerald-700 bg-white/90 hover:bg-white rounded-full shadow-sm border border-stone-200"
            title="Select for Journal"
          >
            <BookOpen size={14} />
          </button>

          <button
            type="button"
            onClick={() => onDelete(message.id)}
            className="p-1.5 text-stone-400 hover:text-rose-600 bg-white/90 hover:bg-white rounded-full shadow-sm border border-stone-200"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {/* Main Bubble */}
      <div
        className={`relative max-w-[85%] sm:max-w-[70%] rounded-2xl p-2.5 shadow-sm text-stone-900 ${
          isUser
            ? 'bg-[#d9fdd3] rounded-tr-xs border border-emerald-200/50'
            : 'bg-white rounded-tl-xs border border-stone-200/70 shadow-stone-200/50'
        } ${isSelectionMode ? 'cursor-pointer hover:ring-2 hover:ring-emerald-400' : ''}`}
      >
        {/* Quoted Message Preview if applicable */}
        {quotedMessage && (
          <div
            className={`mb-2 p-2 rounded-lg text-xs border-l-4 flex flex-col gap-0.5 ${
              quotedMessage.sender === 'user'
                ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900'
                : 'border-teal-600 bg-teal-50/70 text-teal-900'
            }`}
          >
            <span className="font-semibold text-[11px]">
              {quotedMessage.sender === 'user' ? 'You' : companionName}
            </span>
            <p className="truncate text-stone-600 text-[12px]">
              {quotedMessage.mediaType === 'image'
                ? '📷 Photo'
                : quotedMessage.mediaType === 'voice'
                ? '🎤 Voice message'
                : quotedMessage.text}
            </p>
          </div>
        )}

        {/* Media content: Image */}
        {message.mediaType === 'image' && message.mediaUrl && (
          <div className="mb-1 rounded-xl overflow-hidden cursor-pointer">
            <img
              src={message.mediaUrl}
              alt="Shared memory"
              className="max-h-72 w-full object-cover rounded-xl hover:opacity-95 transition"
              onClick={() => onImageClick && onImageClick(message.mediaUrl!)}
              loading="lazy"
            />
          </div>
        )}

        {/* Media content: Voice Note */}
        {message.mediaType === 'voice' && (
          <AudioPlayer
            src={message.mediaUrl}
            duration={message.audioDuration || 10}
            isSender={isUser}
          />
        )}

        {/* Text content */}
        {message.text && (
          <p className="text-[14.5px] leading-relaxed whitespace-pre-wrap break-words px-0.5">
            {message.text}
          </p>
        )}

        {/* Bubble footer: Timestamp and Checkmarks */}
        <div className="flex items-center justify-end gap-1 mt-1 text-[11px] text-stone-500 select-none">
          <span>{formatMessageTime(message.timestamp)}</span>
          {isUser && (
            <span className="text-sky-600">
              {message.status === 'read' ? (
                <CheckCheck size={14} className="stroke-[2.5]" />
              ) : (
                <Check size={14} className="stroke-[2]" />
              )}
            </span>
          )}
        </div>

        {/* Emoji Reactions Pill */}
        {message.reactions && message.reactions.length > 0 && (
          <div
            className={`absolute -bottom-3 ${
              isUser ? 'right-3' : 'left-3'
            } bg-white rounded-full px-2 py-0.5 shadow-md border border-stone-200 text-xs flex items-center gap-1 z-10`}
          >
            {message.reactions.map((emoji, idx) => (
              <span key={idx} className="hover:scale-125 transition-transform cursor-pointer">
                {emoji}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
