'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/widgets/Sidebar/ui/Sidebar';
import { PlayerBar } from '@/features/player/ui/PlayerBar';
import { TopNav } from '@/widgets/TopNav/ui/TopNav';
import { RightSidebar } from '@/widgets/RightSidebar/ui/RightSidebar';
import { MobileNav } from '@/widgets/MobileNav/ui/MobileNav';
import { AuthInit } from '@/features/auth/ui/AuthInit';
import { AuthRedirect } from '@/features/auth/ui/AuthRedirect';
import { PlaylistDialog } from '@/features/playlists/ui/PlaylistDialog';
import { Toaster } from '@/shared/ui/Toaster';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const bare = pathname === '/login';

  if (bare) {
    return (
      <>
        <AuthInit />
        <Toaster />
        {children}
      </>
    );
  }

  return (
    <>
      <AuthInit />
      <AuthRedirect />
      <PlaylistDialog />
      <Toaster />
      <div className="flex h-screen flex-col overflow-hidden">
        <div className="flex flex-1 gap-2 overflow-hidden p-2">
          <Sidebar />
          <main className="relative flex flex-1 flex-col overflow-hidden rounded-lg bg-gradient-to-b from-neutral-900/80 to-neutral-950">
            <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[140%] -translate-x-1/2 rounded-full bg-accent/15 blur-[120px]" />
            <TopNav />
            <div className="scrollbar-hide relative flex-1 overflow-y-auto p-4 sm:p-8">{children}</div>
          </main>
          <RightSidebar />
        </div>
        <PlayerBar />
        <MobileNav />
      </div>
    </>
  );
};
