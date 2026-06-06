'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/model/store';
import { usePlaylistsStore } from '@/features/playlists/model/store';

export const AuthInit: React.FC = () => {
  const init = useAuthStore((s) => s.init);
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (status === 'authenticated') usePlaylistsStore.getState().load(true);
    else if (status === 'guest') usePlaylistsStore.getState().reset();
  }, [status]);

  return null;
};
