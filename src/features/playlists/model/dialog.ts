import { create } from 'zustand';
import type { Playlist } from '@/entities/types';

interface PlaylistDialogState {
  open: boolean;
  mode: 'create' | 'edit';
  playlist: Playlist | null;
  openCreate: () => void;
  openEdit: (playlist: Playlist) => void;
  close: () => void;
}

export const usePlaylistDialog = create<PlaylistDialogState>((set) => ({
  open: false,
  mode: 'create',
  playlist: null,
  openCreate: () => set({ open: true, mode: 'create', playlist: null }),
  openEdit: (playlist) => set({ open: true, mode: 'edit', playlist }),
  close: () => set({ open: false }),
}));
