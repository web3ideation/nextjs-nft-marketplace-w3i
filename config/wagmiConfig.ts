"use client"

// External Library Imports
import { sepolia } from "wagmi"
import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react"

// Constants for Configuration
const projectId = "b1cc00b672bdffd144b48bba5e1a8932" // Project ID for WalletConnect

// Metadata configuration for the Web3 modal
const metadata = {
    name: "W3I Marketplace",
    description: "W3I Marketplace description",
    url: "http://localhost:3000",
    icons: ["http://localhost:3000"],
}

// Chains configuration, using the 'sepolia' testnet from Wagmi
const chains = [sepolia]

// Wagmi Configuration Object
// Includes the chains, project ID, and metadata for the setup
export const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })

// Web3 Modal Configuration
// This configures the modal with the above settings and a light theme
export const web3Modal = createWeb3Modal({
    wagmiConfig,
    projectId,
    chains,
    themeMode: "light",
})
