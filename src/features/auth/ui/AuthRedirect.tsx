'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/features/auth/model/store';

export const AuthRedirect: React.FC = () => {
  const authRedirect = useAuthStore((s) => s.authRedirect);
  const clear = useAuthStore((s) => s.clearAuthRedirect);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!authRedirect) return;
    if (pathname !== '/login') router.push(`/login?mode=${authRedirect}`);
    clear();
  }, [authRedirect, pathname, router, clear]);

  return null;
};
