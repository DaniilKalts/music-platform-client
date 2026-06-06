'use client';

import React from 'react';
import { Home, Search, Library, Plus, Heart, History } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/lib/cn';
import { Logo } from '@/shared/ui/Logo';
import { useAuthStore } from '@/features/auth/model/store';
import { usePlaylistsStore } from '@/features/playlists/model/store';
import { usePlaylistDialog } from '@/features/playlists/model/dialog';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const status = useAuthStore((s) => s.status);
  const openAuth = useAuthStore((s) => s.openAuth);
  const { playlists, loading } = usePlaylistsStore();
  const openCreate = usePlaylistDialog((s) => s.openCreate);

  const authed = status === 'authenticated';

  const handleCreate = () => {
    if (!authed) {
      openAuth('login');
      return;
    }
    openCreate();
  };

  return (
    <aside className="hidden w-64 shrink-0 flex-col gap-2 lg:flex">
      <div className="flex flex-col gap-4 rounded-lg bg-neutral-900/60 p-4">
        <div className="mb-2 px-2">
          <Logo size="md" />
        </div>

        <nav className="flex flex-col gap-1">
          {[
            { href: '/', label: 'Главная', icon: Home },
            { href: '/search', label: 'Поиск', icon: Search },
            { href: '/history', label: 'История', icon: History },
          ].map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-4 rounded-md px-3 py-2 font-bold transition-all duration-200',
                  active ? 'bg-white/10 text-white' : 'text-neutral-400 hover:bg-white/5 hover:text-white',
                )}
              >
                <Icon size={24} strokeWidth={active ? 2.5 : 2} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-lg bg-neutral-900/60 p-2">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 text-neutral-400">
            <Library size={24} />
            <span className="font-bold">Моя медиатека</span>
          </div>
          <button
            onClick={handleCreate}
            aria-label="Создать плейлист"
            className="rounded-full p-1 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
          >
            <Plus size={20} />
          </button>
        </div>

        {!authed ? (
          <div className="mx-2 mt-2 flex flex-col gap-3 rounded-lg bg-white/5 p-4">
            <span className="font-bold">Создайте медиатеку</span>
            <span className="text-sm text-neutral-400">Войдите, чтобы добавлять треки в избранное и собирать плейлисты.</span>
            <button
              onClick={() => openAuth('login')}
              className="mt-1 self-start rounded-full bg-white px-4 py-1.5 text-sm font-bold text-black transition-transform hover:scale-105"
            >
              Войти
            </button>
          </div>
        ) : (
          <div className="mt-1 flex flex-col gap-1 overflow-y-auto px-1 scrollbar-hide">
            <Link
              href="/favorites"
              className={cn(
                'group flex items-center gap-3 rounded-md p-2 transition-all hover:bg-white/5',
                pathname === '/favorites' && 'bg-white/5',
              )}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-br from-accent to-accent-deep shadow-lg transition-transform group-hover:scale-105">
                <Heart size={20} fill="white" color="white" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className={cn('truncate font-bold', pathname === '/favorites' ? 'text-accent' : 'text-white')}>
                  Любимые треки
                </span>
                <span className="text-xs font-medium text-neutral-400">Плейлист</span>
              </div>
            </Link>

            {loading && playlists.length === 0 && (
              <div className="px-2 py-3 text-sm text-neutral-500">Загрузка…</div>
            )}

            {playlists.map((p) => {
              const active = pathname === `/playlist/${p.id}`;
              return (
                <Link
                  key={p.id}
                  href={`/playlist/${p.id}`}
                  className={cn('group flex items-center gap-3 rounded-md p-2 transition-all hover:bg-white/5', active && 'bg-white/5')}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-neutral-800 text-lg font-black text-neutral-400 shadow-lg transition-transform group-hover:scale-105">
                    {p.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className={cn('truncate font-bold', active ? 'text-accent' : 'text-white')}>{p.name}</span>
                    <span className="text-xs font-medium text-neutral-400">Плейлист</span>
                  </div>
                </Link>
              );
            })}

            {!loading && playlists.length === 0 && (
              <button
                onClick={handleCreate}
                className="mx-1 mt-1 rounded-md px-2 py-3 text-left text-sm text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                + Создать первый плейлист
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
