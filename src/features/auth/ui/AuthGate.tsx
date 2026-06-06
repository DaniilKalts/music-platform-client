'use client';

import React from 'react';
import { Lock } from 'lucide-react';
import { useAuthStore } from '@/features/auth/model/store';

interface AuthGateProps {
  title?: string;
  description?: string;
}

export const AuthGate: React.FC<AuthGateProps> = ({
  title = 'Войдите, чтобы продолжить',
  description = 'Гости могут слушать музыку. Избранное, плейлисты и история доступны после входа.',
}) => {
  const openAuth = useAuthStore((s) => s.openAuth);
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-5 text-center animate-fade-in">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-white/5 text-accent">
        <Lock size={30} />
      </div>
      <h2 className="text-2xl font-black">{title}</h2>
      <p className="max-w-sm text-neutral-400">{description}</p>
      <button
        onClick={() => openAuth('login')}
        className="rounded-full bg-accent px-8 py-3 font-bold text-black transition-transform hover:scale-105 active:scale-95"
      >
        Войти
      </button>
    </div>
  );
};
