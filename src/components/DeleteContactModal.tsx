import React, { useState } from 'react';
import { Trash2, AlertTriangle, X, BookOpen, MessageSquare } from 'lucide-react';
import { Contact } from '../types';
import { Avatar } from './Avatar';

interface DeleteContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact;
  messageCount: number;
  associatedJournalsCount: number;
  onConfirmDelete: (deleteAssociatedJournals: boolean) => void;
}

export const DeleteContactModal: React.FC<DeleteContactModalProps> = ({
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-200">
        {/* Header */}
        <div className="bg-rose-50 border-b border-rose-100 p-5 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <Trash2 size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-stone-900">Delete Contact</h3>
            <p className="text-xs text-stone-600 mt-0.5">
              Remove <strong className="text-stone-800">{contact.name}</strong> from your contacts.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/80 flex items-center gap-3">
            <Avatar
              avatar={contact.avatar}
              name={contact.name}
              size="lg"
              className="border border-stone-300"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-stone-800 truncate">{contact.name}</h4>
              <p className="text-xs text-stone-500 truncate">{contact.relationship}</p>
              <div className="flex items-center gap-3 mt-1 text-[11px] text-stone-500">
                <span className="flex items-center gap-1">
                  <MessageSquare size={12} className="text-emerald-600" />
                  {messageCount} messages
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen size={12} className="text-amber-600" />
                  {associatedJournalsCount} journals
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs text-stone-600 bg-amber-50/70 border border-amber-200/70 rounded-xl p-3 flex gap-2.5 items-start">
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p>
              Deleting this contact will immediately erase all {messageCount} chat messages and
              remove them from your chat list.
            </p>
          </div>

          {/* Option for associated journals */}
          {associatedJournalsCount > 0 && (
            <div className="pt-1">
              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-stone-200 hover:bg-stone-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={deleteJournals}
                  onChange={(e) => setDeleteJournals(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded-sm text-rose-600 focus:ring-rose-500 border-stone-300"
                />
                <div className="text-xs">
                  <span className="font-semibold text-stone-800 block">
                    Also delete all {associatedJournalsCount} journals linked to {contact.name}
                  </span>
                  <span className="text-stone-500">
                    If unchecked, your written journal entries will stay safe in your Journals Vault.
                  </span>
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-800 hover:bg-stone-200/60 rounded-xl transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onConfirmDelete(deleteJournals)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Trash2 size={14} />
            <span>Delete Contact</span>
          </button>
        </div>
      </div>
    </div>
  );
};
