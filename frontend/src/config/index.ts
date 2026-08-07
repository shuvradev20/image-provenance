import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { arbitrumSepolia, type AppKitNetwork } from '@reown/appkit/networks'

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID

if (!projectId) {
  throw new Error('NEXT_PUBLIC_PROJECT_ID is missing from env!')
}

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [arbitrumSepolia]

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig