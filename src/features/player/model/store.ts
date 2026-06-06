import { create } from 'zustand';
import { Track } from '@/entities/types';
import { trackApi } from '@/shared/api/services';

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  volume: number;
  currentTime: number;
  duration: number;

  playTrack: (track: Track, queue?: Track[]) => void;
  togglePlayPause: () => void;
  setVolume: (vol: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  clearTrack: () => void;
}

const recordPlay = (track: Track) => {
  trackApi.play(track.id).catch(() => {});
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  queue: [],
  volume: 1,
  currentTime: 0,
  duration: 0,

  playTrack: (track, queue) => {
    recordPlay(track);
    set((state) => ({
      currentTrack: track,
      isPlaying: true,
      queue: queue || state.queue,
    }));
  },

  togglePlayPause: () => {
    set((state) => ({ isPlaying: !state.isPlaying }));
  },

  setVolume: (vol) => set({ volume: Math.max(0, Math.min(1, vol)) }),

  setCurrentTime: (time) => set({ currentTime: time }),

  setDuration: (duration) => set({ duration }),

  nextTrack: () => {
    const { currentTrack, queue } = get();
    if (!currentTrack || queue.length === 0) return;

    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    if (currentIndex !== -1 && currentIndex < queue.length - 1) {
      const next = queue[currentIndex + 1];
      recordPlay(next);
      set({ currentTrack: next, isPlaying: true });
    }
  },

  prevTrack: () => {
    const { currentTrack, queue } = get();
    if (!currentTrack || queue.length === 0) return;

    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    if (currentIndex > 0) {
      const prev = queue[currentIndex - 1];
      recordPlay(prev);
      set({ currentTrack: prev, isPlaying: true });
    }
  },

  clearTrack: () => set({ currentTrack: null, isPlaying: false, queue: [], currentTime: 0, duration: 0 }),
}));
