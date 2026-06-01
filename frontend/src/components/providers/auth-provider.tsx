'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const checkAuthSession = useAuthStore((state) => state.checkAuthSession);
  const listenToWalletChanges = useAuthStore((state) => state.listenToWalletChanges);

  useEffect(() => {
    checkAuthSession();
    listenToWalletChanges();
  }, [checkAuthSession, listenToWalletChanges]);

  return <>{children}</>;
}