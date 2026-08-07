'use client'

import { ReactNode, useEffect } from 'react'
import { createAppKit, useAppKitTheme } from '@reown/appkit/react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiAdapter, projectId, networks } from '@/config'
import { useTheme } from 'next-themes'

const queryClient = new QueryClient()

if (!projectId) {
  throw new Error('Project ID is missing!')
}

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  features: {
    analytics: true
  }
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
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppKitThemeSync />
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}