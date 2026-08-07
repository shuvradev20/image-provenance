'use client'

import React, { ReactNode, useState, useEffect } from 'react'
import { createAppKit } from '@reown/appkit/react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiAdapter, projectId, networks } from '@/config'

// 💡 Prevent AppKit Re-creation/Re-execution on Next.js Layout Renders
let isAppKitInitialized = false

if (typeof window !== 'undefined' && !isAppKitInitialized && projectId) {
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
  isAppKitInitialized = true
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

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {mounted ? children : null}
      </QueryClientProvider>
    </WagmiProvider>
  )
}