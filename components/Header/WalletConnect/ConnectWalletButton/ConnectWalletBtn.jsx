import React from "react"
import styles from "./ConnectWalletBtn.module.scss"

const ConnectWalletBtn = ({ onConnect, isClient }) => {
    // Nur rendern, wenn isClient true ist

    return (
        <div className={styles.headerAccountInfoWrapper}>
            <div className={styles.connectButton}>
                <button onClick={onConnect}>Connect</button>
            </div>
        </div>
    )
}

export default ConnectWalletBtn
