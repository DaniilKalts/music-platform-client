'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MoreHorizontal, Copy, Download, Check, Loader2 } from 'lucide-react';
import type { Track } from '@/entities/types';
import { cn } from '@/shared/lib/cn';

export const TrackMenu: React.FC<{ track: Track }> = ({ track }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const copyTitle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(`${track.artist_name} — ${track.title}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const download = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloading(true);
    try {
      const res = await fetch(track.file_url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${track.artist_name} - ${track.title}.mp3`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      window.open(track.file_url, '_blank');
    } finally {
      setDownloading(false);
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-label="Действия с треком"
        className={cn(
          'grid h-9 w-9 -m-1.5 place-items-center rounded-full text-neutral-400 transition-all hover:bg-white/10 hover:text-white',
          open ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        )}
      >
        <MoreHorizontal size={18} />
      </button>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-full right-0 z-30 mb-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-neutral-800 p-1 shadow-2xl animate-scale-in"
        >
          <button
            onClick={copyTitle}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-neutral-200 transition-colors hover:bg-white/10"
          >
            {copied ? <Check size={18} className="text-accent" /> : <Copy size={18} />}
            {copied ? 'Скопировано' : 'Скопировать трек'}
          </button>
          <button
            onClick={download}
            disabled={downloading}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-neutral-200 transition-colors hover:bg-white/10 disabled:opacity-60"
          >
            {downloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            Скачать
          </button>
        </div>
      )}
    </div>
  );
};
