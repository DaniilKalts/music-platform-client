'use client';

import React from 'react';
import { Home, Search, Library } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/lib/cn';

const ITEMS = [
  { href: '/', label: 'Главная', icon: Home },
  { href: '/search', label: 'Поиск', icon: Search },
  { href: '/library', label: 'Медиатека', icon: Library },
];

export const MobileNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-around border-t border-white/10 bg-black/95 px-2 py-2 backdrop-blur-md lg:hidden">
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 rounded-lg py-1 text-[11px] font-medium transition-colors',
              active ? 'text-white' : 'text-neutral-500 hover:text-neutral-300',
            )}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 2} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
};
