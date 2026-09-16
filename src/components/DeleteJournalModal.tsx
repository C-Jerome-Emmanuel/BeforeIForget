import React from 'react';
import { Trash2, AlertTriangle, X, Calendar, BookOpen } from 'lucide-react';
import { JournalEntry } from '../types';

interface DeleteJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  journal: JournalEntry | null;
  onConfirmDelete: (id: string) => void;
}

export const DeleteJournalModal: React.FC<DeleteJournalModalProps> = ({
  isOpen,
  onClose,
  journal,
  onConfirmDelete,
}) => {
  if (!isOpen || !journal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        id="delete-journal-modal"
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-200 animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-rose-50 border-b border-rose-100 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-rose-700">
            <div className="p-2 bg-rose-100 rounded-full shrink-0">
              <Trash2 size={18} />
            </div>
            <h3 className="font-bold text-base">Delete Journal Entry</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-600 rounded-full transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-stone-700 text-sm">
          <p className="leading-relaxed">
            Are you sure you want to permanently delete this journal entry? This action cannot be undone.
          </p>

          <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200 space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold uppercase tracking-wider">
              <BookOpen size={13} />
              <span>{journal.contactName}</span>
            </div>
            <h4 className="font-bold text-stone-900 text-base line-clamp-1">{journal.title}</h4>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <Calendar size={12} />
              <span>{journal.date}</span>
              {journal.mood && (
                <>
                  <span>•</span>
                  <span>{journal.mood}</span>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl text-sm font-medium transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirmDelete(journal.id);
                onClose();
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 size={15} />
              <span>Yes, Delete Journal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
