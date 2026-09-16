import React from 'react';

interface AvatarProps {
  avatar: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_MAP = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-lg',
  lg: 'w-12 h-12 text-xl',
  xl: 'w-20 h-20 text-3xl',
};

// Check if string is an emoji or short emoji sequence
export function isEmojiAvatar(str: string): boolean {
  if (!str) return false;
  // If it starts with http, data:image, or / it's an image
  if (str.startsWith('http') || str.startsWith('data:') || str.startsWith('/') || str.startsWith('blob:')) {
    return false;
  }
  return true;
}

// Consistent background gradient based on emoji or name
const BG_PALETTES = [
  'bg-amber-100 text-amber-800 border-amber-200',
  'bg-emerald-100 text-emerald-800 border-emerald-200',
  'bg-sky-100 text-sky-800 border-sky-200',
  'bg-purple-100 text-purple-800 border-purple-200',
  'bg-rose-100 text-rose-800 border-rose-200',
  'bg-teal-100 text-teal-800 border-teal-200',
  'bg-indigo-100 text-indigo-800 border-indigo-200',
  'bg-orange-100 text-orange-800 border-orange-200',
];

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
  }
  const idx = Math.abs(hash) % BG_PALETTES.length;
  return BG_PALETTES[idx];
}

export const Avatar: React.FC<AvatarProps> = ({
  avatar,
  name,
  size = 'md',
  className = '',
}) => {
  const isEmoji = isEmojiAvatar(avatar);
  const sizeClasses = SIZE_MAP[size] || SIZE_MAP.md;
  const palette = getAvatarColor(name || avatar || 'contact');

  if (isEmoji) {
    return (
      <div
        className={`rounded-full flex items-center justify-center shrink-0 border select-none ${palette} ${sizeClasses} ${className}`}
        title={name}
      >
        <span className="leading-none transform translate-y-[1px]">{avatar || '👤'}</span>
      </div>
    );
  }

  return (
    <img
      src={avatar}
      alt={name}
      className={`rounded-full object-cover shrink-0 ${sizeClasses} ${className}`}
      onError={(e) => {
        // Fallback to initial or emoji
        const target = e.target as HTMLElement;
        target.style.display = 'none';
      }}
    />
  );
};
