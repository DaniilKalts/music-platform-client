'use client';

import React, { useEffect, useState } from 'react';
import { User as UserIcon, Crown, Loader2, Check, LogOut } from 'lucide-react';
import { userApi } from '@/shared/api/services';
import { useAuthStore } from '@/features/auth/model/store';
import { AuthGate } from '@/features/auth/ui/AuthGate';
import { ApiError } from '@/shared/api/api';

export default function ProfilePage() {
  const { status, user, setUser, logout } = useAuthStore();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setUsername(user.username);
    }
  }, [user]);

  if (status === 'guest') {
    return <AuthGate title="Войдите в профиль" />;
  }

  if (!user) {
    return <p className="py-20 text-center text-neutral-400 animate-fade-in">Загрузка…</p>;
  }

  const dirty = email !== user.email || username !== user.username;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const updated = await userApi.update({
        email: email !== user.email ? email : undefined,
        username: username !== user.username ? username : undefined,
      });
      setUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось сохранить.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 animate-fade-in-up">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <div className="grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-accent to-accent-deep text-black shadow-2xl">
          <UserIcon size={48} />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Профиль</span>
          <h1 className="text-4xl font-black tracking-tight">{user.username}</h1>
          <div className="flex items-center justify-center gap-2 sm:justify-start">
            <span
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                user.subscription_type === 'PREMIUM' ? 'bg-accent/20 text-accent' : 'bg-white/10 text-neutral-300'
              }`}
            >
              {user.subscription_type === 'PREMIUM' && <Crown size={14} />}
              {user.subscription_type}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-neutral-300">{user.role}</span>
          </div>
        </div>
      </div>

      <form onSubmit={save} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-lg font-black">Настройки аккаунта</h2>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Имя пользователя</span>
          <input
            type="text"
            minLength={3}
            maxLength={50}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="h-12 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </label>

        {error && <p className="text-sm font-medium text-netflix-red">{error}</p>}

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={!dirty || saving}
            className="flex h-11 items-center justify-center gap-2 rounded-full bg-accent px-6 font-bold text-black transition-all hover:bg-accent-hover hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : saved ? <Check size={18} /> : null}
            {saved ? 'Сохранено' : 'Сохранить'}
          </button>

          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-neutral-300 transition-colors hover:bg-white/10 hover:text-netflix-red"
          >
            <LogOut size={18} /> Выйти
          </button>
        </div>
      </form>
    </div>
  );
}
