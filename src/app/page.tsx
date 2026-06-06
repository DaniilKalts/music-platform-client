'use client';

import React, { useEffect, useState } from 'react';
import { Track } from '@/entities/types';
import { apiFetch, ApiError } from '@/shared/api/api';
import { TrackRow } from '@/entities/track/ui/TrackRow';
import { usePlayerStore } from '@/features/player/model/store';
import { useAuthStore } from '@/features/auth/model/store';
import { Play, Heart, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

const PAGE_SIZE = 50;

export default function Home() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const playTrack = usePlayerStore((s) => s.playTrack);

  const fetchTracks = async (offset: number) => {
    try {
      if (offset === 0) setLoading(true);
      else setLoadingMore(true);
      const data = await apiFetch<Track[]>(`/tracks?limit=${PAGE_SIZE}&offset=${offset}`);
      setTracks((prev) => (offset === 0 ? data : [...prev, ...data]));
      setHasMore(data.length === PAGE_SIZE);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch tracks:', err);
      if (err instanceof ApiError) {
        setError(`Ошибка сервера: ${err.message}`);
      } else {
        setError('Ошибка сети: Проверьте, запущен ли бэкенд.');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchTracks(0);
  }, []);

  if (error) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-6 text-center animate-fade-in">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-netflix-red/15 text-netflix-red">
          <AlertTriangle size={32} />
        </div>
        <p className="max-w-md text-lg text-neutral-300">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-full bg-white px-8 py-3 font-bold text-black transition-transform hover:scale-105 active:scale-95"
        >
          Повторить попытку
        </button>
      </div>
    );
  }

  const featured = tracks[0];

  return (
    <div className="flex flex-col gap-10 pb-8">
      <Hero featured={featured} loading={loading} onPlay={() => featured && playTrack(featured, tracks)} />

      
      <section className="flex flex-col gap-4">
        <h2 className="px-1 text-xl sm:text-2xl font-black tracking-tight">Популярные треки</h2>

        <div className="w-full">
          <div className="grid grid-cols-[16px_4fr_minmax(60px,1fr)] sm:grid-cols-[16px_4fr_3fr_minmax(120px,1fr)] gap-4 border-b border-white/10 px-4 py-2 text-sm font-medium uppercase tracking-wider text-neutral-400">
            <div className="flex justify-center">#</div>
            <div>Название</div>
            <div className="hidden sm:block">Альбом</div>
            <div className="flex justify-end pr-2 sm:pr-4">
              <Clock size={16} />
            </div>
          </div>

          <div className="mt-2 flex flex-col">
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[16px_4fr_minmax(60px,1fr)] sm:grid-cols-[16px_4fr_3fr_minmax(120px,1fr)] gap-4 px-4 py-2"
                >
                  <div className="shimmer h-4 w-4 self-center rounded bg-neutral-800" />
                  <div className="flex items-center gap-3">
                    <div className="shimmer h-10 w-10 rounded bg-neutral-800" />
                    <div className="flex flex-col gap-2">
                      <div className="shimmer h-4 w-32 rounded bg-neutral-800" />
                      <div className="shimmer h-3 w-20 rounded bg-neutral-800" />
                    </div>
                  </div>
                  <div className="shimmer hidden h-4 w-40 self-center rounded bg-neutral-800 sm:block" />
                  <div className="shimmer h-4 w-12 self-center justify-self-end rounded bg-neutral-800" />
                </div>
              ))
            ) : tracks.length === 0 ? (
              <div className="py-20 text-center text-neutral-400">Треки не найдены в базе данных.</div>
            ) : (
              <div className="stagger flex flex-col">
                {tracks.map((track, i) => (
                  <div key={track.id} style={{ '--i': Math.min(i, 12) } as React.CSSProperties}>
                    <TrackRow track={track} index={i} queue={tracks} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {hasMore && !loading && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => fetchTracks(tracks.length)}
                disabled={loadingMore}
                className="rounded-full bg-white/10 px-8 py-3 text-sm font-bold transition-all hover:bg-white/20 hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {loadingMore ? 'Загрузка…' : 'Показать ещё'}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

const Hero: React.FC<{ featured?: Track; loading: boolean; onPlay: () => void }> = ({
  featured,
  loading,
  onPlay,
}) => {
  const liked = useAuthStore((s) => (featured ? s.favoriteIds.has(featured.id) : false));
  const toggleFavorite = useAuthStore((s) => s.toggleFavorite);

  return (
    <section className="relative -mx-4 -mt-4 overflow-hidden rounded-2xl sm:-mx-8 sm:-mt-8">
      
      <div className="absolute inset-0">
        <div className="h-full w-full bg-gradient-to-br from-teal-600 via-cyan-800 to-neutral-950" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
      </div>

      <div className="relative flex min-h-[280px] flex-col justify-end gap-4 p-6 sm:min-h-[360px] sm:p-10">
        {loading ? (
          <div className="flex flex-col gap-4">
            <div className="shimmer h-4 w-24 rounded bg-white/10" />
            <div className="shimmer h-12 w-2/3 rounded bg-white/10" />
            <div className="shimmer h-4 w-40 rounded bg-white/10" />
          </div>
        ) : (
          <div className="flex flex-col gap-4 animate-fade-in-up">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-300">
              Трек дня
            </span>
            <h1 className="text-4xl font-black leading-none tracking-tight drop-shadow-2xl sm:text-7xl">
              {featured?.title ?? 'Добро пожаловать'}
            </h1>
            <p className="max-w-xl text-sm text-neutral-200 sm:text-base">
              {featured
                ? `${featured.artist_name} • ${featured.album_name}`
                : 'Слушайте любимую музыку в новом, кинематографичном интерфейсе.'}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onPlay}
                disabled={!featured}
                className="flex items-center gap-2 rounded-full bg-accent px-7 py-3 font-bold text-black shadow-xl transition-all hover:bg-accent-hover hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <Play size={20} fill="currentColor" />
                Слушать
              </button>
              <button
                onClick={() => featured && toggleFavorite(featured.id)}
                disabled={!featured}
                className={cn(
                  'grid h-12 w-12 place-items-center rounded-full bg-white/15 backdrop-blur-sm transition-colors hover:bg-white/25 disabled:opacity-50',
                  liked ? 'text-accent' : 'text-white',
                )}
                aria-label={liked ? 'Убрать из избранного' : 'В избранное'}
              >
                <Heart size={22} fill={liked ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
