'use client';

import React, { useRef, useEffect, useState } from 'react';
import { usePlayerStore } from '@/features/player/model/store';
import { useAuthStore } from '@/features/auth/model/store';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, X } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

const formatDuration = (seconds: number) => {
  if (isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const PlayerBar: React.FC = () => {
  const {
    currentTrack, isPlaying, volume, currentTime, duration,
    togglePlayPause, setVolume, setCurrentTime, setDuration, nextTrack, prevTrack, clearTrack,
  } = usePlayerStore();

  const liked = useAuthStore((s) => (currentTrack ? s.favoriteIds.has(currentTrack.id) : false));
  const toggleFavorite = useAuthStore((s) => s.toggleFavorite);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(1);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.play().catch(() => {});
      else audioRef.current.pause();
    }
  }, [isPlaying, currentTrack]);

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };
  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };
  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      setVolume(prevVolume);
    } else {
      setPrevVolume(volume);
      setIsMuted(true);
      setVolume(0);
    }
  };

  const progress = (currentTime / (duration || 1)) * 100;

  if (!currentTrack) return null;

  return (
    <footer className="z-50 flex h-20 items-center justify-between gap-3 border-t border-white/5 bg-black px-3 sm:h-24 sm:px-4">
      <audio
        ref={audioRef}
        src={currentTrack.file_url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => nextTrack()}
      />

      <div className="flex w-[40%] min-w-0 items-center gap-3 sm:w-[30%] sm:min-w-[180px]">
        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md shadow-lg sm:h-14 sm:w-14">
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-teal-500 to-cyan-800 text-xl font-bold text-white/90">
            {currentTrack.title[0]}
          </div>
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-bold text-white hover:underline">{currentTrack.title}</span>
          <span className="truncate text-xs text-neutral-400 hover:text-white hover:underline">
            {currentTrack.artist_name}
          </span>
        </div>
        <button
          onClick={() => toggleFavorite(currentTrack.id)}
          aria-label={liked ? 'Убрать из избранного' : 'В избранное'}
          className={cn('ml-1 hidden shrink-0 transition-transform active:scale-90 sm:block', liked ? 'text-accent' : 'text-neutral-400 hover:text-white')}
        >
          <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
        </button>
        <button
          onClick={clearTrack}
          aria-label="Закрыть"
          className="ml-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      
      <div className="flex max-w-[45%] flex-1 flex-col items-center gap-2 sm:max-w-[40%]">
        <div className="flex items-center gap-5 sm:gap-6">
          <button onClick={prevTrack} aria-label="Предыдущий" className="text-neutral-400 transition-colors hover:text-white">
            <SkipBack size={22} fill="currentColor" />
          </button>
          <button
            onClick={togglePlayPause}
            aria-label={isPlaying ? 'Пауза' : 'Воспроизвести'}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105 active:scale-95"
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} className="ml-0.5" fill="currentColor" />}
          </button>
          <button onClick={nextTrack} aria-label="Следующий" className="text-neutral-400 transition-colors hover:text-white">
            <SkipForward size={22} fill="currentColor" />
          </button>
        </div>

        <div className="group flex w-full items-center gap-2">
          <span className="hidden min-w-[40px] text-right text-[10px] text-neutral-400 sm:block">
            {formatDuration(currentTime)}
          </span>
          <div className="relative flex h-1 flex-1 items-center">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="absolute inset-0 z-10 w-full cursor-pointer opacity-0"
            />
            <div className="absolute inset-0 overflow-hidden rounded-full bg-neutral-600">
              <div className="h-full bg-white transition-colors group-hover:bg-accent" style={{ width: `${progress}%` }} />
            </div>
            <div
              className="pointer-events-none absolute h-3 w-3 rounded-full bg-white opacity-0 shadow-md transition-opacity group-hover:opacity-100"
              style={{ left: `calc(${progress}% - 6px)` }}
            />
          </div>
          <span className="hidden min-w-[40px] text-[10px] text-neutral-400 sm:block">
            {formatDuration(duration)}
          </span>
        </div>
      </div>

      
      <div className="hidden w-[30%] items-center justify-end gap-2 sm:flex">
        <div className="group flex w-32 items-center gap-2">
          <button onClick={toggleMute} aria-label="Звук" className="text-neutral-400 hover:text-white">
            {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <div className="relative flex h-1 flex-1 items-center">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="absolute inset-0 z-10 w-full cursor-pointer opacity-0"
            />
            <div className="absolute inset-0 overflow-hidden rounded-full bg-neutral-600">
              <div className="h-full bg-white transition-colors group-hover:bg-accent" style={{ width: `${volume * 100}%` }} />
            </div>
            <div
              className="pointer-events-none absolute h-3 w-3 rounded-full bg-white opacity-0 shadow-md transition-opacity group-hover:opacity-100"
              style={{ left: `calc(${volume * 100}% - 6px)` }}
            />
          </div>
        </div>
      </div>
    </footer>
  );
};
