import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Mic } from 'lucide-react';

interface AudioPlayerProps {
  src?: string;
  duration?: number; // total duration in seconds
  isSender?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  duration = 12,
  isSender = true,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Generate a consistent pseudo-random waveform pattern for visualization
  const waveHeights = [
    30, 45, 75, 55, 90, 40, 80, 60, 95, 70,
    85, 40, 65, 90, 50, 75, 60, 45, 80, 55,
    90, 40, 70, 85, 50, 60, 35, 75, 45, 30
  ];

  useEffect(() => {
    if (!src) return;
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
      if (isPlaying) {
        animFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };

    audio.addEventListener('ended', handleEnded);

    if (isPlaying) {
      animFrameRef.current = requestAnimationFrame(updateProgress);
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }

    return () => {
      audio.removeEventListener('ended', handleEnded);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, src]);

  const togglePlay = () => {
    if (!src) {
      // Simulate playback for demonstration if no raw audio stream
      if (isPlaying) {
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
        let start = Date.now() - currentTime * 1000;
        const total = duration * 1000;
        const interval = setInterval(() => {
          const elapsed = (Date.now() - start) / 1000;
          if (elapsed >= duration) {
            setIsPlaying(false);
            setCurrentTime(0);
            clearInterval(interval);
          } else {
            setCurrentTime(elapsed);
          }
        }, 100);
      }
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.playbackRate = playbackRate;
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.warn('Audio playback error:', e);
      });
    }
  };

  const handleSpeedChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    const speeds = [1, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div
      id="voice-note-player"
      className="flex items-center gap-3 py-1 px-2 min-w-[240px] max-w-[290px] select-none"
    >
      {src && <audio ref={audioRef} src={src} preload="metadata" />}

      {/* Mic avatar indicator */}
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={togglePlay}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-sm ${
            isSender
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
          aria-label={isPlaying ? 'Pause voice message' : 'Play voice message'}
        >
          {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} className="ml-0.5" fill="currentColor" />}
        </button>
        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] border-2 border-white">
          <Mic size={9} />
        </span>
      </div>

      {/* Waveform and progress */}
      <div className="flex-1 flex flex-col justify-center">
        {/* Waveform bars */}
        <div className="flex items-center gap-[2.5px] h-7 w-full cursor-pointer overflow-hidden py-1">
          {waveHeights.map((h, i) => {
            const barProgress = (i / waveHeights.length) * 100;
            const isPlayed = barProgress <= progressPercent;
            return (
              <div
                key={i}
                className={`w-[3px] rounded-full transition-all duration-100 ${
                  isPlayed
                    ? isSender
                      ? 'bg-emerald-700'
                      : 'bg-emerald-600'
                    : isSender
                    ? 'bg-emerald-300/80'
                    : 'bg-stone-300'
                }`}
                style={{ height: `${h}%` }}
              />
            );
          })}
        </div>

        {/* Time and speed */}
        <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium px-0.5 mt-0.5">
          <span>{isPlaying ? formatTime(currentTime) : formatTime(duration)}</span>
          <button
            type="button"
            onClick={handleSpeedChange}
            className="text-[10px] bg-stone-200 hover:bg-stone-300 text-stone-700 px-1.5 py-0.5 rounded-full font-semibold transition"
          >
            {playbackRate}x
          </button>
        </div>
      </div>
    </div>
  );
};
