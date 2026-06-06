import { apiFetch, tokenStore } from './api';
import type { Track, User, Genre, Playlist, HistoryRecord, TokenResponse } from '@/entities/types';

export const authApi = {
  register: (body: { email: string; username: string; password: string }) =>
    apiFetch<User>('/auth/register', { method: 'POST', body: JSON.stringify(body), skipAuth: true }),

  login: (body: { email: string; password: string }) =>
    apiFetch<TokenResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body), skipAuth: true }),

  logout: () => {
    const refresh_token = tokenStore.refresh;
    return apiFetch<void>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refresh_token }),
    });
  },
};

export const userApi = {
  me: () => apiFetch<User>('/users/me'),
  update: (body: { email?: string; username?: string }) =>
    apiFetch<User>('/users/me', { method: 'PATCH', body: JSON.stringify(body) }),
};

export const trackApi = {
  list: (limit = 50, offset = 0) => apiFetch<Track[]>(`/tracks?limit=${limit}&offset=${offset}`),
  search: (q: string, limit = 30, offset = 0) =>
    apiFetch<Track[]>(`/tracks/search?q=${encodeURIComponent(q)}&limit=${limit}&offset=${offset}`),
  genres: () => apiFetch<Genre[]>('/tracks/genres'),
  get: (id: string) => apiFetch<Track>(`/tracks/${id}`),
  play: (id: string) => apiFetch<Track>(`/tracks/${id}/play`, { method: 'POST' }),
};

export const favoriteApi = {
  list: () => apiFetch<Track[]>('/favorites/tracks'),
  add: (trackId: string) => apiFetch<void>(`/favorites/tracks/${trackId}`, { method: 'POST' }),
  remove: (trackId: string) => apiFetch<void>(`/favorites/tracks/${trackId}`, { method: 'DELETE' }),
};

export const playlistApi = {
  list: () => apiFetch<Playlist[]>('/playlists'),
  create: (body: { name: string; description?: string }) =>
    apiFetch<Playlist>('/playlists', { method: 'POST', body: JSON.stringify(body) }),
  get: (id: string) => apiFetch<Playlist>(`/playlists/${id}`),
  update: (id: string, body: { name: string; description?: string }) =>
    apiFetch<Playlist>(`/playlists/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (id: string) => apiFetch<void>(`/playlists/${id}`, { method: 'DELETE' }),
  tracks: (id: string) => apiFetch<Track[]>(`/playlists/${id}/tracks`),
  addTrack: (playlistId: string, trackId: string) =>
    apiFetch<void>(`/playlists/${playlistId}/tracks/${trackId}`, { method: 'POST' }),
  removeTrack: (playlistId: string, trackId: string) =>
    apiFetch<void>(`/playlists/${playlistId}/tracks/${trackId}`, { method: 'DELETE' }),
};

export const historyApi = {
  list: (limit = 50, offset = 0) =>
    apiFetch<HistoryRecord[]>(`/listening-history?limit=${limit}&offset=${offset}`),
};

export const adminApi = {
  createTrack: (form: FormData) => apiFetch<Track>('/admin/tracks', { method: 'POST', body: form }),
  updateTrack: (
    id: string,
    body: {
      title: string;
      artist_name: string;
      album_name: string;
      genre_id: string;
      duration_seconds: number;
      file_url: string;
    },
  ) => apiFetch<Track>(`/admin/tracks/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteTrack: (id: string) => apiFetch<void>(`/admin/tracks/${id}`, { method: 'DELETE' }),
  setSubscription: (userId: string, type: 'FREE' | 'PREMIUM') =>
    apiFetch<User>(`/admin/users/${userId}/subscription`, { method: 'PATCH', body: JSON.stringify({ type }) }),
};
