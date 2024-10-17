import React, { useState, useEffect } from "react"

import { useWeb3Modal } from "@web3modal/wagmi/react"
import { BtnWithAction } from "@components"

import styles from "./ConnectWalletBtn.module.scss"

const ConnectWalletBtn = () => {
    const [isClient, setIsClient] = useState(false)
    const { open } = useWeb3Modal()

    useEffect(() => {
        setIsClient(true)
    }, [])

    if (!isClient) return null

    return (
        <div className={styles.connectButtonWrapper}>
            <BtnWithAction onClickAction={() => open()} buttonText="Connect" />
        </div>
    )
}

export default ConnectWalletBtn
