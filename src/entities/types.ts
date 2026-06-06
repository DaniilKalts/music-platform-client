export interface Track {
  id: string;
  title: string;
  artist_id: string;
  artist_name: string;
  album_id: string;
  album_name: string;
  genre_id: string;
  genre_name: string;
  duration_seconds: number;
  file_url: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: 'USER' | 'ADMIN';
  subscription_type: 'FREE' | 'PREMIUM';
  created_at: string;
}

export interface Genre {
  id: string;
  name: string;
}

export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface HistoryRecord {
  track_id: string;
  title: string;
  artist_name: string;
  listened_at: string;
}

export interface TokenResponse {
  access_token: string;
  access_token_expires_at: string;
  refresh_token: string;
  refresh_token_expires_at: string;
}
