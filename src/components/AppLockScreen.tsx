import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Delete, KeyRound, Shield, LogOut, ArrowRight } from 'lucide-react';
import { UserProfile } from '../types';

interface AppLockScreenProps {
  profile: UserProfile;
  onUnlock: () => void;
  onLogout: () => void;
}

export const AppLockScreen: React.FC<AppLockScreenProps> = ({
  profile,
  onUnlock,
  onLogout,
}) => {
  const [enteredPin, setEnteredPin] = useState('');
  const [isError, setIsError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isPasswordMode, setIsPasswordMode] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [isCheckingPassword, setIsCheckingPassword] = useState(false);

  const targetPin = profile.appLockPin || '1234';

  const handleDigit = (digit: string) => {
    if (enteredPin.length >= 4) return;
    const next = enteredPin + digit;
    setEnteredPin(next);
    setIsError(false);
    setErrorMsg('');

    if (next.length === 4) {
      validatePin(next);
    }
  };

  const handleDelete = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
    setIsError(false);
    setErrorMsg('');
  };

  const handleClear = () => {
    setEnteredPin('');
    setIsError(false);
    setErrorMsg('');
  };

  const validatePin = (pinToTest: string) => {
    if (pinToTest === targetPin) {
      onUnlock();
    } else {
      setIsError(true);
      setErrorMsg('Incorrect passcode. Try again.');
      setTimeout(() => {
        setEnteredPin('');
      }, 500);
    }
  };

  // Support physical keyboard typing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPasswordMode) return;
      if (/^[0-9]$/.test(e.key)) {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enteredPin, targetPin, isPasswordMode]);

  const handlePasswordUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;

    setIsCheckingPassword(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: profile.email,
          password: passwordInput.trim(),
        }),
      });

      if (res.ok) {
        onUnlock();
      } else {
        setErrorMsg('Invalid account password.');
      }
    } catch {
      setErrorMsg('Network error checking password.');
    } finally {
      setIsCheckingPassword(false);
    }
  };

  return (
    <div
      id="app-lock-screen"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#111b21] text-white p-4 select-none"
    >
      <div className="w-full max-w-sm flex flex-col items-center text-center">
        {/* User Avatar with Padlock badge */}
        <div className="relative mb-5">
          <img
            src={profile.avatar || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%23008069"><circle cx="50" cy="50" r="50" fill="%23e6f4ea"/><circle cx="50" cy="40" r="20" fill="%23008069"/><path d="M20,85 C20,68 35,62 50,62 C65,62 80,68 80,85 Z" fill="%23008069"/></svg>'}
            alt={profile.name}
            className="w-20 h-20 rounded-full object-cover border-3 border-emerald-500 shadow-xl bg-stone-800"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%23008069"><circle cx="50" cy="50" r="50" fill="%23e6f4ea"/><circle cx="50" cy="40" r="20" fill="%23008069"/><path d="M20,85 C20,68 35,62 50,62 C65,62 80,68 80,85 Z" fill="%23008069"/></svg>';
            }}
          />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-600 border-2 border-[#111b21] flex items-center justify-center text-white shadow-md">
            <Lock size={15} />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-stone-100 tracking-tight">{profile.name}</h2>
        <p className="text-xs text-stone-400 mt-0.5">
          {isPasswordMode ? 'Enter Account Password' : 'Enter 4-Digit Passcode'}
        </p>

        {/* Error or Help Banner */}
        {errorMsg ? (
          <div className="mt-4 px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-medium animate-bounce">
            {errorMsg}
          </div>
        ) : (
          <div className="mt-4 px-3 py-1 text-[11px] text-stone-400">
            Protected private diary vault (Default PIN: {targetPin})
          </div>
        )}

        {!isPasswordMode ? (
          <>
            {/* PIN Dots */}
            <div
              className={`flex items-center justify-center gap-4 my-6 transition-transform ${
                isError ? 'translate-x-[-8px]' : ''
              }`}
            >
              {[0, 1, 2, 3].map((index) => {
                const filled = enteredPin.length > index;
                return (
                  <div
                    key={index}
                    className={`w-4 h-4 rounded-full transition-all duration-200 ${
                      filled
                        ? 'bg-emerald-500 scale-110 shadow-sm shadow-emerald-500/50'
                        : 'border-2 border-stone-600 bg-stone-800'
                    } ${isError ? 'border-rose-500 bg-rose-500' : ''}`}
                  />
                );
              })}
            </div>

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-[280px] my-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleDigit(digit)}
                  className="w-18 h-18 mx-auto rounded-full bg-stone-800/80 hover:bg-stone-700/80 active:bg-emerald-600 active:scale-95 text-xl font-semibold text-stone-100 flex items-center justify-center transition border border-stone-700/40 cursor-pointer shadow-xs"
                >
                  {digit}
                </button>
              ))}

              <button
                type="button"
                onClick={handleClear}
                className="w-18 h-18 mx-auto rounded-full text-xs font-semibold text-stone-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={() => handleDigit('0')}
                className="w-18 h-18 mx-auto rounded-full bg-stone-800/80 hover:bg-stone-700/80 active:bg-emerald-600 active:scale-95 text-xl font-semibold text-stone-100 flex items-center justify-center transition border border-stone-700/40 cursor-pointer shadow-xs"
              >
                0
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="w-18 h-18 mx-auto rounded-full text-stone-300 hover:text-white hover:bg-stone-800/50 active:scale-95 flex items-center justify-center transition cursor-pointer"
                title="Backspace"
              >
                <Delete size={22} />
              </button>
            </div>

            {/* Password Unlock Alternative */}
            <div className="mt-5 flex items-center justify-center gap-4 text-xs text-emerald-400">
              <button
                type="button"
                onClick={() => setIsPasswordMode(true)}
                className="hover:underline flex items-center gap-1.5 cursor-pointer text-stone-300 hover:text-emerald-300"
              >
                <KeyRound size={14} />
                <span>Unlock with Password</span>
              </button>
            </div>
          </>
        ) : (
          /* Password Form Fallback */
          <form onSubmit={handlePasswordUnlock} className="w-full max-w-[280px] my-6 space-y-4">
            <div>
              <input
                type="password"
                required
                autoFocus
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Account password"
                className="w-full px-4 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 placeholder-stone-500 text-sm focus:border-emerald-500 outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={isCheckingPassword}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isCheckingPassword ? (
                <span>Checking...</span>
              ) : (
                <>
                  <span>Unlock</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsPasswordMode(false);
                setPasswordInput('');
                setErrorMsg('');
              }}
              className="text-xs text-stone-400 hover:text-white block mx-auto underline cursor-pointer"
            >
              Back to PIN Pad
            </button>
          </form>
        )}

        {/* Footer log out option */}
        <div className="mt-8 pt-4 border-t border-stone-800/80 w-full flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <Shield size={13} className="text-emerald-500" />
            <span>Encrypted Vault</span>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="text-stone-400 hover:text-rose-400 flex items-center gap-1 transition cursor-pointer"
          >
            <LogOut size={13} />
            <span>Switch / Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
