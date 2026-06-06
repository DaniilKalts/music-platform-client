import { create } from 'zustand';
import { authApi, userApi, favoriteApi } from '@/shared/api/services';
import { tokenStore, ApiError } from '@/shared/api/api';
import { toast } from '@/shared/ui/toast';
import { FREE_FAVORITES_LIMIT } from '@/shared/lib/limits';
import type { User } from '@/entities/types';

type Status = 'loading' | 'authenticated' | 'guest';

interface AuthState {
  user: User | null;
  status: Status;
  favoriteIds: Set<string>;
  authRedirect: 'login' | 'register' | null;

  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;

  openAuth: (mode?: 'login' | 'register') => void;
  clearAuthRedirect: () => void;
  setUser: (user: User) => void;

  isFavorite: (trackId: string) => boolean;
  
  toggleFavorite: (trackId: string) => Promise<boolean>;
}

async function loadFavorites(): Promise<Set<string>> {
  try {
    const tracks = await favoriteApi.list();
    return new Set(tracks.map((t) => t.id));
  } catch {
    return new Set();
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  status: 'loading',
  favoriteIds: new Set(),
  authRedirect: null,

  init: async () => {
    if (!tokenStore.access) {
      set({ status: 'guest', user: null });
      return;
    }
    try {
      const user = await userApi.me();
      const favoriteIds = await loadFavorites();
      set({ user, status: 'authenticated', favoriteIds });
    } catch {
      tokenStore.clear();
      set({ status: 'guest', user: null });
    }
  },

  login: async (email, password) => {
    const tokens = await authApi.login({ email, password });
    tokenStore.set(tokens.access_token, tokens.refresh_token);
    const user = await userApi.me();
    const favoriteIds = await loadFavorites();
    set({ user, status: 'authenticated', favoriteIds, authRedirect: null });
  },

  register: async (email, username, password) => {
    await authApi.register({ email, username, password });
    await get().login(email, password);
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {}
    tokenStore.clear();
    set({ user: null, status: 'guest', favoriteIds: new Set() });
  },

  openAuth: (mode = 'login') => set({ authRedirect: mode }),
  clearAuthRedirect: () => set({ authRedirect: null }),
  setUser: (user) => set({ user }),

  isFavorite: (trackId) => get().favoriteIds.has(trackId),

  toggleFavorite: async (trackId) => {
    const { status, favoriteIds, user } = get();
    if (status !== 'authenticated') {
      get().openAuth('login');
      return false;
    }

    const wasFav = favoriteIds.has(trackId);

    if (!wasFav && user?.subscription_type === 'FREE' && favoriteIds.size >= FREE_FAVORITES_LIMIT) {
      toast.error(`Лимит избранного — ${FREE_FAVORITES_LIMIT} треков на бесплатном тарифе. Оформите Premium для безлимита.`);
      return false;
    }

    const next = new Set(favoriteIds);
    if (wasFav) next.delete(trackId);
    else next.add(trackId);
    set({ favoriteIds: next });

    try {
      if (wasFav) await favoriteApi.remove(trackId);
      else await favoriteApi.add(trackId);
      return !wasFav;
    } catch (err) {
      set({ favoriteIds });
      if (err instanceof ApiError && err.status === 401) {
        get().openAuth('login');
      } else if (err instanceof ApiError && err.status === 403) {
        toast.error(`Лимит избранного — ${FREE_FAVORITES_LIMIT} треков. Оформите Premium для безлимита.`);
      } else {
        toast.error('Не удалось обновить избранное');
      }
      return wasFav;
    }
  },
}));
