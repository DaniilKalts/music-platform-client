'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Music2, Play, Pencil, Trash2, Plus, Check } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { playlistApi, trackApi } from '@/shared/api/services';
import { useAuthStore } from '@/features/auth/model/store';
import { usePlayerStore } from '@/features/player/model/store';
import { usePlaylistsStore } from '@/features/playlists/model/store';
import { usePlaylistDialog } from '@/features/playlists/model/dialog';
import { AuthGate } from '@/features/auth/ui/AuthGate';
import { TrackRow } from '@/entities/track/ui/TrackRow';
import type { Playlist, Track } from '@/entities/types';

export default function PlaylistPage() {
  const params = useParams();
  const id = (Array.isArray(params?.id) ? params?.id[0] : params?.id) as string | undefined;
  const router = useRouter();

  const status = useAuthStore((s) => s.status);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const removeFromStore = usePlaylistsStore((s) => s.remove);
  const storeEntry = usePlaylistsStore((s) => s.playlists.find((p) => p.id === id));
  const openEdit = usePlaylistDialog((s) => s.openEdit);

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [catalog, setCatalog] = useState<Track[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [meta, list] = await Promise.all([playlistApi.get(id), playlistApi.tracks(id)]);
      setPlaylist(meta);
      setTracks(list);
      setNotFound(false);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (status === 'authenticated') load();
    else if (status === 'guest') setLoading(false);
  }, [status, load]);

  useEffect(() => {
    if (storeEntry) setPlaylist(storeEntry);
  }, [storeEntry]);

  const openAddPanel = async () => {
    setShowAdd((v) => !v);
    if (catalog.length === 0) {
      try {
        setCatalog(await trackApi.list(50));
      } catch {}
    }
  };

  const addTrack = async (track: Track) => {
    if (!id) return;
    try {
      await playlistApi.addTrack(id, track.id);
      setTracks((prev) => (prev.some((t) => t.id === track.id) ? prev : [...prev, track]));
    } catch {}
  };

  const removeTrack = async (trackId: string) => {
    if (!id) return;
    setTracks((prev) => prev.filter((t) => t.id !== trackId));
    try {
      await playlistApi.removeTrack(id, trackId);
    } catch {
      load();
    }
  };

  const deletePlaylist = async () => {
    if (!id) return;
    if (window.confirm('Удалить плейлист?')) {
      try {
        await removeFromStore(id);
        router.push('/library');
      } catch {}
    }
  };

  if (status === 'guest') {
    return <AuthGate title="Войдите, чтобы открыть плейлист" />;
  }

  if (loading) {
    return <p className="py-20 text-center text-neutral-400 animate-fade-in">Загрузка…</p>;
  }

  if (notFound || !playlist) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center text-neutral-400">
        <Music2 size={48} />
        <p>Плейлист не найден.</p>
      </div>
    );
  }

  const addable = catalog.filter((c) => !tracks.some((t) => t.id === c.id));

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="-mx-4 -mt-4 flex flex-col items-center gap-6 bg-gradient-to-b from-neutral-700/70 to-transparent p-6 sm:-mx-8 sm:-mt-8 sm:flex-row sm:items-end sm:p-10">
        <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-neutral-600 to-neutral-800 shadow-2xl sm:h-52 sm:w-52">
          <Music2 size={80} className="text-neutral-300" />
        </div>
        <div className="flex flex-col gap-2 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-widest">Плейлист</span>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">{playlist.name}</h1>
          {playlist.description && <p className="text-neutral-300">{playlist.description}</p>}
          <div className="mt-2 text-sm font-bold text-neutral-300">{tracks.length} треков</div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => tracks.length && playTrack(tracks[0], tracks)}
          disabled={tracks.length === 0}
          className="grid h-14 w-14 place-items-center rounded-full bg-accent text-black shadow-xl transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
          aria-label="Слушать"
        >
          <Play size={26} fill="currentColor" className="ml-0.5" />
        </button>
        <button onClick={openAddPanel} className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold transition-colors hover:bg-white/20">
          <Plus size={18} /> Добавить треки
        </button>
        <button onClick={() => playlist && openEdit(playlist)} aria-label="Переименовать" className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white">
          <Pencil size={18} />
        </button>
        <button onClick={deletePlaylist} aria-label="Удалить" className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-white/10 hover:text-netflix-red">
          <Trash2 size={18} />
        </button>
      </div>

      {showAdd && (
        <div className="flex flex-col gap-1 rounded-xl bg-white/5 p-3 animate-fade-in">
          <span className="px-2 py-1 text-sm font-bold text-neutral-300">Добавить из каталога</span>
          {addable.length === 0 ? (
            <p className="px-2 py-3 text-sm text-neutral-500">Все треки уже добавлены.</p>
          ) : (
            addable.map((t) => (
              <div key={t.id} className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-white/5">
                <div className="flex h-9 w-9 items-center justify-center rounded bg-gradient-to-br from-neutral-700 to-neutral-900 text-sm font-bold text-neutral-300">
                  {t.title[0]}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-bold">{t.title}</span>
                  <span className="truncate text-xs text-neutral-400">{t.artist_name}</span>
                </div>
                <button
                  onClick={() => addTrack(t)}
                  className="grid h-8 w-8 place-items-center rounded-full bg-accent text-black transition-transform hover:scale-110"
                  aria-label="Добавить"
                >
                  <Plus size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {tracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-neutral-400">
          <Check size={32} className="opacity-40" />
          В этом плейлисте пока нет треков. Нажмите «Добавить треки».
        </div>
      ) : (
        <div className="flex flex-col">
          {tracks.map((track, i) => (
            <TrackRow key={track.id} track={track} index={i} queue={tracks} onRemove={() => removeTrack(track.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
