"use client"

import React, { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import WalletInfo from "../WalletConnect/WalletInfo/WalletInfo"
import ConnectWalletBtn from "@components/Btn/ConnectWalletBtn/ConnectWalletBtn"

const WalletConnectionManager = () => {
    const { isConnected } = useAccount()
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(typeof window !== "undefined")
    }, [])

    return isClient ? isConnected ? <WalletInfo /> : <ConnectWalletBtn /> : null
}

export default WalletConnectionManager
