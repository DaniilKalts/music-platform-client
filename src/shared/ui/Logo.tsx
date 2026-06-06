'use client';

import React from 'react';
import Link from 'next/link';
import { Disc3 } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

type Size = 'sm' | 'md' | 'lg';

const SIZES: Record<Size, { box: string; icon: number; text: string }> = {
  sm: { box: 'h-8 w-8', icon: 18, text: 'text-lg' },
  md: { box: 'h-9 w-9', icon: 20, text: 'text-xl' },
  lg: { box: 'h-11 w-11', icon: 26, text: 'text-2xl' },
};

interface LogoProps {
  size?: Size;
  href?: string | null;
  withText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', href = '/', withText = true, className }) => {
  const s = SIZES[size];

  const content = (
    <span className={cn('group inline-flex items-center gap-2.5 select-none', className)}>
      <span
        className={cn(
          'relative grid shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent-deep text-black shadow-lg ring-1 ring-white/10',
          s.box,
        )}
      >
        <Disc3 size={s.icon} className="transition-transform duration-700 group-hover:rotate-[360deg]" />
      </span>
      {withText && (
        <span
          className={cn(
            'bg-gradient-to-r from-white via-white to-accent bg-clip-text font-black tracking-tight text-transparent',
            s.text,
          )}
        >
          Мьюзиканто
        </span>
      )}
    </span>
  );

  if (href === null) return content;
  return (
    <Link href={href} className="transition-transform hover:scale-[1.03]">
      {content}
    </Link>
  );
};
