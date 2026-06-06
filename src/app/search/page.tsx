'use client';

import React, { useEffect, useState } from 'react';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { trackApi } from '@/shared/api/services';
import { ApiError } from '@/shared/api/api';
import type { Track, Genre } from '@/entities/types';
import { TrackRow } from '@/entities/track/ui/TrackRow';

const GENRE_GRADIENTS = [
  'from-teal-500 to-teal-800',
  'from-cyan-500 to-cyan-900',
  'from-emerald-500 to-emerald-800',
  'from-sky-500 to-blue-900',
  'from-purple-500 to-purple-800',
  'from-rose-500 to-rose-800',
  'from-amber-500 to-amber-800',
  'from-indigo-500 to-indigo-800',
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackApi.genres().then(setGenres).catch(() => setGenres([]));
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const data = await trackApi.search(q);
        setResults(data);
        setError(null);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Ошибка сети. Проверьте бэкенд.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  const hasQuery = query.trim().length > 0;

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up">
      <div className="relative max-w-md">
        <SearchIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
        {loading && <Loader2 size={18} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-neutral-400" />}
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Что хочешь послушать?"
          className="h-12 w-full rounded-full border-none bg-white/10 pl-12 pr-10 text-sm font-medium outline-none ring-accent/40 transition-all placeholder:text-neutral-400 hover:bg-white/15 focus:bg-white/20 focus:ring-2"
        />
      </div>

      {!hasQuery ? (
        <section>
          <h2 className="mb-6 text-2xl font-black tracking-tight">Жанры</h2>
          {genres.length === 0 ? (
            <p className="text-neutral-400">Жанры недоступны.</p>
          ) : (
            <div className="stagger grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {genres.map((g, i) => (
                <button
                  key={g.id}
                  onClick={() => setQuery(g.name)}
                  style={{ '--i': i } as React.CSSProperties}
                  className={cn(
                    'relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br p-4 text-left text-2xl font-black shadow-xl transition-transform duration-300 hover:scale-[1.04]',
                    GENRE_GRADIENTS[i % GENRE_GRADIENTS.length],
                  )}
                >
                  {g.name}
                  <div className="absolute -bottom-3 -right-3 flex h-20 w-20 rotate-[25deg] items-center justify-center bg-black/20 text-lg font-bold shadow-lg">
                    #
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-black tracking-tight">
            Результаты {results.length > 0 && <span className="text-neutral-500">· {results.length}</span>}
          </h2>

          {error ? (
            <p className="py-10 text-center text-neutral-400">{error}</p>
          ) : loading && results.length === 0 ? (
            <p className="py-10 text-center text-neutral-400">Поиск…</p>
          ) : results.length === 0 ? (
            <p className="py-10 text-center text-neutral-400">Ничего не найдено по запросу «{query}».</p>
          ) : (
            <div className="stagger flex flex-col">
              {results.map((track, i) => (
                <div key={track.id} style={{ '--i': Math.min(i, 12) } as React.CSSProperties}>
                  <TrackRow track={track} index={i} queue={results} />
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
