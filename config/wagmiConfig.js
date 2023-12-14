import { sepolia } from "wagmi"
import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react"

// Configuration for WalletConnect and Wagmi
// project-Id from https://walletconnect.com
const projectId = "b1cc00b672bdffd144b48bba5e1a8932"

// Set metadata
const metadata = {
    name: "W3I Marketplace",
    description: "W3I Marketplace description",
    url: "http://localhost:3000",
    icons: ["http://localhost:3000"],
}
// Set chains check imports with "wagmi"
const chains = [sepolia]

// Wagmi Config
export const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })

// Web3 Modal
export const web3Modal = createWeb3Modal({
    wagmiConfig,
    projectId,
    chains,
    themeMode: "light",
})
