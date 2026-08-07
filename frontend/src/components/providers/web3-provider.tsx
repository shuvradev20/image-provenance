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
  allWallets: 'HIDE', 
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
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppKitThemeSync />
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}