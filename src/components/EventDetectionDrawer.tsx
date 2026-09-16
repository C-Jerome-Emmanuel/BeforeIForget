import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Loader2,
  BookOpen,
} from 'lucide-react';
import { Contact, EventSuggestion, Message, JournalEntry, UserProfile, JournalStyle } from '../types';

interface EventDetectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact;
  messages: Message[];
  onConfirmEvents: (entries: JournalEntry[]) => void;
  profile: UserProfile;
}

export const EventDetectionDrawer: React.FC<EventDetectionDrawerProps> = ({
  isOpen,
  onClose,
  contact,
  messages,
  onConfirmEvents,
  profile,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<EventSuggestion[]>([]);
  const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(new Set());
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && messages.length > 0) {
      runDetection();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const runDetection = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/journal/detect-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName: contact.name,
          messages,
          customApiKey: profile.customApiKey,
          privacyMode: profile.aiPrivacyMode,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const detected: EventSuggestion[] = data.events || [];
        setEvents(detected);
        // Select all by default
        setSelectedEventIds(new Set(detected.map((e) => e.id)));
      }
    } catch (err) {
      console.error('Detection error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEventSelect = (id: string) => {
    const next = new Set(selectedEventIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedEventIds(next);
  };

  const handleConfirm = () => {
    const confirmedEvents = events.filter((e) => selectedEventIds.has(e.id));
    if (confirmedEvents.length === 0) return;

    const newEntries: JournalEntry[] = confirmedEvents.map((evt) => {
      const eventMessages = messages.filter((m) => evt.messageIds.includes(m.id));
      const firstPhoto = eventMessages.find((m) => m.mediaType === 'image')?.mediaUrl;

      // Extract narrative starting point
      const narrativeProse = eventMessages
        .filter((m) => m.sender === 'user' && m.text)
        .map((m) => m.text)
        .join('\n\n') || evt.summary;

      return {
        id: 'journal_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        contactId: contact.id,
        contactName: contact.name,
        title: evt.title,
        date: evt.dateRange,
        tags: evt.suggestedTags || ['detected', contact.name.toLowerCase()],
        style: 'scrapbook' as JournalStyle,
        narrativeText: narrativeProse,
        messageIds: evt.messageIds,
        rawMessages: eventMessages,
        mood: evt.mood,
        coverImage: firstPhoto,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    onConfirmEvents(newEntries);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        id="event-detection-modal"
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-stone-200 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-[#008069] text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={20} />
            <h3 className="font-semibold text-base">Detected Life Events & Chapters</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-white/15 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="text-xs text-stone-600 bg-stone-50 border border-stone-200 rounded-xl p-3">
            <p className="font-semibold text-stone-800 mb-0.5">
              Intelligent Topic Segmentation
            </p>
            <p>
              Rather than lumping your entire thread into one long document, the AI detects where one story ends and another begins. Review and pick which memories to save as separate journal entries:
            </p>
          </div>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-stone-500">
              <Loader2 size={32} className="animate-spin text-emerald-600" />
              <p className="text-sm font-medium">Analyzing conversation threads & boundaries...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="py-10 text-center text-stone-500 text-sm">
              <p>No distinct events detected yet.</p>
              <p className="text-xs text-stone-400 mt-1">Try chatting a bit more or select messages manually.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((evt) => {
                const isSelected = selectedEventIds.has(evt.id);
                const isExpanded = expandedEventId === evt.id;
                const eventMessages = messages.filter((m) => evt.messageIds.includes(m.id));

                return (
                  <div
                    key={evt.id}
                    className={`rounded-xl border transition p-3.5 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600/30'
                        : 'border-stone-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleEventSelect(evt.id)}
                          className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <div>
                          <h4 className="font-semibold text-sm text-stone-900 leading-tight">
                            {evt.title}
                          </h4>
                          <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                            {evt.summary}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-stone-500 font-medium">
                            <span className="flex items-center gap-1 bg-stone-100 px-2 py-0.5 rounded-md">
                              <Calendar size={11} />
                              {evt.dateRange}
                            </span>
                            <span className="bg-emerald-100/80 text-emerald-800 px-2 py-0.5 rounded-md">
                              {evt.mood}
                            </span>
                            <span className="text-stone-400">
                              {evt.messageIds.length} messages
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setExpandedEventId(isExpanded ? null : evt.id)}
                        className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 shrink-0"
                        title="View included messages"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>

                    {/* Expandable message preview */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-stone-200/80 pl-6 space-y-1.5 max-h-40 overflow-y-auto">
                        <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                          Messages in this event:
                        </p>
                        {eventMessages.map((m) => (
                          <div key={m.id} className="text-xs text-stone-700 flex items-baseline gap-1.5">
                            <span className="font-semibold text-stone-500 text-[11px]">
                              {m.sender === 'user' ? 'Me:' : `${contact.name}:`}
                            </span>
                            <span className="truncate">
                              {m.mediaType === 'image' ? '📷 [Photo]' : m.mediaType === 'voice' ? '🎤 [Voice Note]' : m.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 flex items-center justify-between shrink-0 bg-stone-50">
          <span className="text-xs text-stone-500 font-medium">
            {selectedEventIds.size} of {events.length} events selected
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-600 hover:bg-stone-200/60 rounded-xl text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={selectedEventIds.size === 0 || isLoading}
              onClick={handleConfirm}
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-xs transition"
            >
              <BookOpen size={16} />
              <span>Create {selectedEventIds.size} Journal Entries</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
