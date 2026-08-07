import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { arbitrumSepolia, type AppKitNetwork } from '@reown/appkit/networks'

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'b564170bc26d010d21e069f21f1d198d'

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [arbitrumSepolia]

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig