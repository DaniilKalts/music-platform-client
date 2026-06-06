import { create } from 'zustand';
import { playlistApi } from '@/shared/api/services';
import type { Playlist } from '@/entities/types';

interface PlaylistsState {
  playlists: Playlist[];
  loaded: boolean;
  loading: boolean;
  load: (force?: boolean) => Promise<void>;
  create: (name: string, description?: string) => Promise<Playlist>;
  update: (id: string, body: { name: string; description?: string }) => Promise<Playlist>;
  remove: (id: string) => Promise<void>;
  reset: () => void;
}

export const usePlaylistsStore = create<PlaylistsState>((set, get) => ({
  playlists: [],
  loaded: false,
  loading: false,

  load: async (force = false) => {
    if (get().loading) return;
    if (get().loaded && !force) return;
    set({ loading: true });
    try {
      const playlists = await playlistApi.list();
      set({ playlists, loaded: true });
    } catch {
      set({ playlists: [] });
    } finally {
      set({ loading: false });
    }
  },

  create: async (name, description) => {
    const playlist = await playlistApi.create({ name, description });
    set((s) => ({ playlists: [...s.playlists, playlist] }));
    return playlist;
  },

  update: async (id, body) => {
    const updated = await playlistApi.update(id, body);
    set((s) => ({ playlists: s.playlists.map((p) => (p.id === id ? updated : p)) }));
    return updated;
  },

  remove: async (id) => {
    await playlistApi.remove(id);
    set((s) => ({ playlists: s.playlists.filter((p) => p.id !== id) }));
  },

  reset: () => set({ playlists: [], loaded: false }),
}));
