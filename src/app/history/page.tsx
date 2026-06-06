'use client';

import React, { useEffect, useState } from 'react';
import { History as HistoryIcon, Music2, Play, Pause } from 'lucide-react';
import { historyApi, trackApi } from '@/shared/api/services';
import { useAuthStore } from '@/features/auth/model/store';
import { usePlayerStore } from '@/features/player/model/store';
import { AuthGate } from '@/features/auth/ui/AuthGate';
import { cn } from '@/shared/lib/cn';
import type { HistoryRecord, Track } from '@/entities/types';

const PAGE_SIZE = 50;

const formatWhen = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

export default function HistoryPage() {
  const status = useAuthStore((s) => s.status);
  const { currentTrack, isPlaying, playTrack, togglePlayPause } = usePlayerStore();

  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [tracks, setTracks] = useState<Record<string, Track>>({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const fetchPage = async (offset: number) => {
    if (offset === 0) setLoading(true);
    else setLoadingMore(true);
    try {
      const data = await historyApi.list(PAGE_SIZE, offset);
      setRecords((prev) => (offset === 0 ? data : [...prev, ...data]));
      setHasMore(data.length === PAGE_SIZE);
    } catch {
      if (offset === 0) setRecords([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPage(0);
    } else if (status === 'guest') {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    const ids = [...new Set(records.map((r) => r.track_id))].filter((id) => !tracks[id]);
    if (ids.length === 0) return;
    let cancelled = false;
    Promise.all(ids.map((id) => trackApi.get(id).then((t) => [id, t] as const).catch(() => null))).then((pairs) => {
      const found = pairs.filter(Boolean) as Array<readonly [string, Track]>;
      if (cancelled || found.length === 0) return;
      setTracks((prev) => {
        const map = { ...prev };
        found.forEach(([id, track]) => {
          map[id] = track;
        });
        return map;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [records, tracks]);

  if (status === 'guest') {
    return <AuthGate title="Войдите, чтобы видеть историю" description="История прослушиваний доступна авторизованным пользователям." />;
  }

  const queue = records.map((r) => tracks[r.track_id]).filter(Boolean) as Track[];

  const handlePlay = (record: HistoryRecord) => {
    const track = tracks[record.track_id];
    if (!track) return;
    if (currentTrack?.id === track.id) togglePlayPause();
    else playTrack(track, queue);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <div className="flex items-center gap-4">
        <HistoryIcon size={32} />
        <h1 className="text-3xl font-black tracking-tight">История прослушиваний</h1>
      </div>

      {loading ? (
        <p className="py-16 text-center text-neutral-400">Загрузка…</p>
      ) : records.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center text-neutral-400">
          <Music2 size={32} className="opacity-40" />
          Пока ничего не прослушано.
        </div>
      ) : (
        <div className="flex flex-col">
          {records.map((r, i) => {
            const track = tracks[r.track_id];
            const ready = Boolean(track);
            const active = currentTrack?.id === r.track_id;
            return (
              <div
                key={`${r.track_id}-${i}`}
                onClick={() => handlePlay(r)}
                className={cn(
                  'group grid grid-cols-[24px_1fr_auto] items-center gap-4 rounded-md px-4 py-2 transition-colors',
                  ready ? 'cursor-pointer hover:bg-white/5' : 'opacity-60',
                  active && 'bg-white/10',
                )}
              >
                <div className="flex items-center justify-center">
                  {active && isPlaying ? (
                    <Pause size={16} className="text-accent" fill="currentColor" />
                  ) : ready ? (
                    <>
                      <Play size={16} className="hidden text-white group-hover:block" fill="currentColor" />
                      <span className={cn('text-sm group-hover:hidden', active ? 'text-accent' : 'text-neutral-500')}>
                        {i + 1}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-neutral-600">{i + 1}</span>
                  )}
                </div>

                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-gradient-to-br from-neutral-700 to-neutral-900 font-bold text-neutral-300">
                    {r.title[0]}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className={cn('truncate font-bold', active ? 'text-accent' : 'text-white')}>{r.title}</span>
                    <span className="truncate text-sm text-neutral-400">{r.artist_name}</span>
                  </div>
                </div>

                <span className="text-sm text-neutral-500">{formatWhen(r.listened_at)}</span>
              </div>
            );
          })}

          {hasMore && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => fetchPage(records.length)}
                disabled={loadingMore}
                className="rounded-full bg-white/10 px-8 py-3 text-sm font-bold transition-all hover:bg-white/20 hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {loadingMore ? 'Загрузка…' : 'Показать ещё'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
