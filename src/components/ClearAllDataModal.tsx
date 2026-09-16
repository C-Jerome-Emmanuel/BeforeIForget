import React, { useState } from 'react';
import { RotateCcw, AlertOctagon, X, Check } from 'lucide-react';
import { AppData } from '../types';

interface ClearAllDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  appData: AppData;
  onConfirmClearAll: () => void;
}

export const ClearAllDataModal: React.FC<ClearAllDataModalProps> = ({
  isOpen,
  onClose,
  appData,
  onConfirmClearAll,
}) => {
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen) return null;

  const totalMessages = Object.values(appData.messages).reduce(
    (acc: number, msgs: any) => acc + (Array.isArray(msgs) ? msgs.length : 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-200">
        {/* Header */}
        <div className="bg-rose-50 border-b border-rose-100 p-5 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <AlertOctagon size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-stone-900">Clear All Data & Start Fresh</h3>
            <p className="text-xs text-stone-600 mt-0.5">
              Reset your workspace with a clean, empty blank slate.
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

        {/* Content */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-stone-600 leading-relaxed">
            This will permanently erase all existing contacts, chat conversations, voice notes, and saved journal entries so you can start completely fresh with your own personal journaling.
          </p>

          <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/80 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-white border border-stone-100">
              <span className="text-base font-bold text-stone-800 block">
                {appData.contacts.length}
              </span>
              <span className="text-[11px] text-stone-500">Contacts</span>
            </div>
            <div className="p-2 rounded-lg bg-white border border-stone-100">
              <span className="text-base font-bold text-stone-800 block">{totalMessages}</span>
              <span className="text-[11px] text-stone-500">Messages</span>
            </div>
            <div className="p-2 rounded-lg bg-white border border-stone-100">
              <span className="text-base font-bold text-stone-800 block">
                {appData.journals.length}
              </span>
              <span className="text-[11px] text-stone-500">Journals</span>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200/70 rounded-xl p-3 text-xs text-amber-800">
            <p className="font-semibold mb-0.5">What stays kept?</p>
            <p className="text-[11px] text-amber-700">
              Your registered user account, login credentials, and uploaded profile picture remain intact.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Type <span className="font-mono text-rose-600 font-bold">RESET</span> to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              placeholder="RESET"
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-mono tracking-wider focus:border-rose-500 outline-hidden"
            />
          </div>
        </div>

        {/* Footer */}
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
            disabled={confirmText !== 'RESET'}
            onClick={() => {
              onConfirmClearAll();
              onClose();
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5 ${
              confirmText === 'RESET'
                ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            <RotateCcw size={14} />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
