'use client'

import React, { ReactNode, useState, useEffect } from 'react'
import { createAppKit, useAppKitTheme } from '@reown/appkit/react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiAdapter, projectId, networks } from '@/config'
import { useTheme } from 'next-themes'

if (!projectId) {
  throw new Error('Project ID is missing!')
}

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  features: {
    analytics: false,
    email: false,
    socials: false,
  },
})

function AppKitThemeSync() {
  const { theme } = useTheme()
  const { setThemeMode } = useAppKitTheme()

  useEffect(() => {
    if (theme === 'dark' || theme === 'light') {
      setThemeMode(theme)
    }
  }, [theme, setThemeMode])

  return null
}

export function Web3Provider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
      },
    },
  }))

  // 💡 SSR Mismatch prevent korar jonno Mount Guard
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppKitThemeSync />
        {mounted ? children : null}
      </QueryClientProvider>
    </WagmiProvider>
  )
}