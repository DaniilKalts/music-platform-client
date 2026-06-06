'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { usePlayerStore } from '@/features/player/model/store';

const MIN_WIDTH = 260;
const MAX_WIDTH = 560;
const STORAGE_KEY = 'rs_width';

export const RightSidebar: React.FC = () => {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const clearTrack = usePlayerStore((s) => s.clearTrack);
  const [width, setWidth] = useState(() => {
    if (typeof window === 'undefined') return 320;
    const saved = Number(localStorage.getItem(STORAGE_KEY));
    return saved >= MIN_WIDTH && saved <= MAX_WIDTH ? saved : 320;
  });
  const dragging = useRef(false);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current) return;
    const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, window.innerWidth - e.clientX - 16));
    setWidth(next);
  }, []);

  const stopDrag = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
    setWidth((w) => {
      localStorage.setItem(STORAGE_KEY, String(w));
      return w;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', stopDrag);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', stopDrag);
    };
  }, [onMouseMove, stopDrag]);

  const startDrag = () => {
    dragging.current = true;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  };

  if (!currentTrack) return null;

  return (
    <aside
      style={{ width }}
      className="relative hidden shrink-0 flex-col gap-6 overflow-y-auto rounded-lg bg-neutral-900/60 p-4 scrollbar-hide xl:flex"
    >
      <div
        onMouseDown={startDrag}
        className="group absolute left-0 top-0 z-20 flex h-full w-2 cursor-col-resize items-center justify-center"
      >
        <div className="h-12 w-1 rounded-full bg-white/10 transition-colors group-hover:bg-accent" />
      </div>

      <div className="flex items-center justify-between">
        <span className="font-bold">Сейчас играет</span>
        <button
          onClick={clearTrack}
          aria-label="Закрыть"
          className="grid h-9 w-9 place-items-center rounded-full text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex flex-col gap-4 animate-fade-in">
        <div className="aspect-square w-full overflow-hidden rounded-xl shadow-2xl">
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-teal-500 via-cyan-700 to-neutral-900">
            <span className="text-7xl font-black text-white/90 drop-shadow-lg">{currentTrack.title[0]}</span>
          </div>
        </div>
        <div className="flex flex-col">
          <h2 className="cursor-pointer text-2xl font-bold hover:underline">{currentTrack.title}</h2>
          <span className="cursor-pointer text-neutral-400 hover:text-white hover:underline">{currentTrack.artist_name}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl bg-white/5 p-4">
        <span className="text-sm font-bold">Об исполнителе</span>
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-accent to-accent-deep font-bold text-black">
            {currentTrack.artist_name[0]}
          </div>
          <span className="font-bold">{currentTrack.artist_name}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-xl bg-white/5 p-4 text-sm">
        <div className="flex justify-between gap-4">
          <span className="shrink-0 text-neutral-400">Альбом</span>
          <span className="truncate font-medium">{currentTrack.album_name}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="shrink-0 text-neutral-400">Жанр</span>
          <span className="truncate font-medium">{currentTrack.genre_name}</span>
        </div>
      </div>
    </aside>
  );
};
