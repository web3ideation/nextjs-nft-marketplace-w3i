import React, { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useBalance, useDisconnect, useAccount } from "wagmi"
import { useModal } from "@context"
import { truncatePrice } from "@utils"
import styles from "./WalletMenu.module.scss"

const WalletMenu = ({ isOpen, isClient }) => {
    const { address } = useAccount()
    const { openModal } = useModal()
    const { disconnect } = useDisconnect()

    const { data: balanceData, refetch: refetchBalance } = useBalance({
        address,
        watch: true,
        cacheTime: 2000,
        blockTag: "latest",
    })
    const [formattedBalance, setFormattedBalance] = useState("")
    const defaultBalanceData = { formatted: "0", symbol: "N/A" }

    const menuClassNames = isOpen ? `${styles.walletMenu} ${styles.visible}` : styles.walletMenu

    const handleChatClick = useCallback(() => {
        openModal("chat", address)
    }, [openModal, address])

    const handleWelcomeClick = useCallback(() => {
        openModal("welcome")
    }, [openModal])

    useEffect(() => {
        if (balanceData) {
            setFormattedBalance(truncatePrice(balanceData?.formatted || "0", 5))
        }
    }, [balanceData])

    useEffect(() => {
        if (isOpen) {
            refetchBalance()
        }
    }, [isOpen, refetchBalance])

    if (!isClient) return null

    return (
        <div className={menuClassNames}>
            <div
                className={`${styles.walletMenuLinks} ${styles.walletMenuBalance}`}
                title={`${balanceData?.formatted} ${
                    balanceData?.symbol || defaultBalanceData.symbol
                }`}
                aria-label={`${balanceData?.formatted} ${
                    balanceData?.symbol || defaultBalanceData.symbol
                }`}
            >
                <p
                    aria-label={`${formattedBalance} ${
                        balanceData?.symbol || defaultBalanceData.symbol
                    }`}
                >
                    {formattedBalance} {balanceData?.symbol || defaultBalanceData.symbol}
                </p>
            </div>
            <Link href="/" passHref aria-label="Home" className={styles.walletMenuLinks}>
                Home
            </Link>
            <div
                aria-label="Welcome"
                className={styles.walletMenuLinks}
                onClick={handleWelcomeClick}
            >
                Welcome
            </div>
            <Link
                href="/withdraw-proceeds"
                passHref
                aria-label="Credits"
                className={styles.walletMenuLinks}
            >
                Credits
            </Link>
            <Link href="/my-nfts" passHref aria-label="My-NFT" className={styles.walletMenuLinks}>
                My NFTs
            </Link>
            <Link
                href="/sell-nft"
                passHref
                aria-label="Sell"
                className={`${styles.walletMenuLinks} ${styles.hidden}`}
            >
                Sell
            </Link>
            <Link
                href="/swap-nft"
                passHref
                aria-label="Swap"
                className={`${styles.walletMenuLinks} ${styles.hidden}`}
            >
                Swap
            </Link>
            <div aria-label="Chat" className={styles.walletMenuLinks} onClick={handleChatClick}>
                Chat
            </div>
            <div className={`${styles.walletMenuLinks} ${styles.disconnect}`} onClick={disconnect}>
                <button aria-label="Disconnect">Disconnect</button>
            </div>
        </div>
    )
}

export default WalletMenu
