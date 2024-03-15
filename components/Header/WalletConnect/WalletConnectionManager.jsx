import React from "react"
import { useAccount, useDisconnect } from "wagmi"
import { useWeb3Modal } from "@web3modal/wagmi/react"
import WalletInfo from "../WalletConnect/WalletInfo/WalletInfo"
import ConnectWalletBtn from "../WalletConnect/ConnectWalletButton/ConnectWalletBtn"

const WalletConnectionManager = () => {
    const { isConnected } = useAccount()
    const { open } = useWeb3Modal()
    const { disconnect } = useDisconnect()

    return isConnected ? (
        <WalletInfo onDisconnect={disconnect} />
    ) : (
        <ConnectWalletBtn onConnect={() => open()} />
    )
}

export default WalletConnectionManager
