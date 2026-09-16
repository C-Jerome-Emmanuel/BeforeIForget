import React, { useState, useRef, useEffect } from 'react';
import {
  Smile,
  Paperclip,
  Mic,
  Send,
  X,
  Trash2,
  Check,
  StopCircle,
} from 'lucide-react';
import { Message } from '../types';
import { EmojiPicker } from './EmojiPicker';
import { AudioRecorder } from '../lib/audioRecorder';

interface ChatInputProps {
  onSendText: (text: string, quotedMessageId?: string) => void;
  onSendImage: (base64Url: string, caption?: string, quotedMessageId?: string) => void;
  onSendVoice: (audioBase64: string, duration: number, quotedMessageId?: string) => void;
  replyingToMessage?: Message | null;
  onCancelReply: () => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendText,
  onSendImage,
  onSendVoice,
  replyingToMessage,
  onCancelReply,
  disabled = false,
}) => {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const recordingTimerRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto focus input
  useEffect(() => {
    if (replyingToMessage && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyingToMessage]);

  const handleSend = () => {
    if (!text.trim()) return;
    onSendText(text.trim(), replyingToMessage?.id);
    setText('');
    onCancelReply();
    setShowEmojiPicker(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Image upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      onSendImage(base64, text.trim() || undefined, replyingToMessage?.id);
      setText('');
      onCancelReply();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Voice recording handlers
  const startVoiceRecording = async () => {
    try {
      const recorder = new AudioRecorder();
      audioRecorderRef.current = recorder;
      await recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access failed:', err);
      alert('Microphone permission required to record voice memories.');
    }
  };

  const cancelVoiceRecording = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (audioRecorderRef.current) {
      audioRecorderRef.current.cancel();
      audioRecorderRef.current = null;
    }
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const finishVoiceRecording = async () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (!audioRecorderRef.current) return;

    try {
      const result = await audioRecorderRef.current.stop();
      onSendVoice(result.audioBase64, result.duration, replyingToMessage?.id);
      onCancelReply();
    } catch (err) {
      console.error('Recording stop error:', err);
    } finally {
      audioRecorderRef.current = null;
      setIsRecording(false);
      setRecordingSeconds(0);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div id="chat-input-wrapper" className="relative bg-[#f0f2f5] border-t border-stone-200/80 p-2 z-20">
      {/* Quoted Message Preview Bar */}
      {replyingToMessage && (
        <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl mb-2 border-l-4 border-emerald-600 shadow-xs">
          <div className="flex flex-col text-xs overflow-hidden pr-2">
            <span className="font-semibold text-emerald-700">
              Replying to {replyingToMessage.sender === 'user' ? 'yourself' : 'contact'}
            </span>
            <p className="truncate text-stone-600 text-[12px]">
              {replyingToMessage.mediaType === 'image'
                ? '📷 Photo'
                : replyingToMessage.mediaType === 'voice'
                ? '🎤 Voice note'
                : replyingToMessage.text}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-full hover:bg-stone-100"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <div className="absolute bottom-full mb-2 left-2 z-50">
          <EmojiPicker
            onSelect={(emoji) => {
              setText((prev) => prev + emoji);
            }}
            onClose={() => setShowEmojiPicker(false)}
          />
        </div>
      )}

      {/* Recording State Toolbar */}
      {isRecording ? (
        <div className="flex items-center justify-between bg-white rounded-full px-4 py-2 shadow-md border border-stone-200 animate-in fade-in">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <span className="font-mono text-sm font-semibold text-stone-700">
              {formatSeconds(recordingSeconds)}
            </span>
            <span className="text-xs text-stone-400 italic">
              Recording private voice memory...
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cancelVoiceRecording}
              className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition"
              title="Cancel recording"
            >
              <Trash2 size={18} />
            </button>

            <button
              type="button"
              onClick={finishVoiceRecording}
              className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow transition"
              title="Send voice note"
            >
              <Check size={18} />
            </button>
          </div>
        </div>
      ) : (
        /* Normal Chat Input Toolbar */
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Emoji Toggle */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2 rounded-full transition ${
              showEmojiPicker ? 'text-emerald-600 bg-emerald-50' : 'text-stone-500 hover:text-stone-700'
            }`}
            title="Emoji keyboard"
          >
            <Smile size={22} />
          </button>

          {/* Attachment (Image) */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-stone-500 hover:text-stone-700 rounded-full transition"
            title="Attach photo memory"
          >
            <Paperclip size={22} />
          </button>

          {/* Text Input */}
          <div className="flex-1 bg-white rounded-2xl px-3 py-1.5 shadow-xs border border-stone-200/80 focus-within:border-emerald-500 flex items-center min-h-[42px]">
            <textarea
              ref={textareaRef}
              rows={1}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              onKeyDown={handleKeyDown}
              placeholder="Tell me what happened..."
              disabled={disabled}
              className="w-full text-[14.5px] bg-transparent outline-hidden resize-none max-h-28 text-stone-800 placeholder:text-stone-400"
            />
          </div>

          {/* Send or Voice Record Action */}
          {text.trim().length > 0 ? (
            <button
              type="button"
              onClick={handleSend}
              className="p-2.5 bg-[#00a884] hover:bg-[#008f6f] text-white rounded-full shadow-md transition active:scale-95 shrink-0"
              title="Send text"
            >
              <Send size={18} className="translate-x-0.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={startVoiceRecording}
              className="p-2.5 bg-[#00a884] hover:bg-[#008f6f] text-white rounded-full shadow-md transition active:scale-95 shrink-0"
              title="Record voice note"
            >
              <Mic size={18} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
