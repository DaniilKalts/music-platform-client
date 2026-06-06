'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Heart, Play } from 'lucide-react';
import { favoriteApi } from '@/shared/api/services';
import { useAuthStore } from '@/features/auth/model/store';
import { usePlayerStore } from '@/features/player/model/store';
import { AuthGate } from '@/features/auth/ui/AuthGate';
import { TrackRow } from '@/entities/track/ui/TrackRow';
import { FREE_FAVORITES_LIMIT } from '@/shared/lib/limits';
import type { Track } from '@/entities/types';

const PAGE_SIZE = 50;

export default function FavoritesPage() {
  const status = useAuthStore((s) => s.status);
  const favoriteIds = useAuthStore((s) => s.favoriteIds);
  const isFree = useAuthStore((s) => s.user?.subscription_type === 'FREE');
  const playTrack = usePlayerStore((s) => s.playTrack);

  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setTracks(await favoriteApi.list());
    } catch {
      setTracks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') load();
    else if (status === 'guest') setLoading(false);
  }, [status, load]);

  useEffect(() => {
    if (status === 'authenticated') {
      setTracks((prev) => prev.filter((t) => favoriteIds.has(t.id)));
    }
  }, [favoriteIds, status]);

  if (status === 'guest') {
    return (
      <AuthGate
        title="Войдите, чтобы видеть избранное"
        description="Гости могут слушать музыку, а избранное и плейлисты доступны после входа."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="-mx-4 -mt-4 flex flex-col items-center gap-6 bg-gradient-to-b from-accent-deep/60 to-transparent p-6 sm:-mx-8 sm:-mt-8 sm:flex-row sm:items-end sm:p-10">
        <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-deep shadow-2xl sm:h-52 sm:w-52">
          <Heart size={80} fill="white" color="white" />
        </div>
        <div className="flex flex-col gap-2 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-widest">Плейлист</span>
          <h1 className="text-4xl font-black tracking-tight sm:text-7xl">Любимые треки</h1>
          <div className="mt-2 flex items-center justify-center gap-2 text-sm font-bold sm:justify-start">
            <span className="text-neutral-300">
              {tracks.length} {isFree ? `/ ${FREE_FAVORITES_LIMIT}` : ''} треков
            </span>
            {isFree && <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-neutral-300">FREE</span>}
          </div>
        </div>
      </div>

      {tracks.length > 0 && (
        <button
          onClick={() => playTrack(tracks[0], tracks)}
          className="grid h-14 w-14 place-items-center rounded-full bg-accent text-black shadow-xl transition-transform hover:scale-105 active:scale-95"
          aria-label="Слушать"
        >
          <Play size={26} fill="currentColor" className="ml-0.5" />
        </button>
      )}

      {loading ? (
        <p className="py-16 text-center text-neutral-400">Загрузка…</p>
      ) : tracks.length === 0 ? (
        <div className="flex items-center justify-center py-20 text-center text-neutral-400">
          Добавьте треки в избранное — они появятся здесь.
        </div>
      ) : (
        <div className="stagger flex flex-col">
          {tracks.slice(0, visibleCount).map((track, i) => (
            <div key={track.id} style={{ '--i': Math.min(i, 12) } as React.CSSProperties}>
              <TrackRow track={track} index={i} queue={tracks} />
            </div>
          ))}

          {tracks.length > visibleCount && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="rounded-full bg-white/10 px-8 py-3 text-sm font-bold transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
              >
                Показать ещё
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
