import React, { useRef } from "react"
import Link from "next/link"
import { useModal } from "../../../../context/ModalProvider"
import styles from "./WalletMenu.module.scss"

const WalletMenu = ({
    balanceData,
    formattedPrice,
    onDisconnect,
    isHovered,
    isClient,
    address,
}) => {
    const defaultBalanceData = { formatted: "0", symbol: "N/A" }
    const actualBalanceData = balanceData || defaultBalanceData
    const modalRef = useRef(null)

    const { openModal } = useModal()

    const handleChatClick = () => {
        openModal("chat", address)
    }

    // Klassenname basierend auf isHovered
    const menuClassNames = isHovered ? `${styles.walletMenu} ${styles.visible}` : styles.walletMenu

    // Nur rendern, wenn isClient true ist
    if (!isClient) return null

    return balanceData ? (
        <div className={menuClassNames}>
            <div
                className={`${styles.walletMenuLinks} ${styles.walletMenuBalance}`}
                title={`${actualBalanceData.formatted} ${balanceData.symbol}`}
            >
                <p>
                    {formattedPrice} {balanceData.symbol}
                </p>
            </div>
            <Link className={styles.walletMenuLinks} href="/">
                <button>Home</button>
            </Link>
            <Link className={styles.walletMenuLinks} href="/withdraw-proceeds">
                <button>Credits</button>
            </Link>
            <Link className={styles.walletMenuLinks} href="/my-nft">
                <button>My NFT</button>
            </Link>
            <Link className={`${styles.walletMenuLinks} ${styles.hidden}`} href="/sell-nft">
                <button>Sell</button>
            </Link>
            <Link className={`${styles.walletMenuLinks} ${styles.hidden}`} href="/swap-nft">
                <button>Swap</button>
            </Link>
            <div className={styles.walletMenuLinks} onClick={handleChatClick}>
                <button>Chat</button>
            </div>
            <div className={styles.walletMenuLinks} onClick={onDisconnect}>
                <button>Disconnect</button>
            </div>
        </div>
    ) : null
}

export default WalletMenu
