"use client"

import { configureChains, sepolia } from "wagmi"
import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react"
import { alchemyProvider } from "wagmi/providers/alchemy"
import { infuraProvider } from "wagmi/providers/infura"
import { jsonRpcProvider } from "wagmi/providers/jsonRpc"

// Constants for Configuration
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
const apiKeyInfura = process.env.NEXT_PUBLIC_INFURA_API_KEY
const apiKeyAlchemy = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY

// Metadata configuration for the Web3 modal
const metadata = {
    name: "W3I Marketplace",
    description: "W3I Marketplace description",
    url: "https://localhost:3000",
    icons: ["https://localhost:3000"],
}

// Chains configuration, using the 'sepolia' testnet from Wagmi
const { chains, publicClient } = configureChains(
    [sepolia],
    [
        infuraProvider({ apiKey: apiKeyInfura }),
        alchemyProvider({ apiKey: apiKeyAlchemy }),
        jsonRpcProvider({
            rpc: (sepolia) => ({
                http: "https://rpc2.sepolia.org",
            }),
        }),
    ]
)

// Wagmi Configuration Object
export const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata, publicClient })

// Web3 Modal Configuration
export const web3Modal = createWeb3Modal({
    wagmiConfig,
    projectId,
    publicClient,
    chains,
    defaultChain: chains,
    themeMode: "light",
})
