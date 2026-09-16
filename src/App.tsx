import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  BookOpen,
  Sparkles,
  Settings,
  Plus,
  Search,
  CheckCheck,
  Check,
  Phone,
  Video,
  MoreVertical,
  Shield,
  Eye,
  EyeOff,
  Clock,
  Camera,
  Mic,
  X,
  UserPlus,
  Trash2,
  Lock,
} from 'lucide-react';
import {
  AppData,
  Contact,
  Message,
  JournalEntry,
  PersonalSpaceItem,
  UserProfile,
  JournalStyle,
} from './types';
import { initialAppData } from './mockData';
import {
  loadLocalAppData,
  saveLocalAppData,
  syncToServer,
  syncFromServer,
  getStoredAuthToken,
  getStoredAuthEmail,
  setStoredAuth,
} from './lib/storage';
import { ChatHeader } from './components/ChatHeader';
import { ChatMessage } from './components/ChatMessage';
import { Avatar } from './components/Avatar';
import { ChatInput } from './components/ChatInput';
import { NewContactModal } from './components/NewContactModal';
import { CreateJournalModal } from './components/CreateJournalModal';
import { EventDetectionDrawer } from './components/EventDetectionDrawer';
import { JournalReaderModal } from './components/JournalReaderModal';
import { JournalsView } from './components/JournalsView';
import { PersonalSpaceView } from './components/PersonalSpaceView';
import { ProfileAndSettings } from './components/ProfileAndSettings';
import { AuthModal } from './components/AuthModal';
import { ContactInfoModal } from './components/ContactInfoModal';
import { DeleteChatModal } from './components/DeleteChatModal';
import { AppLockScreen } from './components/AppLockScreen';
import { DeleteContactModal } from './components/DeleteContactModal';

export default function App() {
  // Main Data State
  const [appData, setAppData] = useState<AppData>(() => loadLocalAppData());
  const [activeTab, setActiveTab] = useState<'chats' | 'journals' | 'personal' | 'settings'>('chats');
  const [selectedContactId, setSelectedContactId] = useState<string>('contact_claude');
  const [contactSearchQuery, setContactSearchQuery] = useState('');

  // App Lock & Auth state (app always opens with App Lock active)
  const [isAppLocked, setIsAppLocked] = useState<boolean>(true);

  // Chat State
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<Set<string>>(new Set());
  const [isCompanionTyping, setIsCompanionTyping] = useState(false);
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);

  // Modals
  const [showNewContactModal, setShowNewContactModal] = useState(false);
  const [showCreateJournalModal, setShowCreateJournalModal] = useState(false);
  const [showEventDetectionDrawer, setShowEventDetectionDrawer] = useState(false);
  const [activeReadingJournal, setActiveReadingJournal] = useState<JournalEntry | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showContactInfoModal, setShowContactInfoModal] = useState(false);
  const [showDeleteChatModal, setShowDeleteChatModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);

  // Sync state
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(getStoredAuthEmail());
  const [isSyncing, setIsSyncing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Disguise Mode Title Sync
  useEffect(() => {
    if (appData.profile.disguiseModeEnabled) {
      document.title = 'WhatsApp Web';
    } else {
      document.title = 'Before I Forget';
    }
  }, [appData.profile.disguiseModeEnabled]);

  // Save to localStorage & trigger sync whenever data changes
  useEffect(() => {
    saveLocalAppData(appData);
    if (getStoredAuthToken()) {
      syncToServer(appData).catch(() => {});
    }
  }, [appData]);

  // Attempt initial server sync if token exists
  useEffect(() => {
    const token = getStoredAuthToken();
    if (token) {
      syncFromServer().then((remoteData) => {
        if (remoteData) {
          setAppData(remoteData);
        }
      });
    }
  }, []);

  // Scroll to bottom on new message or contact switch
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedContactId, appData.messages[selectedContactId]?.length, isCompanionTyping]);

  const activeContact = appData.contacts.find((c) => c.id === selectedContactId) || appData.contacts[0];
  const activeMessages = appData.messages[selectedContactId] || [];

  // -------------------------------------------------------------
  // Message Sending & Intermittent Companion Reply Logic
  // -------------------------------------------------------------

  const handleSendText = (text: string, quotedMessageId?: string) => {
    if (!activeContact) return;

    const newMsg: Message = {
      id: 'msg_' + Date.now(),
      contactId: activeContact.id,
      sender: 'user',
      text,
      mediaType: 'text',
      quotedMessageId,
      timestamp: new Date().toISOString(),
      status: 'read',
    };

    appendUserMessage(newMsg);
  };

  const handleSendImage = (base64Url: string, caption?: string, quotedMessageId?: string) => {
    if (!activeContact) return;

    const newMsg: Message = {
      id: 'msg_' + Date.now(),
      contactId: activeContact.id,
      sender: 'user',
      text: caption || '',
      mediaType: 'image',
      mediaUrl: base64Url,
      quotedMessageId,
      timestamp: new Date().toISOString(),
      status: 'read',
    };

    appendUserMessage(newMsg);
  };

  const handleSendVoice = (audioBase64: string, duration: number, quotedMessageId?: string) => {
    if (!activeContact) return;

    const newMsg: Message = {
      id: 'msg_' + Date.now(),
      contactId: activeContact.id,
      sender: 'user',
      text: '',
      mediaType: 'voice',
      mediaUrl: audioBase64,
      audioDuration: duration,
      quotedMessageId,
      timestamp: new Date().toISOString(),
      status: 'read',
    };

    appendUserMessage(newMsg);
  };

  const appendUserMessage = (userMsg: Message) => {
    const nextCount = (activeContact.messageCountSinceReply || 0) + 1;

    setAppData((prev) => {
      const updatedMessages = {
        ...prev.messages,
        [userMsg.contactId]: [...(prev.messages[userMsg.contactId] || []), userMsg],
      };

      const updatedContacts = prev.contacts.map((c) =>
        c.id === userMsg.contactId
          ? {
              ...c,
              messageCountSinceReply: nextCount,
              lastActive: 'online',
            }
          : c
      );

      return {
        ...prev,
        messages: updatedMessages,
        contacts: updatedContacts,
      };
    });

    // Intermittent reply cadence:
    // Claude/Companion replies after a cluster of messages (around 5-6 messages),
    // NEVER after every single message, maintaining the illusion of texting a real friend!
    if (nextCount >= 5) {
      scheduleCompanionReply(activeContact, [...activeMessages, userMsg]);
    }
  };

  const scheduleCompanionReply = async (contact: Contact, recentHistory: Message[]) => {
    setIsCompanionTyping(true);

    // Natural human texting lull (1.5 to 2.5 seconds)
    setTimeout(async () => {
      try {
        const res = await fetch('/api/companion/reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contact,
            recentMessages: recentHistory.slice(-8),
            customApiKey: appData.profile.customApiKey,
            privacyMode: appData.profile.aiPrivacyMode,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const replyText = data.reply || "Bro that's so cool!! Tell me more";

          const companionMsg: Message = {
            id: 'msg_' + Date.now(),
            contactId: contact.id,
            sender: 'companion',
            text: replyText,
            mediaType: 'text',
            timestamp: new Date().toISOString(),
            status: 'read',
          };

          setAppData((prev) => {
            const updatedMessages = {
              ...prev.messages,
              [contact.id]: [...(prev.messages[contact.id] || []), companionMsg],
            };

            const updatedContacts = prev.contacts.map((c) =>
              c.id === contact.id
                ? {
                    ...c,
                    messageCountSinceReply: 0, // Reset counter
                    lastActive: 'online',
                  }
                : c
            );

            return {
              ...prev,
              messages: updatedMessages,
              contacts: updatedContacts,
            };
          });
        }
      } catch (err) {
        console.error('Companion reply trigger failed:', err);
      } finally {
        setIsCompanionTyping(false);
      }
    }, 1800);
  };

  // Manual Nudge button (gives user immediate response when requested)
  const handleNudgeReaction = () => {
    if (activeMessages.length === 0 || !activeContact) return;
    scheduleCompanionReply(activeContact, activeMessages);
  };

  // -------------------------------------------------------------
  // Message Reactions, Replies & Deletions
  // -------------------------------------------------------------

  const handleToggleReaction = (msgId: string, emoji: string) => {
    setAppData((prev) => {
      const thread = prev.messages[selectedContactId] || [];
      const updatedThread = thread.map((m) => {
        if (m.id !== msgId) return m;
        const currentReactions = m.reactions || [];
        const hasReaction = currentReactions.includes(emoji);
        const newReactions = hasReaction
          ? currentReactions.filter((r) => r !== emoji)
          : [...currentReactions, emoji];
        return { ...m, reactions: newReactions };
      });
      return {
        ...prev,
        messages: { ...prev.messages, [selectedContactId]: updatedThread },
      };
    });
  };

  const handleDeleteMessage = (msgId: string) => {
    setAppData((prev) => {
      const thread = prev.messages[selectedContactId] || [];
      const updatedThread = thread.filter((m) => m.id !== msgId);
      return {
        ...prev,
        messages: { ...prev.messages, [selectedContactId]: updatedThread },
      };
    });
    if (selectedMessageIds.has(msgId)) {
      const next = new Set(selectedMessageIds);
      next.delete(msgId);
      setSelectedMessageIds(next);
    }
  };

  const handleClearThread = () => {
    if (confirm(`Clear all messages with ${activeContact.name}? Saved journals will remain intact.`)) {
      setAppData((prev) => ({
        ...prev,
        messages: { ...prev.messages, [selectedContactId]: [] },
      }));
    }
  };

  // -------------------------------------------------------------
  // Manual Journal Selection
  // -------------------------------------------------------------

  const toggleMessageSelect = (id: string) => {
    setIsSelectionMode(true);
    const next = new Set(selectedMessageIds);
    if (next.has(id)) {
      next.delete(id);
      if (next.size === 0) setIsSelectionMode(false);
    } else {
      next.add(id);
    }
    setSelectedMessageIds(next);
  };

  const cancelSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedMessageIds(new Set());
  };

  const openCreateJournalFromSelection = () => {
    if (selectedMessageIds.size === 0) return;
    setShowCreateJournalModal(true);
  };

  const handleSaveCreatedJournal = (entry: JournalEntry) => {
    setAppData((prev) => ({
      ...prev,
      journals: [entry, ...prev.journals],
    }));
    cancelSelectionMode();
    // Open reader immediately to preview the gorgeous layout!
    setActiveReadingJournal(entry);
  };

  const handleBatchConfirmEvents = (entries: JournalEntry[]) => {
    setAppData((prev) => ({
      ...prev,
      journals: [...entries, ...prev.journals],
    }));
    if (entries.length > 0) {
      setActiveReadingJournal(entries[0]);
    }
  };

  const handleUpdateJournalStyle = (id: string, newStyle: JournalStyle) => {
    setAppData((prev) => ({
      ...prev,
      journals: prev.journals.map((j) => (j.id === id ? { ...j, style: newStyle } : j)),
    }));
  };

  const handleUpdateJournal = (updated: JournalEntry) => {
    setAppData((prev) => ({
      ...prev,
      journals: prev.journals.map((j) => (j.id === updated.id ? updated : j)),
    }));
    setActiveReadingJournal(updated);
  };

  const handleConfirmDeleteChat = (deleteAssociatedJournals: boolean) => {
    if (!activeContact) return;
    const targetContactId = activeContact.id;
    setAppData((prev) => ({
      ...prev,
      messages: {
        ...prev.messages,
        [targetContactId]: [],
      },
      journals: deleteAssociatedJournals
        ? prev.journals.filter((j) => j.contactId !== targetContactId)
        : prev.journals,
      contacts: prev.contacts.map((c) =>
        c.id === targetContactId
          ? { ...c, messageCountSinceReply: 0, unreadCount: 0 }
          : c
      ),
    }));
    setShowDeleteChatModal(false);
    cancelSelectionMode();
  };

  const handleDeleteJournal = (id: string) => {
    setAppData((prev) => ({
      ...prev,
      journals: prev.journals.filter((j) => j.id !== id),
    }));
    setActiveReadingJournal((curr) => (curr?.id === id ? null : curr));
  };

  // -------------------------------------------------------------
  // Contacts Management
  // -------------------------------------------------------------

  const handleSaveNewContact = (newContactPartial: Partial<Contact>) => {
    const newContact = newContactPartial as Contact;
    setAppData((prev) => ({
      ...prev,
      contacts: [...prev.contacts, newContact],
      messages: { ...prev.messages, [newContact.id]: [] },
    }));
    setSelectedContactId(newContact.id);
  };

  const handleDeleteContact = (contactId: string) => {
    setAppData((prev) => {
      const remaining = prev.contacts.filter((c) => c.id !== contactId);
      const nextActiveId = remaining[0]?.id || '';
      return {
        ...prev,
        contacts: remaining,
        messages: Object.fromEntries(
          Object.entries(prev.messages).filter(([k]) => k !== contactId)
        ),
      };
    });
    if (selectedContactId === contactId) {
      setSelectedContactId(appData.contacts.find((c) => c.id !== contactId)?.id || '');
    }
  };

  // -------------------------------------------------------------
  // Personal Space Actions
  // -------------------------------------------------------------

  const handleAddPersonalItem = (item: PersonalSpaceItem) => {
    setAppData((prev) => ({
      ...prev,
      personalSpace: [item, ...prev.personalSpace],
    }));
  };

  const handleDeletePersonalItem = (id: string) => {
    setAppData((prev) => ({
      ...prev,
      personalSpace: prev.personalSpace.filter((i) => i.id !== id),
    }));
  };

  // -------------------------------------------------------------
  // Profile & Sync
  // -------------------------------------------------------------

  const handleUpdateProfile = (newProfile: UserProfile) => {
    setAppData((prev) => ({ ...prev, profile: newProfile }));
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await syncToServer(appData);
      const remote = await syncFromServer();
      if (remote) {
        setAppData(remote);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAuthSuccess = (
    token: string,
    email: string,
    serverData?: AppData,
    initialPin?: string,
    initialName?: string
  ) => {
    setCurrentUserEmail(email);
    if (serverData) {
      setAppData(serverData);
    } else {
      // Sync current local data to new account with configured PIN/name
      setAppData((prev) => {
        const updatedProfile = {
          ...prev.profile,
          email,
          ...(initialPin ? { appLockPin: initialPin, appLockEnabled: true } : {}),
          ...(initialName ? { name: initialName } : {}),
        };
        const updated = { ...prev, profile: updatedProfile };
        syncToServer(updated);
        return updated;
      });
    }
    setIsAppLocked(false);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setStoredAuth(null, null);
    setCurrentUserEmail(null);
    setIsAppLocked(true);
  };

  const handleConfirmDeleteContact = (deleteAssociatedJournals: boolean) => {
    if (!contactToDelete) return;
    const targetId = contactToDelete.id;

    setAppData((prev) => {
      const remainingContacts = prev.contacts.filter((c) => c.id !== targetId);
      const remainingMessages = { ...prev.messages };
      delete remainingMessages[targetId];

      const remainingJournals = deleteAssociatedJournals
        ? prev.journals.filter((j) => j.contactId !== targetId)
        : prev.journals;

      return {
        ...prev,
        contacts: remainingContacts,
        messages: remainingMessages,
        journals: remainingJournals,
      };
    });

    if (selectedContactId === targetId) {
      const nextContact = appData.contacts.find((c) => c.id !== targetId);
      setSelectedContactId(nextContact ? nextContact.id : '');
    }
    setContactToDelete(null);
    setShowContactInfoModal(false);
  };

  const handleClearAllData = () => {
    setAppData((prev) => ({
      ...prev,
      contacts: [],
      messages: {},
      journals: [],
      personalSpace: [],
    }));
    setSelectedContactId('');
    cancelSelectionMode();
  };

  // Filter contacts by search query
  const filteredContacts = appData.contacts.filter((c) =>
    c.name.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
    c.relationship.toLowerCase().includes(contactSearchQuery.toLowerCase())
  );

  return (
    <div id="app-root" className="flex h-screen w-screen bg-[#111b21] overflow-hidden select-none font-sans">
      {/* ------------------------------------------------------------- */}
      {/* SIDEBAR NAVIGATION (Desktop & Tablet) */}
      {/* ------------------------------------------------------------- */}
      <nav
        id="desktop-sidebar-nav"
        className="w-16 bg-[#202c33] border-r border-[#313d45] hidden md:flex flex-col items-center justify-between py-4 z-30 shrink-0"
      >
        <div className="flex flex-col items-center gap-6 w-full">
          {/* Brand / Disguise Icon */}
          <div
            className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md cursor-pointer hover:scale-105 transition"
            title={appData.profile.disguiseModeEnabled ? 'WhatsApp Web' : 'Before I Forget — Private Journaling Chat'}
            onClick={() => setActiveTab('chats')}
          >
            <MessageCircle size={22} />
          </div>

          {/* Nav Tabs */}
          <div className="flex flex-col items-center gap-3 w-full">
            <button
              type="button"
              onClick={() => setActiveTab('chats')}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition ${
                activeTab === 'chats'
                  ? 'bg-emerald-600/20 text-emerald-400'
                  : 'text-stone-400 hover:text-white hover:bg-stone-700/40'
              }`}
              title="Chats"
            >
              <MessageCircle size={20} />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('journals')}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition relative ${
                activeTab === 'journals'
                  ? 'bg-emerald-600/20 text-emerald-400'
                  : 'text-stone-400 hover:text-white hover:bg-stone-700/40'
              }`}
              title={appData.profile.disguiseModeEnabled ? 'Archive' : 'Journals Vault'}
            >
              <BookOpen size={20} />
              {appData.journals.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('personal')}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition ${
                activeTab === 'personal'
                  ? 'bg-emerald-600/20 text-emerald-400'
                  : 'text-stone-400 hover:text-white hover:bg-stone-700/40'
              }`}
              title={appData.profile.disguiseModeEnabled ? 'Status / Notes' : 'Personal Space (Verses, Letters, Thoughts)'}
            >
              <Sparkles size={20} />
            </button>
          </div>
        </div>

        {/* Bottom Profile / Settings */}
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => setIsAppLocked(true)}
            className="w-11 h-11 rounded-2xl flex items-center justify-center transition text-stone-400 hover:text-white hover:bg-stone-700/40 cursor-pointer"
            title="Lock App Screen"
          >
            <Lock size={19} />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition ${
              activeTab === 'settings'
                ? 'bg-emerald-600/20 text-emerald-400'
                : 'text-stone-400 hover:text-white hover:bg-stone-700/40'
            }`}
            title="Profile & Settings"
          >
            <Settings size={20} />
          </button>

          <img
            src={appData.profile.avatar}
            alt={appData.profile.name}
            onClick={() => setActiveTab('settings')}
            className="w-9 h-9 rounded-full object-cover border border-emerald-500/50 cursor-pointer hover:opacity-90 transition"
            title={`Logged in as ${appData.profile.name}`}
          />
        </div>
      </nav>

      {/* ------------------------------------------------------------- */}
      {/* MAIN CONTENT AREA */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden relative">
        {/* 1. CHATS TAB */}
        {activeTab === 'chats' && (
          <div className="flex-1 flex h-full overflow-hidden">
            {/* Contacts Column */}
            <div
              id="contacts-sidebar"
              className={`w-full md:w-80 lg:w-96 bg-white border-r border-stone-200 flex flex-col h-full shrink-0 ${
                selectedContactId && 'hidden md:flex'
              }`}
            >
              {/* WhatsApp Emerald Top Header */}
              <div className="bg-[#008069] text-white p-4 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={appData.profile.avatar}
                    alt="My profile"
                    onClick={() => setActiveTab('settings')}
                    className="w-10 h-10 rounded-full object-cover border border-white/30 cursor-pointer"
                  />
                  <div>
                    <h2 className="font-semibold text-base leading-tight">
                      {appData.profile.disguiseModeEnabled ? 'Chats' : 'Before I Forget'}
                    </h2>
                    <p className="text-[11px] text-emerald-100">
                      {appData.profile.disguiseModeEnabled ? 'WhatsApp' : 'Disguised Journaling'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setIsAppLocked(true)}
                    className="p-2 hover:bg-white/15 rounded-full transition text-white"
                    title="Lock app"
                  >
                    <Lock size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewContactModal(true)}
                    className="p-2 hover:bg-white/15 rounded-full transition text-white"
                    title="Add new AI companion contact"
                  >
                    <UserPlus size={19} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('settings')}
                    className="p-2 hover:bg-white/15 rounded-full transition text-white md:hidden"
                  >
                    <Settings size={19} />
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="p-2.5 border-b border-stone-100 bg-[#f0f2f5]">
                <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={contactSearchQuery}
                    onChange={(e) => setContactSearchQuery(e.target.value)}
                    placeholder="Search or start new chat"
                    className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-white border border-stone-200/80 text-xs focus:border-emerald-500 outline-hidden"
                  />
                </div>
              </div>

              {/* Contacts List */}
              <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
                {filteredContacts.length === 0 ? (
                  <div className="p-8 text-center text-stone-400 text-xs">
                    <p>No contacts found.</p>
                    <button
                      type="button"
                      onClick={() => setShowNewContactModal(true)}
                      className="mt-2 text-emerald-600 font-semibold"
                    >
                      + Create Contact
                    </button>
                  </div>
                ) : (
                  filteredContacts.map((contact) => {
                    const thread = appData.messages[contact.id] || [];
                    const lastMsg = thread[thread.length - 1];
                    const isSelected = contact.id === selectedContactId;

                    return (
                      <div
                        key={contact.id}
                        id={`contact-item-${contact.id}`}
                        onClick={() => setSelectedContactId(contact.id)}
                        className={`group flex items-center gap-3 p-3.5 cursor-pointer transition ${
                          isSelected ? 'bg-[#f0f2f5]' : 'hover:bg-stone-50'
                        }`}
                      >
                        <div className="relative shrink-0">
                          <Avatar
                            avatar={contact.avatar}
                            name={contact.name}
                            size="lg"
                          />
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <h4 className="font-semibold text-sm text-stone-800 truncate">
                              {contact.name}
                            </h4>
                            <span className="text-[11px] text-stone-400 shrink-0 font-medium">
                              {lastMsg
                                ? new Date(lastMsg.timestamp).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : ''}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <p className="text-xs text-stone-500 truncate max-w-[190px]">
                              {lastMsg ? (
                                <>
                                  {lastMsg.sender === 'user' && (
                                    <span className="text-stone-400 mr-1">You:</span>
                                  )}
                                  {lastMsg.mediaType === 'image'
                                    ? '📷 Photo'
                                    : lastMsg.mediaType === 'voice'
                                    ? '🎤 Voice message'
                                    : lastMsg.text}
                                </>
                              ) : (
                                <span className="italic text-stone-400">{contact.relationship}</span>
                              )}
                            </p>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {contact.unreadCount > 0 && (
                                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                                  {contact.unreadCount}
                                </span>
                              )}
                              <button
                                type="button"
                                title={`Delete contact ${contact.name}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setContactToDelete(contact);
                                }}
                                className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Active Chat Column */}
            <div
              id="active-chat-container"
              className={`flex-1 flex flex-col h-full bg-[#efeae2] relative ${
                !selectedContactId && 'hidden md:flex'
              }`}
            >
              {activeContact ? (
                <>
                  {/* Chat Header */}
                  <ChatHeader
                    contact={activeContact}
                    onBack={() => setSelectedContactId('')}
                    isSelectionMode={isSelectionMode}
                    selectedCount={selectedMessageIds.size}
                    onStartSelection={() => setIsSelectionMode(true)}
                    onCancelSelection={cancelSelectionMode}
                    onSelectAll={() => setSelectedMessageIds(new Set(activeMessages.map((m) => m.id)))}
                    onCreateJournalFromSelection={openCreateJournalFromSelection}
                    onMakeIntoJournal={() => setShowCreateJournalModal(true)}
                    onDeleteChat={() => setShowDeleteChatModal(true)}
                    onDeleteContact={() => setContactToDelete(activeContact)}
                    onShowContactInfo={() => setShowContactInfoModal(true)}
                    isCompanionTyping={isCompanionTyping}
                  />

                  {/* Messages Scroll Area */}
                  <div
                    id="messages-viewport"
                    className="flex-1 overflow-y-auto py-3 px-1 sm:px-4 chat-wallpaper space-y-1"
                  >
                    {/* Privacy notice banner at top */}
                    <div className="my-3 mx-auto max-w-sm bg-[#ffeecd] border border-[#fae4b0] rounded-xl p-2.5 text-center text-[11.5px] text-[#54656f] shadow-2xs">
                      <div className="flex items-center justify-center gap-1 text-amber-800 font-semibold mb-0.5">
                        <Shield size={13} />
                        <span>Private Journal Encrypted Mode</span>
                      </div>
                      <p>
                        Messages with {activeContact.name} are stored privately on your account. Raw audio is never transcribed.
                      </p>
                    </div>

                    {/* Render messages */}
                    {activeMessages.length === 0 ? (
                      <div className="text-center py-16 text-stone-500 text-sm">
                        <p className="font-semibold text-stone-700">Say hello to {activeContact.name}!</p>
                        <p className="text-xs text-stone-400 mt-1 max-w-xs mx-auto">
                          Text about your day, a funny moment, or a first date before you forget.
                        </p>
                      </div>
                    ) : (
                      activeMessages.map((msg) => {
                        const quotedMsg = msg.quotedMessageId
                          ? activeMessages.find((m) => m.id === msg.quotedMessageId)
                          : undefined;

                        return (
                          <ChatMessage
                            key={msg.id}
                            message={msg}
                            quotedMessage={quotedMsg}
                            companionName={activeContact.name}
                            isSelectionMode={isSelectionMode}
                            isSelected={selectedMessageIds.has(msg.id)}
                            onToggleSelect={toggleMessageSelect}
                            onReply={(m) => setReplyingToMessage(m)}
                            onReact={handleToggleReaction}
                            onDelete={handleDeleteMessage}
                            onImageClick={(url) => setLightboxImageUrl(url)}
                          />
                        );
                      })
                    )}

                    {/* Typing bubble if companion is replying */}
                    {isCompanionTyping && (
                      <div className="flex items-end gap-2 my-1 px-3 justify-start animate-in fade-in">
                        <div className="bg-white rounded-2xl rounded-tl-xs p-3 shadow-xs border border-stone-200 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Chat Input Bar */}
                  <ChatInput
                    onSendText={handleSendText}
                    onSendImage={handleSendImage}
                    onSendVoice={handleSendVoice}
                    replyingToMessage={replyingToMessage}
                    onCancelReply={() => setReplyingToMessage(null)}
                    disabled={isSelectionMode}
                  />
                </>
              ) : (
                /* Empty state when no contact is selected */
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-400">
                  <div className="w-16 h-16 rounded-full bg-emerald-100/60 text-emerald-700 flex items-center justify-center mb-4">
                    <MessageCircle size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-stone-700">Before I Forget</h3>
                  <p className="text-xs text-stone-500 max-w-sm mt-1 mb-4">
                    Select a contact to start texting your memories or create a new companion persona.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowNewContactModal(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                  >
                    + Create New Contact
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. JOURNALS TAB */}
        {activeTab === 'journals' && (
          <JournalsView
            journals={appData.journals}
            onSelectJournal={(j) => setActiveReadingJournal(j)}
            onDeleteJournal={handleDeleteJournal}
            onNavigateToChats={() => setActiveTab('chats')}
          />
        )}

        {/* 3. PERSONAL SPACE TAB */}
        {activeTab === 'personal' && (
          <PersonalSpaceView
            items={appData.personalSpace}
            onAddItem={handleAddPersonalItem}
            onDeleteItem={handleDeletePersonalItem}
          />
        )}

        {/* 4. SETTINGS & PROFILE TAB */}
        {activeTab === 'settings' && (
          <ProfileAndSettings
            profile={appData.profile}
            onUpdateProfile={handleUpdateProfile}
            onOpenAuthModal={() => setShowAuthModal(true)}
            onLogout={handleLogout}
            currentUserEmail={currentUserEmail}
            onManualSync={handleManualSync}
            isSyncing={isSyncing}
            appData={appData}
            onClearAllData={handleClearAllData}
            onLockApp={() => setIsAppLocked(true)}
          />
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE BOTTOM NAVIGATION BAR */}
      {/* ------------------------------------------------------------- */}
      <nav
        id="mobile-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-stone-200 flex items-center justify-around z-40 px-2 shadow-lg"
      >
        <button
          type="button"
          onClick={() => setActiveTab('chats')}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-medium transition ${
            activeTab === 'chats' ? 'text-emerald-600' : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <MessageCircle size={20} />
          <span>Chats</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('journals')}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-medium transition relative ${
            activeTab === 'journals' ? 'text-emerald-600' : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <BookOpen size={20} />
          <span>Journals</span>
          {appData.journals.length > 0 && (
            <span className="absolute -top-1 right-2 w-2 h-2 rounded-full bg-emerald-500" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('personal')}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-medium transition ${
            activeTab === 'personal' ? 'text-emerald-600' : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <Sparkles size={20} />
          <span>Sanctuary</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-medium transition ${
            activeTab === 'settings' ? 'text-emerald-600' : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <Settings size={20} />
          <span>Settings</span>
        </button>
      </nav>

      {/* ------------------------------------------------------------- */}
      {/* MODALS AND DRAWERS */}
      {/* ------------------------------------------------------------- */}

      {/* New Contact Modal */}
      <NewContactModal
        isOpen={showNewContactModal}
        onClose={() => setShowNewContactModal(false)}
        onSave={handleSaveNewContact}
      />

      {/* Create Journal from Conversation / Selected Messages */}
      {activeContact && (
        <CreateJournalModal
          isOpen={showCreateJournalModal}
          onClose={() => setShowCreateJournalModal(false)}
          availableMessages={activeMessages}
          initialSelectedIds={Array.from(selectedMessageIds)}
          contactName={activeContact.name}
          contactId={activeContact.id}
          onSave={handleSaveCreatedJournal}
          profile={appData.profile}
        />
      )}

      {/* Delete Chat Confirmation Modal */}
      {activeContact && (
        <DeleteChatModal
          isOpen={showDeleteChatModal}
          onClose={() => setShowDeleteChatModal(false)}
          contact={activeContact}
          messageCount={activeMessages.length}
          associatedJournalsCount={appData.journals.filter((j) => j.contactId === activeContact.id).length}
          onConfirmDelete={handleConfirmDeleteChat}
        />
      )}

      {/* Full Journal Reader Modal */}
      {activeReadingJournal && (
        <JournalReaderModal
          entry={activeReadingJournal}
          isOpen={true}
          onClose={() => setActiveReadingJournal(null)}
          onUpdateJournal={handleUpdateJournal}
          onDelete={handleDeleteJournal}
        />
      )}

      {/* Mandatory Auth Modal if not authenticated */}
      {(!currentUserEmail || !getStoredAuthToken()) && (
        <AuthModal
          isOpen={true}
          isMandatory={true}
          onClose={() => {}}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* App Lock Screen (shows on startup, reload, or manual lock) */}
      {currentUserEmail && isAppLocked && appData.profile.appLockEnabled !== false && (
        <AppLockScreen
          profile={appData.profile}
          onUnlock={() => setIsAppLocked(false)}
          onLogout={handleLogout}
        />
      )}

      {/* Delete Contact Modal */}
      {contactToDelete && (
        <DeleteContactModal
          isOpen={!!contactToDelete}
          onClose={() => setContactToDelete(null)}
          contact={contactToDelete}
          messageCount={(appData.messages[contactToDelete.id] || []).length}
          associatedJournalsCount={
            appData.journals.filter((j) => j.contactId === contactToDelete.id).length
          }
          onConfirmDelete={handleConfirmDeleteContact}
        />
      )}

      {/* Voluntary Auth / Cloud Sync Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* Contact Info Modal */}
      {activeContact && (
        <ContactInfoModal
          contact={activeContact}
          messageCount={activeMessages.length}
          isOpen={showContactInfoModal}
          onClose={() => setShowContactInfoModal(false)}
          onDeleteContact={() => {
            setShowContactInfoModal(false);
            setContactToDelete(activeContact);
          }}
        />
      )}

      {/* Fullscreen Photo Lightbox */}
      {lightboxImageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setLightboxImageUrl(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition"
            onClick={() => setLightboxImageUrl(null)}
          >
            <X size={24} />
          </button>
          <img
            src={lightboxImageUrl}
            alt="Memory preview"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
