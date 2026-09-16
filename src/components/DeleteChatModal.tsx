import React, { useState } from 'react';
import { Trash2, AlertTriangle, X, BookOpen, MessageCircle } from 'lucide-react';
import { Contact, JournalEntry } from '../types';

interface DeleteChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact;
  messageCount: number;
  associatedJournalsCount: number;
  onConfirmDelete: (deleteAssociatedJournals: boolean) => void;
}

export const DeleteChatModal: React.FC<DeleteChatModalProps> = ({
  isOpen,
  onClose,
  contact,
  messageCount,
  associatedJournalsCount,
  onConfirmDelete,
}) => {
  const [deleteJournals, setDeleteJournals] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        id="delete-chat-modal"
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-200 animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-rose-50 border-b border-rose-100 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-rose-700">
            <div className="p-2 bg-rose-100 rounded-full">
              <AlertTriangle size={18} />
            </div>
            <h3 className="font-bold text-base">Delete Chat History</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-600 rounded-full transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-stone-700 text-sm">
          <p className="leading-relaxed">
            Are you sure you want to delete your chat thread with{' '}
            <strong className="text-stone-900">{contact.name}</strong> ({messageCount}{' '}
            {messageCount === 1 ? 'message' : 'messages'})?
          </p>

          {/* Associated Journals Option */}
          <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200 space-y-3">
            <div className="flex items-center gap-2 text-stone-900 font-semibold text-xs uppercase tracking-wider">
              <BookOpen size={14} className="text-emerald-600" />
              <span>Associated Journal Entries ({associatedJournalsCount})</span>
            </div>

            {associatedJournalsCount > 0 ? (
              <div className="space-y-2 text-xs">
                <label className="flex items-start gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-stone-100 transition">
                  <input
                    type="radio"
                    name="deleteChoice"
                    checked={!deleteJournals}
                    onChange={() => setDeleteJournals(false)}
                    className="mt-0.5 text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <p className="font-semibold text-stone-800">
                      Keep journals in Vault (Recommended)
                    </p>
                    <p className="text-stone-500 mt-0.5">
                      Clear chat messages only. Your {associatedJournalsCount} compiled journal entries
                      remain safely in your Journal Vault.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-rose-50/60 transition">
                  <input
                    type="radio"
                    name="deleteChoice"
                    checked={deleteJournals}
                    onChange={() => setDeleteJournals(true)}
                    className="mt-0.5 text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <p className="font-semibold text-rose-800">
                      Delete both chat messages AND associated journals
                    </p>
                    <p className="text-rose-600/80 mt-0.5">
                      Permanently remove all {associatedJournalsCount} journal entries made from this chat.
                    </p>
                  </div>
                </label>
              </div>
            ) : (
              <p className="text-xs text-stone-500">
                There are currently no saved journal entries created from this chat thread.
              </p>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-3.5 bg-stone-50 border-t border-stone-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-stone-600 hover:bg-stone-200/60 rounded-xl text-xs font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmDelete(deleteJournals);
              onClose();
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
          >
            <Trash2 size={14} />
            <span>
              {deleteJournals ? 'Delete Chat & Journals' : 'Delete Chat Only'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
