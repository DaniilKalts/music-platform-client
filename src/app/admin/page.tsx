'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, UploadCloud, Crown, Loader2, Lock, Music, ListMusic, Search, Pencil, Trash2, X, Check } from 'lucide-react';
import { adminApi, trackApi } from '@/shared/api/services';
import { useAuthStore } from '@/features/auth/model/store';
import { toast } from '@/shared/ui/toast';
import { ApiError } from '@/shared/api/api';
import type { Genre, Track } from '@/entities/types';

export default function AdminPage() {
  const { status, user } = useAuthStore();

  if (status === 'loading') {
    return <p className="py-20 text-center text-neutral-400 animate-fade-in">Загрузка…</p>;
  }

  if (status !== 'authenticated' || user?.role !== 'ADMIN') {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-5 text-center animate-fade-in">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-white/5 text-netflix-red">
          <Lock size={30} />
        </div>
        <h2 className="text-2xl font-black">Доступ только для администраторов</h2>
        <p className="max-w-sm text-neutral-400">Этот раздел доступен пользователям с ролью ADMIN.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 animate-fade-in-up">
      <div className="flex items-center gap-4">
        <ShieldCheck size={32} className="text-accent" />
        <h1 className="text-3xl font-black tracking-tight">Админ-панель</h1>
      </div>

      <UploadTrack />
      <ManageTracks />
      <ChangeSubscription />
    </div>
  );
}

const inputClass =
  'h-11 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm outline-none transition-all placeholder:text-neutral-500 focus:border-accent focus:ring-2 focus:ring-accent/30';

const ManageTracks: React.FC = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Track | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    trackApi.genres().then(setGenres).catch(() => setGenres([]));
  }, []);

  useEffect(() => {
    const q = query.trim();
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const data = q ? await trackApi.search(q, 30) : await trackApi.list(30);
        setTracks(data);
      } catch {
        setTracks([]);
      } finally {
        setLoading(false);
      }
    }, q ? 350 : 0);
    return () => clearTimeout(t);
  }, [query]);

  const remove = async (track: Track) => {
    if (!window.confirm(`Удалить трек «${track.title}»?`)) return;
    setBusyId(track.id);
    try {
      await adminApi.deleteTrack(track.id);
      setTracks((prev) => prev.filter((t) => t.id !== track.id));
      toast.success(`Трек «${track.title}» удалён`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Не удалось удалить трек');
    } finally {
      setBusyId(null);
    }
  };

  const saved = (updated: Track) => {
    setTracks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setEditing(null);
  };

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex items-center gap-2">
        <ListMusic size={20} className="text-accent" />
        <h2 className="text-lg font-black">Управление треками</h2>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
        <input
          className={`${inputClass} w-full pl-10`}
          placeholder="Поиск по названию, исполнителю, альбому или жанру"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-neutral-400">Загрузка…</p>
      ) : tracks.length === 0 ? (
        <p className="py-8 text-center text-sm text-neutral-400">Треки не найдены.</p>
      ) : (
        <div className="flex flex-col divide-y divide-white/5">
          {tracks.map((track) =>
            editing?.id === track.id ? (
              <EditTrack key={track.id} track={track} genres={genres} onSaved={saved} onCancel={() => setEditing(null)} />
            ) : (
              <div key={track.id} className="flex items-center gap-3 py-2.5">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded bg-white/5 text-xs font-bold text-neutral-400">
                  {track.title.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{track.title}</p>
                  <p className="truncate text-xs text-neutral-400">
                    {track.artist_name} • {track.album_name} • {track.genre_name}
                  </p>
                </div>
                <button
                  onClick={() => setEditing(track)}
                  aria-label="Редактировать"
                  className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-white/10 hover:text-accent"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => remove(track)}
                  disabled={busyId === track.id}
                  aria-label="Удалить"
                  className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-white/10 hover:text-netflix-red disabled:opacity-50"
                >
                  {busyId === track.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
              </div>
            ),
          )}
        </div>
      )}
    </section>
  );
};

const EditTrack: React.FC<{
  track: Track;
  genres: Genre[];
  onSaved: (track: Track) => void;
  onCancel: () => void;
}> = ({ track, genres, onSaved, onCancel }) => {
  const [title, setTitle] = useState(track.title);
  const [artist, setArtist] = useState(track.artist_name);
  const [album, setAlbum] = useState(track.album_name);
  const [genreId, setGenreId] = useState(track.genre_id);
  const [duration, setDuration] = useState(String(track.duration_seconds));
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await adminApi.updateTrack(track.id, {
        title: title.trim(),
        artist_name: artist.trim(),
        album_name: album.trim(),
        genre_id: genreId,
        duration_seconds: Number(duration),
        file_url: track.file_url,
      });
      toast.success(`Трек «${updated.title}» обновлён`);
      onSaved(updated);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Не удалось обновить трек');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 py-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input className={inputClass} placeholder="Название" required value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className={inputClass} placeholder="Исполнитель" required value={artist} onChange={(e) => setArtist(e.target.value)} />
        <input className={inputClass} placeholder="Альбом" required value={album} onChange={(e) => setAlbum(e.target.value)} />
        <input className={inputClass} type="number" min={1} placeholder="Длительность, сек" required value={duration} onChange={(e) => setDuration(e.target.value)} />
      </div>

      <select className={inputClass} required value={genreId} onChange={(e) => setGenreId(e.target.value)}>
        {genres.map((g) => (
          <option key={g.id} value={g.id} className="bg-neutral-800">
            {g.name}
          </option>
        ))}
      </select>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex h-10 items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-bold text-black transition-all hover:bg-accent-hover active:scale-95 disabled:opacity-50"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          Сохранить
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex h-10 items-center justify-center gap-2 rounded-full bg-white/10 px-5 text-sm font-bold transition-colors hover:bg-white/20"
        >
          <X size={16} />
          Отмена
        </button>
      </div>
    </form>
  );
};

const UploadTrack: React.FC = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [genreId, setGenreId] = useState('');
  const [duration, setDuration] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    trackApi.genres().then(setGenres).catch(() => setGenres([]));
  }, []);

  const reset = () => {
    setTitle('');
    setArtist('');
    setAlbum('');
    setGenreId('');
    setDuration('');
    setFile(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Выберите аудиофайл');
      return;
    }
    setLoading(true);
    try {
      const form = new FormData();
      form.append('title', title.trim());
      form.append('artist_name', artist.trim());
      form.append('album_name', album.trim());
      form.append('genre_id', genreId);
      form.append('duration_seconds', duration);
      form.append('file', file);
      await adminApi.createTrack(form);
      toast.success(`Трек «${title.trim()}» добавлен`);
      reset();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Не удалось загрузить трек');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex items-center gap-2">
        <UploadCloud size={20} className="text-accent" />
        <h2 className="text-lg font-black">Загрузить трек</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <input className={inputClass} placeholder="Название" required value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className={inputClass} placeholder="Исполнитель" required value={artist} onChange={(e) => setArtist(e.target.value)} />
        <input className={inputClass} placeholder="Альбом" required value={album} onChange={(e) => setAlbum(e.target.value)} />
        <input className={inputClass} type="number" min={1} placeholder="Длительность, сек" required value={duration} onChange={(e) => setDuration(e.target.value)} />
      </div>

      <select className={inputClass} required value={genreId} onChange={(e) => setGenreId(e.target.value)}>
        <option value="" disabled>
          Выберите жанр
        </option>
        {genres.map((g) => (
          <option key={g.id} value={g.id} className="bg-neutral-800">
            {g.name}
          </option>
        ))}
      </select>

      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/15 px-4 py-4 transition-colors hover:border-accent/50 hover:bg-white/[0.03]">
        <Music size={20} className="text-neutral-400" />
        <span className="flex-1 truncate text-sm text-neutral-300">{file ? file.name : 'Выберите аудиофайл (mp3)'}</span>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">Обзор</span>
        <input type="file" accept="audio/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="flex h-11 items-center justify-center gap-2 self-start rounded-full bg-accent px-6 text-sm font-bold text-black transition-all hover:bg-accent-hover hover:scale-[1.02] active:scale-95 disabled:opacity-50"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
        Загрузить
      </button>
    </form>
  );
};

const ChangeSubscription: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [type, setType] = useState<'FREE' | 'PREMIUM'>('PREMIUM');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim()) return;
    setLoading(true);
    try {
      const updated = await adminApi.setSubscription(userId.trim(), type);
      toast.success(`${updated.username}: подписка → ${updated.subscription_type}`);
      setUserId('');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Не удалось изменить подписку');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex items-center gap-2">
        <Crown size={20} className="text-accent" />
        <h2 className="text-lg font-black">Изменить подписку пользователя</h2>
      </div>

      <input className={`${inputClass} w-full`} placeholder="ID пользователя (UUID)" value={userId} onChange={(e) => setUserId(e.target.value)} />

      <div className="flex gap-2">
        {(['FREE', 'PREMIUM'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${
              type === t ? 'bg-accent text-black' : 'bg-white/5 text-neutral-300 hover:bg-white/10'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading || !userId.trim()}
        className="flex h-11 items-center justify-center gap-2 self-start rounded-full bg-accent px-6 text-sm font-bold text-black transition-all hover:bg-accent-hover hover:scale-[1.02] active:scale-95 disabled:opacity-50"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Crown size={18} />}
        Применить
      </button>
    </form>
  );
};
