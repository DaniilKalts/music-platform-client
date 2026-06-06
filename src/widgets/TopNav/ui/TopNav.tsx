'use client';

import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Crown, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/features/auth/model/store';
import { Logo } from '@/shared/ui/Logo';
import { cn } from '@/shared/lib/cn';

export const TopNav: React.FC = () => {
  const { status, user, openAuth, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 bg-gradient-to-b from-black/60 to-transparent p-4 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <div className="lg:hidden">
          <Logo size="sm" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {status === 'loading' ? (
          <div className="h-9 w-24 animate-pulse rounded-full bg-white/10" />
        ) : status === 'guest' ? (
          <>
            <button
              onClick={() => openAuth('register')}
              className="hidden text-sm font-bold text-neutral-300 transition-colors hover:text-white sm:block"
            >
              Регистрация
            </button>
            <button
              onClick={() => openAuth('login')}
              className="rounded-full bg-accent px-5 py-2 text-sm font-bold text-black transition-all hover:bg-accent-hover hover:scale-105 active:scale-95"
            >
              Войти
            </button>
          </>
        ) : (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2.5 rounded-full bg-black/60 p-1.5 pr-4 transition-colors hover:bg-neutral-800"
            >
              <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-accent to-accent-deep text-black">
                <User size={20} />
              </div>
              <span className="hidden max-w-[160px] truncate text-base font-bold sm:inline">{user?.username}</span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-neutral-800 p-1 shadow-2xl animate-scale-in">
                <div className="flex items-center gap-2 px-3 py-3">
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate text-sm font-bold">{user?.username}</span>
                    <span className="truncate text-xs text-neutral-400">{user?.email}</span>
                  </div>
                  {user?.subscription_type === 'PREMIUM' && (
                    <Crown size={16} className="ml-auto text-accent" />
                  )}
                </div>
                <div className="my-1 h-px bg-white/10" />
                <MenuLink href="/profile" icon={User} label="Профиль" onClick={() => setMenuOpen(false)} />
                {user?.role === 'ADMIN' && (
                  <MenuLink href="/admin" icon={ShieldCheck} label="Админ-панель" onClick={() => setMenuOpen(false)} />
                )}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-neutral-200 transition-colors hover:bg-white/10"
                >
                  <LogOut size={18} />
                  Выйти
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

const MenuLink: React.FC<{ href: string; icon: React.ElementType; label: string; onClick: () => void }> = ({
  href,
  icon: Icon,
  label,
  onClick,
}) => (
  <Link
    href={href}
    onClick={onClick}
    className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-200 transition-colors hover:bg-white/10')}
  >
    <Icon size={18} />
    {label}
  </Link>
);
