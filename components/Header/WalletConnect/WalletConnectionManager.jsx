import React, { useEffect, useState } from "react"

import { useAccount, useDisconnect } from "wagmi"
import { useWeb3Modal } from "@web3modal/wagmi/react"

import WalletInfo from "../WalletConnect/WalletInfo/WalletInfo"
import ConnectWalletBtn from "../WalletConnect/ConnectWalletButton/ConnectWalletBtn"

const WalletConnectionManager = () => {
    const [isClient, setIsClient] = useState(false)
    const { isConnected } = useAccount()
    const { open } = useWeb3Modal()
    const { disconnect } = useDisconnect()

    useEffect(() => {
        setIsClient(typeof window !== "undefined")
    }, [])

    // Initialisierungscheck nicht mehr nötig, da isClient denselben Zweck erfüllt
    return isClient ? (
        isConnected ? (
            <WalletInfo onDisconnect={disconnect} isClient={isClient} />
        ) : (
            <ConnectWalletBtn onConnect={() => open()} isClient={isClient} />
        )
    ) : null
}

export default WalletConnectionManager
