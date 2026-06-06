'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/features/auth/model/store';
import { Logo } from '@/shared/ui/Logo';
import { ApiError } from '@/shared/api/api';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthScreen />
    </Suspense>
  );
}

const AuthScreen: React.FC = () => {
  const router = useRouter();
  const params = useSearchParams();
  const { status, login, register } = useAuthStore();

  const [mode, setMode] = useState<'login' | 'register'>(params?.get('mode') === 'register' ? 'register' : 'login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') router.replace('/');
  }, [status, router]);

  const isRegister = mode === 'register';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isRegister) await register(email, username, password);
      else await login(email, password);
      router.replace('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось подключиться к серверу.');
      setLoading(false);
    }
  };

  const inputClass =
    'h-14 w-full rounded-xl border border-white/10 bg-white/[0.04] px-5 text-base outline-none transition-all placeholder:text-neutral-500 focus:border-accent focus:bg-white/[0.07] focus:ring-2 focus:ring-accent/30';

  return (
    <div className="flex h-screen w-screen bg-black text-white">
      <aside className="relative hidden w-[46%] shrink-0 overflow-hidden lg:block">
        <img src="/didjay.avif" alt="DJ" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
        <div className="absolute inset-0 bg-accent/10 mix-blend-overlay" />

        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <Logo size="lg" />

          <div className="flex flex-col gap-4">
            <div className="flex items-end gap-1.5">
              {[0, 0.15, 0.3, 0.45, 0.6].map((d, i) => (
                <span
                  key={i}
                  className="h-8 w-1.5 animate-bounce-playing rounded-full bg-accent"
                  style={{ animationDelay: `${d}s` }}
                />
              ))}
            </div>
            <h1 className="max-w-md text-5xl font-black leading-[1.05] drop-shadow-2xl">
              Не музыка.<br />
              <span className="bg-gradient-to-r from-white to-accent bg-clip-text text-transparent">Мьюзиканто.</span>
            </h1>
            <p className="max-w-sm text-lg text-white/80">
              Миллионы треков и ни одной причины для тишины.
            </p>
          </div>
        </div>
      </aside>

      <main className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-[460px] animate-fade-in-up">
          <Link
            href="/"
            className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-neutral-400 transition-colors hover:text-white"
          >
            <ArrowLeft size={16} /> На главную
          </Link>

          <div className="mb-8 lg:hidden">
            <Logo size="md" />
          </div>

          <h2 className="text-4xl font-black tracking-tight">{isRegister ? 'Создать аккаунт' : 'С возвращением'}</h2>
          <p className="mt-2 text-base text-neutral-400">
            {isRegister ? 'Заполните данные, чтобы начать слушать' : 'Войдите, чтобы продолжить'}
          </p>

          <form onSubmit={submit} className="mt-8 flex flex-col gap-5">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Email</span>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} />
            </label>

            {isRegister && (
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Имя пользователя</span>
                <input type="text" required minLength={3} maxLength={30} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="dj_max" className={inputClass} />
              </label>
            )}

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Пароль</span>
              <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Минимум 8 символов" className={inputClass} />
            </label>

            {error && <p className="text-sm font-medium text-netflix-red">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex h-14 items-center justify-center gap-2 rounded-full bg-accent text-base font-bold text-black transition-all hover:bg-accent-hover hover:scale-[1.02] active:scale-95 disabled:opacity-60"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {isRegister ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-neutral-400">
            {isRegister ? 'Уже есть аккаунт?' : 'Ещё нет аккаунта?'}{' '}
            <button
              onClick={() => {
                setError(null);
                setMode(isRegister ? 'login' : 'register');
              }}
              className="font-bold text-white underline-offset-2 hover:underline"
            >
              {isRegister ? 'Войти' : 'Создать'}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
};
