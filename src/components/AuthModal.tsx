import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, Loader2, KeyRound } from 'lucide-react';
import { setStoredAuth } from '../lib/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string, email: string, data?: any, initialPin?: string, initialName?: string) => void;
  isMandatory?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  isMandatory = false,
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isLogin && pin.length !== 4) {
      setErrorMsg('Please set a 4-digit App Lock PIN for quick access.');
      return;
    }

    setIsLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          name: name.trim() || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setErrorMsg(json.error || 'Authentication failed. Please try again.');
        setIsLoading(false);
        return;
      }

      setStoredAuth(json.token, json.email);
      onSuccess(json.token, json.email, json.data, isLogin ? undefined : pin, isLogin ? undefined : name);
      onClose();
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMsg('Network error connecting to backend database.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        id="auth-modal-card"
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-200"
      >
        {/* Header */}
        <div className="bg-[#008069] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} />
            <h3 className="font-semibold text-base">
              {isLogin ? 'Sign In to Your Encrypted Account' : 'Create Encrypted Account & Set App Lock'}
            </h3>
          </div>
          {!isMandatory && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 hover:bg-white/15 rounded-full transition cursor-pointer"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-stone-500 leading-relaxed">
            {isLogin
              ? 'Sign in to access your journal database synced across your devices with full private security.'
              : 'Set up your account and choose your personal 4-digit App Lock PIN to protect your conversations.'}
          </p>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Your Name
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jerome"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:border-emerald-500 outline-hidden"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:border-emerald-500 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Account Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:border-emerald-500 outline-hidden"
              />
            </div>
          </div>

          {!isLogin && (
            <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200/80">
              <label className="block text-xs font-bold text-emerald-950 mb-1 flex items-center gap-1.5">
                <KeyRound size={14} className="text-emerald-700" />
                <span>Choose 4-Digit App Lock PIN *</span>
              </label>
              <p className="text-[11px] text-emerald-800/80 mb-2">
                This PIN secures the app every time you open it, so you stay logged in securely.
              </p>
              <input
                type="text"
                pattern="[0-9]*"
                maxLength={4}
                required
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="e.g. 5821"
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-300 text-center tracking-[0.5em] font-mono font-bold text-lg text-emerald-950 bg-white focus:border-emerald-600 outline-hidden"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm shadow-xs transition flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Synchronizing...</span>
              </>
            ) : (
              <span>{isLogin ? 'Sign In & Unlock' : 'Complete Setup & Set PIN'}</span>
            )}
          </button>

          <div className="pt-2 text-center text-xs text-stone-500">
            {isLogin ? "Don't have an account yet?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrorMsg('');
              }}
              className="text-emerald-700 font-semibold hover:underline ml-0.5 cursor-pointer"
            >
              {isLogin ? 'Register now' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
