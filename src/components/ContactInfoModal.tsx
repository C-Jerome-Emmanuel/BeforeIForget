import React from 'react';
import { X, Sparkles, MessageSquare, Trash2, Calendar, ShieldCheck } from 'lucide-react';
import { Contact } from '../types';
import { Avatar } from './Avatar';

interface ContactInfoModalProps {
  contact: Contact;
  messageCount: number;
  isOpen: boolean;
  onClose: () => void;
  onDeleteContact: (id: string) => void;
}

export const ContactInfoModal: React.FC<ContactInfoModalProps> = ({
  contact,
  messageCount,
  isOpen,
  onClose,
  onDeleteContact,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        id="contact-info-modal"
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-200"
      >
        {/* Banner with Avatar */}
        <div className="bg-[#008069] text-white p-6 relative text-center">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-white/15 rounded-full transition"
          >
            <X size={20} />
          </button>

          <div className="flex justify-center mb-2">
            <Avatar
              avatar={contact.avatar}
              name={contact.name}
              size="xl"
              className="border-3 border-white shadow-md mx-auto"
            />
          </div>
          <h3 className="font-bold text-lg">{contact.name}</h3>
          <p className="text-xs text-emerald-100">{contact.relationship}</p>
        </div>

        <div className="p-5 space-y-4 text-xs text-stone-700">
          {/* Status / About */}
          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
            <span className="font-semibold text-stone-500 uppercase tracking-wider text-[10px] block mb-1">
              About / Status
            </span>
            <p className="text-sm text-stone-800 italic">"{contact.about}"</p>
          </div>

          {/* Persona & Tone */}
          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
            <span className="font-semibold text-stone-500 uppercase tracking-wider text-[10px] block mb-1 flex items-center gap-1">
              <Sparkles size={11} className="text-emerald-600" />
              <span>Persona & Reply Cadence</span>
            </span>
            <p className="text-stone-700 leading-relaxed font-medium">
              {contact.tone}
            </p>
            <p className="text-[11px] text-stone-400 mt-1.5 border-t border-stone-200 pt-1.5">
              Replies intermittently every 5–6 messages or after a natural thought pause.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-lg font-bold text-emerald-800">{messageCount}</span>
              <p className="text-[11px] text-emerald-600 font-medium">Total Messages</p>
            </div>
            <div className="p-3 bg-stone-100 rounded-xl border border-stone-200">
              <span className="text-lg font-bold text-stone-800">{contact.messageCountSinceReply}</span>
              <p className="text-[11px] text-stone-500 font-medium">Msgs Since Reply</p>
            </div>
          </div>

          {/* Delete Contact Action */}
          <div className="pt-2 border-t border-stone-100 flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (confirm(`Delete contact ${contact.name} and all associated messages?`)) {
                  onDeleteContact(contact.id);
                  onClose();
                }
              }}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5"
            >
              <Trash2 size={14} />
              <span>Delete Contact</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
