'use client';

import React, { useEffect } from 'react';
import { Library as LibraryIcon, Plus, Heart, Trash2, Pencil } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/features/auth/model/store';
import { usePlaylistsStore } from '@/features/playlists/model/store';
import { usePlaylistDialog } from '@/features/playlists/model/dialog';
import { AuthGate } from '@/features/auth/ui/AuthGate';
import { FREE_PLAYLIST_LIMIT } from '@/shared/lib/limits';
import type { Playlist } from '@/entities/types';

export default function LibraryPage() {
  const status = useAuthStore((s) => s.status);
  const isFree = useAuthStore((s) => s.user?.subscription_type === 'FREE');
  const { playlists, loading, load, remove } = usePlaylistsStore();
  const { openCreate, openEdit } = usePlaylistDialog();

  useEffect(() => {
    if (status === 'authenticated') load();
  }, [status, load]);

  const handleEdit = (e: React.MouseEvent, playlist: Playlist) => {
    e.preventDefault();
    e.stopPropagation();
    openEdit(playlist);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Удалить плейлист?')) {
      try {
        await remove(id);
      } catch {}
    }
  };

  if (status === 'guest') {
    return (
      <AuthGate
        title="Войдите в медиатеку"
        description="Здесь будут ваши плейлисты и любимые треки. Войдите, чтобы начать."
      />
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <LibraryIcon size={32} />
          <div className="flex flex-col">
            <h1 className="text-3xl font-black tracking-tight">Медиатека</h1>
            {isFree && (
              <span className="text-sm font-medium text-neutral-400">
                {playlists.length} / {FREE_PLAYLIST_LIMIT} плейлистов · FREE
              </span>
            )}
          </div>
        </div>
        <button
          onClick={openCreate}
          aria-label="Создать плейлист"
          className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        <Link
          href="/favorites"
          className="group flex cursor-pointer flex-col gap-3 rounded-xl bg-white/5 p-4 shadow-xl transition-colors hover:bg-white/10"
        >
          <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-md bg-gradient-to-br from-accent to-accent-deep shadow-lg">
            <Heart size={56} fill="white" color="white" className="transition-transform duration-500 group-hover:scale-110" />
          </div>
          <div className="flex flex-col gap-1 overflow-hidden">
            <span className="truncate text-lg font-bold">Любимые треки</span>
            <span className="text-sm font-medium text-neutral-400">Плейлист</span>
          </div>
        </Link>

        {playlists.map((p) => (
          <Link
            key={p.id}
            href={`/playlist/${p.id}`}
            className="group relative flex cursor-pointer flex-col gap-3 rounded-xl bg-white/5 p-4 shadow-xl transition-colors hover:bg-white/10"
          >
            <div className="absolute right-3 top-3 z-10 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={(e) => handleEdit(e, p)}
                aria-label="Редактировать плейлист"
                className="grid h-8 w-8 place-items-center rounded-full bg-black/60 text-neutral-300 transition-colors hover:bg-black hover:text-white"
              >
                <Pencil size={15} />
              </button>
              <button
                onClick={(e) => handleDelete(e, p.id)}
                aria-label="Удалить плейлист"
                className="grid h-8 w-8 place-items-center rounded-full bg-black/60 text-neutral-300 transition-colors hover:bg-black hover:text-netflix-red"
              >
                <Trash2 size={15} />
              </button>
            </div>
            <div className="aspect-square w-full overflow-hidden rounded-md shadow-lg">
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-700 to-neutral-900 text-4xl font-black text-neutral-400 transition-transform duration-500 group-hover:scale-110">
                {p.name[0]?.toUpperCase()}
              </div>
            </div>
            <div className="flex flex-col gap-1 overflow-hidden">
              <span className="truncate text-lg font-bold">{p.name}</span>
              <span className="truncate text-sm font-medium text-neutral-400">
                {p.description || 'Плейлист'}
              </span>
            </div>
          </Link>
        ))}

        <button
          onClick={openCreate}
          className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 text-neutral-400 transition-colors hover:border-white/30 hover:text-white"
        >
          <Plus size={32} />
          <span className="text-sm font-bold">Новый плейлист</span>
        </button>
      </div>

      {loading && playlists.length === 0 && (
        <p className="text-center text-neutral-500">Загрузка плейлистов…</p>
      )}
    </div>
  );
}
