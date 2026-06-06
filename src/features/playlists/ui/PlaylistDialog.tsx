'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, ListMusic, Loader2 } from 'lucide-react';
import { usePlaylistDialog } from '@/features/playlists/model/dialog';
import { usePlaylistsStore } from '@/features/playlists/model/store';
import { useAuthStore } from '@/features/auth/model/store';
import { FREE_PLAYLIST_LIMIT } from '@/shared/lib/limits';
import { ApiError } from '@/shared/api/api';

export const PlaylistDialog: React.FC = () => {
  const { open, mode, playlist, close } = usePlaylistDialog();
  const create = usePlaylistsStore((s) => s.create);
  const update = usePlaylistsStore((s) => s.update);
  const count = usePlaylistsStore((s) => s.playlists.length);
  const subscription = useAuthStore((s) => s.user?.subscription_type);
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setName(mode === 'edit' ? playlist?.name ?? '' : '');
      setDescription(mode === 'edit' ? playlist?.description ?? '' : '');
      setError(null);
      setLoading(false);
    }
  }, [open, mode, playlist]);

  if (!open) return null;

  const isEdit = mode === 'edit';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    if (!isEdit && subscription === 'FREE' && count >= FREE_PLAYLIST_LIMIT) {
      setError(`Лимит — ${FREE_PLAYLIST_LIMIT} плейлиста на бесплатном тарифе. Оформите Premium для безлимита.`);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const body = { name: trimmed, description: description.trim() || undefined };
      if (isEdit && playlist) {
        await update(playlist.id, body);
      } else {
        const created = await create(trimmed, body.description);
        router.push(`/playlist/${created.id}`);
      }
      close();
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setError(`Лимит — ${FREE_PLAYLIST_LIMIT} плейлиста на бесплатном тарифе. Оформите Premium.`);
      } else {
        setError(err instanceof ApiError ? err.message : 'Не удалось сохранить плейлист.');
      }
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in"
      onClick={close}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900 p-7 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          aria-label="Закрыть"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X size={20} />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent-deep text-black shadow-lg">
            <ListMusic size={24} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-2xl font-black tracking-tight">{isEdit ? 'Редактировать плейлист' : 'Новый плейлист'}</h2>
            <p className="text-sm text-neutral-400">{isEdit ? 'Измените название и описание' : 'Назовите свою подборку'}</p>
          </div>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Название</span>
            <input
              autoFocus
              type="text"
              required
              maxLength={255}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Мой плейлист"
              className="h-12 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm outline-none transition-all placeholder:text-neutral-500 focus:border-accent focus:bg-white/[0.07] focus:ring-2 focus:ring-accent/30"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Описание</span>
            <textarea
              rows={3}
              maxLength={1000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Необязательно"
              className="resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none transition-all placeholder:text-neutral-500 focus:border-accent focus:bg-white/[0.07] focus:ring-2 focus:ring-accent/30"
            />
          </label>

          {error && <p className="text-sm font-medium text-netflix-red">{error}</p>}

          <div className="mt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={close}
              className="rounded-full px-5 py-2.5 text-sm font-bold text-neutral-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex h-11 items-center justify-center gap-2 rounded-full bg-accent px-6 text-sm font-bold text-black transition-all hover:bg-accent-hover hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {isEdit ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
