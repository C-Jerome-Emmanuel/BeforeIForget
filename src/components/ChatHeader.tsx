import React, { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  MoreVertical,
  X,
  Trash2,
  Info,
  CheckSquare,
  Sparkles,
} from 'lucide-react';
import { Contact } from '../types';
import { Avatar } from './Avatar';

interface ChatHeaderProps {
  contact: Contact;
  onBack?: () => void;
  selectedCount: number;
  isSelectionMode: boolean;
  onStartSelection: () => void;
  onCancelSelection: () => void;
  onSelectAll: () => void;
  onCreateJournalFromSelection: () => void;
  onMakeIntoJournal: () => void; // Renamed from detect events
  onDeleteChat: () => void; // Prompts for deleting chat + optional journals
  onDeleteContact: () => void; // Prompts for deleting contact + history
  onShowContactInfo: () => void;
  isCompanionTyping?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  contact,
  onBack,
  selectedCount,
  isSelectionMode,
  onStartSelection,
  onCancelSelection,
  onSelectAll,
  onCreateJournalFromSelection,
  onMakeIntoJournal,
  onDeleteChat,
  onDeleteContact,
  onShowContactInfo,
  isCompanionTyping = false,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  if (isSelectionMode) {
    return (
      <header
        id="chat-header-selection-mode"
        className="h-16 bg-emerald-800 text-white px-3 sm:px-4 flex items-center justify-between shadow-md z-20 shrink-0 select-none animate-in fade-in duration-150"
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancelSelection}
            className="p-2 hover:bg-white/10 rounded-full transition"
            aria-label="Cancel selection"
          >
            <X size={20} />
          </button>
          <span className="font-semibold text-sm sm:text-base">
            {selectedCount} {selectedCount === 1 ? 'message' : 'messages'} selected
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSelectAll}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-medium rounded-full transition"
          >
            <CheckSquare size={14} />
            <span>Select All</span>
          </button>

          <button
            type="button"
            onClick={onCreateJournalFromSelection}
            disabled={selectedCount === 0}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-full shadow transition text-xs sm:text-sm"
          >
            <BookOpen size={16} />
            <span>Make it into a Journal</span>
          </button>
        </div>
      </header>
    );
  }

  return (
    <header
      id="chat-header-main"
      className="h-16 bg-[#008069] text-white px-3 sm:px-4 flex items-center justify-between shadow-md z-20 shrink-0 select-none"
    >
      {/* Contact Profile & Status */}
      <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 hover:bg-white/15 rounded-full transition -ml-1 sm:hidden"
            aria-label="Back to contacts list"
          >
            <ArrowLeft size={20} />
          </button>
        )}

        <div
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-95"
          onClick={onShowContactInfo}
        >
          <div className="relative shrink-0">
            <Avatar
              avatar={contact.avatar}
              name={contact.name}
              size="md"
              className="border border-white/20 shadow-xs"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-300 border-2 border-[#008069]" />
          </div>

          <div className="flex flex-col min-w-0">
            <h2 className="font-semibold text-sm sm:text-base leading-tight truncate">
              {contact.name}
            </h2>
            <span className="text-[11.5px] text-emerald-100 truncate">
              {isCompanionTyping ? (
                <span className="animate-pulse font-medium text-emerald-200">
                  typing...
                </span>
              ) : (
                contact.lastActive || 'online'
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Header Quick Actions */}
      <div className="flex items-center gap-2">
        {/* Choose texts button */}
        <button
          type="button"
          onClick={onStartSelection}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-medium rounded-full transition"
          title="Select specific texts to compile into a journal"
        >
          <CheckSquare size={14} />
          <span>Select Texts</span>
        </button>

        {/* Primary "Make it into a Journal" Action Button */}
        <button
          type="button"
          onClick={onMakeIntoJournal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs sm:text-sm font-semibold rounded-full shadow-xs transition"
          title="Transform conversation into a formatted journal entry"
        >
          <BookOpen size={15} />
          <span>Make it into a Journal</span>
        </button>

        {/* Dropdown Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-white/15 rounded-full transition"
            aria-label="More chat options"
          >
            <MoreVertical size={19} />
          </button>

          {showMenu && (
            <div
              id="chat-options-dropdown"
              className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-stone-200 py-1 z-50 text-stone-700 text-sm animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setShowMenu(false)}
            >
              <button
                type="button"
                onClick={onStartSelection}
                className="w-full text-left px-4 py-2.5 hover:bg-stone-100 flex items-center gap-2.5"
              >
                <CheckSquare size={16} className="text-emerald-600" />
                <span>Select Messages to Journal</span>
              </button>

              <button
                type="button"
                onClick={onMakeIntoJournal}
                className="w-full text-left px-4 py-2.5 hover:bg-stone-100 flex items-center gap-2.5"
              >
                <Sparkles size={16} className="text-emerald-600" />
                <span>Make it into a Journal</span>
              </button>

              <button
                type="button"
                onClick={onShowContactInfo}
                className="w-full text-left px-4 py-2.5 hover:bg-stone-100 flex items-center gap-2.5"
              >
                <Info size={16} className="text-stone-400" />
                <span>Contact Details</span>
              </button>

              <div className="h-px bg-stone-100 my-1" />

              <button
                type="button"
                onClick={onDeleteChat}
                className="w-full text-left px-4 py-2.5 hover:bg-stone-100 text-stone-700 flex items-center gap-2.5"
              >
                <Trash2 size={16} className="text-stone-400" />
                <span>Delete Chat Messages</span>
              </button>

              <button
                type="button"
                onClick={onDeleteContact}
                className="w-full text-left px-4 py-2.5 hover:bg-rose-50 text-rose-600 flex items-center gap-2.5 font-medium"
              >
                <Trash2 size={16} />
                <span>Delete Contact</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
