import React from "react"
import Link from "next/link"

import { useModal } from "@context/ModalProvider"

import styles from "./WalletMenu.module.scss"

const WalletMenu = ({ balanceData, formattedPrice, onDisconnect, isOpen, isClient, address }) => {
    if (!isClient) return null

    const defaultBalanceData = { formatted: "0", symbol: "N/A" }
    const actualBalanceData = balanceData || defaultBalanceData
    const { openModal } = useModal()
    const menuClassNames = isOpen ? `${styles.walletMenu} ${styles.visible}` : styles.walletMenu

    const handleChatClick = () => {
        openModal("chat", address)
    }

    return (
        <div className={menuClassNames}>
            <div
                className={`${styles.walletMenuLinks} ${styles.walletMenuBalance}`}
                title={`${actualBalanceData.formatted} ${actualBalanceData.symbol}`}
            >
                <p>
                    {formattedPrice} {actualBalanceData.symbol}
                </p>
            </div>
            <Link href="/" passHref className={styles.walletMenuLinks}>
                Home
            </Link>
            <Link href="/withdraw-proceeds" passHref className={styles.walletMenuLinks}>
                Credits
            </Link>
            <Link href="/my-nft" passHref className={styles.walletMenuLinks}>
                My NFT
            </Link>
            <Link
                href="/sell-nft"
                passHref
                className={`${styles.walletMenuLinks} ${styles.hidden}`}
            >
                Sell
            </Link>
            <Link
                href="/swap-nft"
                passHref
                className={`${styles.walletMenuLinks} ${styles.hidden}`}
            >
                Swap
            </Link>
            <div className={styles.walletMenuLinks} onClick={handleChatClick}>
                Chat
            </div>
            <div
                className={`${styles.walletMenuLinks} ${styles.disconnect}`}
                onClick={onDisconnect}
            >
                <button>Disconnect</button>
            </div>
        </div>
    )
}

export default WalletMenu
