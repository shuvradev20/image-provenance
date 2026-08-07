'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'

export default function AuthInitializer() {
  const { checkAuthSession, listenToWalletChanges } = useAuthStore()

  useEffect(() => {
    checkAuthSession()
    listenToWalletChanges()
  }, [checkAuthSession, listenToWalletChanges])

  return null
}