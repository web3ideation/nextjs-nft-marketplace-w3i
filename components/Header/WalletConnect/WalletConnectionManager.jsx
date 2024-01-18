import { useEffect, useState, useRef } from "react"
import Link from "next/link"

// wagmi Hooks for Ethereum Interaction
import { useAccount, useBalance, useDisconnect } from "wagmi"
import { useWeb3Modal } from "@web3modal/wagmi/react"

// Utility Functions
import { truncateStr, truncatePrice } from "../../../utils/formatting"

import { useModal } from "../../../context/ModalProvider"

// Styles
import styles from "../../../styles/Home.module.css"

/**
 * Component to display wallet information.
 * @param {function} onDisconnect Callback for disconnecting the wallet.
 * @param {boolean} isClient Flag to check if running on client-side.
 */
// Component to display wallet information
const WalletInfo = ({ onDisconnect, isClient }) => {
    const { address } = useAccount()
    const { data: balanceData, refetch } = useBalance({ address })
    const [formattedAddress, setFormattedAddress] = useState("")
    const [formattedPrice, setFormattedPrice] = useState("")
    const menuRef = useRef(null)
    const modalRef = useRef(null)

    // Verwenden Sie ModalContext
    const { openModal } = useModal()

    const handleChatClick = () => {
        openModal("chat", address)
    }

    const defaultBalanceData = { formatted: "0", symbol: "N/A" }
    const actualBalanceData = balanceData || defaultBalanceData

    const updateBalance = () => {
        refetch()
    }

    // Update wallet info when address or balance changes
    useEffect(() => {
        if (isClient) {
            setFormattedAddress(truncateStr(address, 4, 4))
            setFormattedPrice(truncatePrice(balanceData?.formatted || "0", 5))
        }
    }, [address, balanceData, isClient])

    if (!isClient) return null

    return (
        <>
            <div
                className={styles.headerAccountInfoWrapper}
                ref={menuRef}
                onMouseEnter={updateBalance}
            >
                <div className={styles.onlineDot}></div>
                <div className={styles.headerAccountInfo}>
                    <div title={address}>{formattedAddress}</div>
                </div>
                <div className={styles.menuIcon}>
                    <img src="media/arrow_down.png" alt="Menu Arrow"></img>
                </div>
                {balanceData && (
                    <div className={styles.walletMenu}>
                        <div
                            className={`${styles.walletMenuLinks} ${styles.walletMenuBalance}`}
                            title={`${actualBalanceData.formatted} ${balanceData.symbol}`}
                        >
                            <p>
                                {formattedPrice} {balanceData.symbol}
                            </p>
                        </div>
                        <Link className={styles.walletMenuLinks} href="/withdraw-proceeds">
                            <button>Credits</button>
                        </Link>{" "}
                        <Link className={styles.walletMenuLinks} href="/my-nft">
                            <button>My NFT</button>
                        </Link>
                        <Link className={styles.walletMenuLinks} href="/">
                            <button>Home</button>
                        </Link>
                        <div className={styles.walletMenuLinks} onClick={handleChatClick}>
                            <button>Chat</button>
                        </div>
                        <div className={styles.walletMenuLinks}>
                            <button onClick={onDisconnect}>Disconnect</button>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

/**
 * Button component to connect the wallet.
 * @param {function} onConnect Callback for connecting the wallet.
 * @param {boolean} isClient Flag to check if running on client-side.
 */
const ConnectWalletButton = ({ onConnect, isClient }) => {
    if (!isClient) return null
    return (
        <div className={styles.headerAccountInfoWrapper}>
            <div className={styles.connectButton}>
                <button onClick={onConnect}>Connect</button>
            </div>
        </div>
    )
}

// Component to manage wallet connection
const WalletConnectionManager = () => {
    const [isClient, setIsClient] = useState(false)
    const { isConnected } = useAccount()
    const { open } = useWeb3Modal()
    const { disconnect } = useDisconnect()

    // Check if running on the client side
    useEffect(() => {
        setIsClient(typeof window !== "undefined")
    }, [])

    const handleOpen = () => open()
    const handleDisconnect = () => disconnect()

    return isConnected ? (
        <WalletInfo onDisconnect={handleDisconnect} isClient={isClient} />
    ) : (
        <ConnectWalletButton onConnect={handleOpen} isClient={isClient} />
    )
}

export default WalletConnectionManager
