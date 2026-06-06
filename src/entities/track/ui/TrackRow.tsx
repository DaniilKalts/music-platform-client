'use client';

import React, { useState } from 'react';
import { Track } from '@/entities/types';
import { Play, Pause, Heart, X } from 'lucide-react';
import { usePlayerStore } from '@/features/player/model/store';
import { useAuthStore } from '@/features/auth/model/store';
import { TrackMenu } from '@/entities/track/ui/TrackMenu';
import { cn } from '@/shared/lib/cn';

interface TrackRowProps {
  track: Track;
  index: number;
  queue?: Track[];
  
  onRemove?: () => void;
}

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const TrackRow: React.FC<TrackRowProps> = ({ track, index, queue, onRemove }) => {
  const { currentTrack, isPlaying, playTrack, togglePlayPause } = usePlayerStore();
  const liked = useAuthStore((s) => s.favoriteIds.has(track.id));
  const toggleFavorite = useAuthStore((s) => s.toggleFavorite);
  const [isHovered, setIsHovered] = useState(false);
  const isActive = currentTrack?.id === track.id;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isActive) togglePlayPause();
    else playTrack(track, queue);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(track.id);
  };

  return (
    <div
      className={cn(
        'grid grid-cols-[16px_4fr_minmax(60px,1fr)] sm:grid-cols-[16px_4fr_3fr_minmax(120px,1fr)] gap-4 rounded-md px-4 py-2 transition-colors duration-200 group cursor-pointer',
        isActive ? 'bg-white/10' : 'hover:bg-white/5',
      )}
      onClick={handlePlayClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-center text-base font-medium text-neutral-400">
        {isActive && isPlaying && !isHovered ? (
          <div className="flex h-3.5 w-3.5 items-end gap-[2px]">
            <div className="w-[3px] bg-accent animate-bounce-playing" style={{ animationDelay: '0s' }} />
            <div className="w-[3px] bg-accent animate-bounce-playing" style={{ animationDelay: '0.2s' }} />
            <div className="w-[3px] bg-accent animate-bounce-playing" style={{ animationDelay: '0.4s' }} />
          </div>
        ) : isHovered || isActive ? (
          <button onClick={handlePlayClick} className={cn(isActive ? 'text-accent' : 'text-white')}>
            {isActive && isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
          </button>
        ) : (
          <span>{index + 1}</span>
        )}
      </div>

      <div className="flex items-center gap-3 overflow-hidden">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-gradient-to-br from-neutral-700 to-neutral-900 font-bold text-neutral-300">
          {track.title[0]}
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className={cn('truncate text-base font-bold', isActive ? 'text-accent' : 'text-white')}>
            {track.title}
          </span>
          <span className="truncate text-sm text-neutral-400 transition-colors group-hover:text-white">
            {track.artist_name}
          </span>
        </div>
      </div>

      <div className="hidden items-center truncate text-sm text-neutral-400 transition-colors group-hover:text-white sm:flex">
        {track.album_name}
      </div>

      <div className="flex items-center justify-end gap-4 pr-2 sm:pr-4">
        <button
          onClick={handleLike}
          aria-label={liked ? 'Убрать из избранного' : 'В избранное'}
          className={cn(
            'transition-transform active:scale-90',
            liked
              ? 'text-accent'
              : 'text-neutral-400 opacity-0 hover:text-white group-hover:opacity-100',
          )}
        >
          <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
        </button>

        <div className="min-w-[40px] text-right text-sm tabular-nums text-neutral-400">
          {formatDuration(track.duration_seconds)}
        </div>

        <TrackMenu track={track} />

        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            aria-label="Убрать из плейлиста"
            className="text-neutral-400 opacity-0 transition-opacity hover:text-netflix-red group-hover:opacity-100"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};
