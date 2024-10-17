"use client"

import React, { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { WalletInfo } from "../index"
import { ConnectWalletBtn } from "@components"

const WalletConnectionManager = () => {
    const { isConnected } = useAccount()
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(typeof window !== "undefined")
    }, [])

    return isClient ? isConnected ? <WalletInfo /> : <ConnectWalletBtn /> : null
}

export default WalletConnectionManager
