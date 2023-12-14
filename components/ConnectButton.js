import { useEffect, useState } from "react"
import { useAccount, useBalance, useEnsName, useEnsAvatar, useDisconnect } from "wagmi"
import { useWeb3Modal } from "@web3modal/wagmi/react"

import styles from "../styles/Home.module.css"

const WalletInfo = () => {
    const { address, isConnected } = useAccount()
    const { data: balanceData } = useBalance({
        address: address,
    })

    return (
        <div className={styles.headerAccountInfoWrapper}>
            <div
                className={`${styles.onlineDot} ${isConnected ? styles.online : styles.offline}`}
            ></div>
            <div className={styles.headerAccountInfo}>
                <div>
                    {address.slice(0, 6)}...{address.slice(-4)}
                </div>
                <div>
                    {balanceData?.formatted.slice(0, balanceData?.formatted.indexOf(".") + 5)} SEP
                </div>
            </div>
        </div>
    )
}

const PlaceholderWalletInfo = () => {
    return (
        <div className={styles.headerAccountInfoWrapper}>
            <div className={`${styles.onlineDot} ${styles.offline}`}></div>
            <div className={styles.headerAccountInfo} style={{ visibility: "hidden" }}>
                <div>0x000...0000</div>
                <div>0.0000 SEP</div>
            </div>
        </div>
    )
}

const ConnectButton = () => {
    const { isConnected } = useAccount()
    const { open } = useWeb3Modal()
    const { disconnect } = useDisconnect()
    const [isClient, setIsClient] = useState(false)
    const [buttonText, setButtonText] = useState("Connect") // Initialer Text

    useEffect(() => {
        setIsClient(true) // Setze isClient auf true, wenn die Komponente auf dem Client gerendert wird
        setButtonText(isConnected ? "Disconnect" : "Connect") // Aktualisiere buttonText basierend auf isConnected
    }, [isConnected])

    const handleButtonClick = () => {
        if (isConnected) {
            disconnect()
        } else {
            open()
        }
    }

    // Zeige den Button nur an, wenn die Komponente auf dem Client gerendert wurde
    if (!isClient) {
        return null
    }

    return (
        <>
            <div className={styles.connectButton}>
                <button onClick={handleButtonClick}>{buttonText}</button>
            </div>{" "}
            {isConnected ? <WalletInfo /> : <PlaceholderWalletInfo />}
        </>
    )
}

export default ConnectButton
