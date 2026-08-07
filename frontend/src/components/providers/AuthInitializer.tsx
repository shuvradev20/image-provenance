'use client'

import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/useAuthStore'

export default function AuthInitializer() {
  const checkAuthSession = useAuthStore((state) => state.checkAuthSession)
  const listenToWalletChanges = useAuthStore((state) => state.listenToWalletChanges)
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      checkAuthSession()
      listenToWalletChanges()
    }
  }, []) 

  return null
}