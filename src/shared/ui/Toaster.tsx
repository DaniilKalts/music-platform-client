'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useToast, type ToastType } from '@/shared/ui/toast';
import { cn } from '@/shared/lib/cn';

const ICONS: Record<ToastType, React.ElementType> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const ACCENTS: Record<ToastType, string> = {
  success: 'text-accent',
  error: 'text-netflix-red',
  info: 'text-white',
};

export const Toaster: React.FC = () => {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-[200] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
      {toasts.map((t) => {
        const Icon = ICONS[t.type];
        return (
          <div
            key={t.id}
            className="flex items-start gap-3 rounded-xl border border-white/10 bg-neutral-800/95 p-3 pr-2 shadow-2xl backdrop-blur-sm animate-fade-in-up"
          >
            <Icon size={20} className={cn('mt-0.5 shrink-0', ACCENTS[t.type])} />
            <p className="flex-1 text-sm font-medium text-neutral-100">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Закрыть"
              className="shrink-0 rounded-md p-1 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
