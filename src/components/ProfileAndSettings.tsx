import React, { useState, useRef } from 'react';
import {
  User,
  Camera,
  CheckCircle2,
  LogOut,
  Download,
  Smartphone,
  Save,
  Lock,
  RefreshCw,
  Trash2,
  Database,
  ShieldCheck,
  Key,
} from 'lucide-react';
import { UserProfile, AppData } from '../types';
import { ClearAllDataModal } from './ClearAllDataModal';

interface ProfileAndSettingsProps {
  profile: UserProfile;
  onUpdateProfile: (newProfile: UserProfile) => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  currentUserEmail: string | null;
  onManualSync: () => Promise<void>;
  isSyncing: boolean;
  appData: AppData;
  onClearAllData: () => void;
  onLockApp: () => void;
}

const DEFAULT_FALLBACK_AVATAR =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%23008069"><circle cx="50" cy="50" r="50" fill="%23e6f4ea"/><circle cx="50" cy="40" r="20" fill="%23008069"/><path d="M20,85 C20,68 35,62 50,62 C65,62 80,68 80,85 Z" fill="%23008069"/></svg>';

export const ProfileAndSettings: React.FC<ProfileAndSettingsProps> = ({
  profile,
  onUpdateProfile,
  onOpenAuthModal,
  onLogout,
  currentUserEmail,
  onManualSync,
  isSyncing,
  appData,
  onClearAllData,
  onLockApp,
}) => {
  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [statusText, setStatusText] = useState(profile.statusText);
  const [appLockPin, setAppLockPin] = useState(profile.appLockPin || '1234');
  const [appLockEnabled, setAppLockEnabled] = useState(profile.appLockEnabled !== false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Resize and compress uploaded photo to compact high-quality JPEG for permanent cloud storage
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setAvatar(compressedDataUrl);
        }
      };
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...profile,
      name: name.trim() || 'My Profile',
      avatar: avatar.trim() || DEFAULT_FALLBACK_AVATAR,
      statusText: statusText.trim(),
      appLockPin: appLockPin.trim().length === 4 ? appLockPin.trim() : '1234',
      appLockEnabled,
    };
    onUpdateProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(appData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `before_i_forget_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="profile-container" className="h-full flex flex-col bg-stone-100 overflow-y-auto">
      {/* Top Banner */}
      <div className="bg-[#008069] text-white px-4 sm:px-8 py-7 shadow-xs">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Profile & Security</h1>
            <p className="text-emerald-100 text-xs sm:text-sm mt-0.5">
              Personal avatar, cloud database storage, and app lock security.
            </p>
          </div>
          <button
            type="button"
            onClick={onLockApp}
            className="px-3 py-1.5 bg-black/20 hover:bg-black/35 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 transition border border-white/20 cursor-pointer"
            title="Lock screen now"
          >
            <Lock size={13} />
            <span>Lock App</span>
          </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto w-full p-4 sm:p-6 space-y-5 flex-1 pb-16">
        {/* Profile Card */}
        <form
          onSubmit={handleSaveProfile}
          className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6"
        >
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-5 pb-5 border-b border-stone-100">
            <div className="relative group shrink-0">
              <img
                src={avatar || DEFAULT_FALLBACK_AVATAR}
                alt="Profile Avatar"
                className="w-24 h-24 rounded-full object-cover border-3 border-emerald-600 shadow-md bg-stone-100"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_FALLBACK_AVATAR;
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition duration-200 cursor-pointer"
                title="Upload Photo"
              >
                <Camera size={20} />
                <span className="text-[10px] font-medium mt-0.5">Upload</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>

            <div className="flex-1 w-full text-center sm:text-left space-y-2">
              <div>
                <h3 className="font-semibold text-stone-900 text-base">Profile Photo</h3>
                <p className="text-xs text-stone-500">
                  Upload your own photo to personalize your profile and sync it to your account.
                </p>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer border border-emerald-200"
                >
                  <Camera size={14} className="text-emerald-700" />
                  <span>Upload Your Photo</span>
                </button>

                {avatar && avatar !== DEFAULT_FALLBACK_AVATAR && (
                  <button
                    type="button"
                    onClick={() => setAvatar(DEFAULT_FALLBACK_AVATAR)}
                    className="px-2.5 py-1.5 text-stone-500 hover:text-stone-700 text-xs rounded-lg transition hover:bg-stone-100 cursor-pointer"
                  >
                    Reset to Default
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
              <User size={14} className="text-emerald-600" />
              <span>Your Name</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jerome"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-medium text-stone-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden transition"
            />
          </div>

          {/* Status Field */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Status / About
            </label>
            <input
              type="text"
              value={statusText}
              onChange={(e) => setStatusText(e.target.value)}
              placeholder="e.g. Documenting life, one text at a time ✨"
              maxLength={120}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden transition"
            />
          </div>

          {/* App Lock PIN Section */}
          <div className="pt-4 border-t border-stone-100">
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Key size={13} className="text-emerald-600" />
              <span>App Lock Security Passcode</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  4-Digit Passcode (PIN)
                </label>
                <input
                  type="password"
                  maxLength={4}
                  pattern="[0-9]{4}"
                  value={appLockPin}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                    setAppLockPin(clean);
                  }}
                  placeholder="1234"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm font-mono tracking-widest text-stone-900 focus:border-emerald-600 outline-hidden"
                />
                <p className="text-[10.5px] text-stone-400 mt-1">Default passcode is 1234.</p>
              </div>

              <div className="pt-2 sm:pt-0">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={appLockEnabled}
                    onChange={(e) => setAppLockEnabled(e.target.checked)}
                    className="h-4 w-4 rounded-sm text-emerald-600 focus:ring-emerald-500 border-stone-300"
                  />
                  <span className="text-xs font-medium text-stone-700">
                    Require passcode lock on opening app
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 size={16} className="text-emerald-200" />
                  <span>Profile & Security Settings Saved!</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Profile & PIN</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Where is it stored? Cloud Database & Sync Card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
                <Database size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-stone-900 flex items-center gap-1.5">
                  <span>Data Storage & Cloud Sync</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Cloud Database
                  </span>
                </h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Your chats, uploaded photo, and journals are stored securely in the{' '}
                  <strong className="text-stone-800">server database</strong> under your account:{' '}
                  <span className="font-mono text-emerald-700 font-semibold">{currentUserEmail}</span>.
                </p>
                <div className="mt-2 text-[11px] text-stone-500 space-y-0.5">
                  <p className="flex items-center gap-1 text-emerald-700 font-medium">
                    <ShieldCheck size={13} />
                    <span>Cross-Device Ready: Log into another computer or browser and all your data is instantly restored.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onManualSync}
                disabled={isSyncing}
                className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer border border-stone-200"
              >
                <RefreshCw size={13} className={isSyncing ? 'animate-spin text-emerald-600' : ''} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Cloud Data Now'}</span>
              </button>

              <button
                type="button"
                onClick={handleExportData}
                className="px-3 py-1.5 border border-stone-200 hover:bg-stone-50 text-stone-600 rounded-xl text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
              >
                <Download size={13} />
                <span>Export JSON Backup</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="px-3 py-1.5 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut size={13} />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Danger Zone: Clear All Data & Start Fresh */}
        <div className="bg-white rounded-2xl border border-rose-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <Trash2 size={16} className="text-rose-600" />
                <span>Clear All Data & Start Fresh</span>
              </h4>
              <p className="text-xs text-stone-500 mt-0.5">
                Wipe all sample contacts, conversations, and saved journals to start completely clean.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowClearModal(true)}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
            >
              Start Fresh
            </button>
          </div>
        </div>
      </div>

      {/* Clear All Data Modal */}
      <ClearAllDataModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        appData={appData}
        onConfirmClearAll={onClearAllData}
      />
    </div>
  );
};
