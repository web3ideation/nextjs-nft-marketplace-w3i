import React from "react"

import BtnWithAction from "@components/Btn/BtnWithAction"

import styles from "./ConnectWalletBtn.module.scss"

const ConnectWalletBtn = ({ onConnect, isClient }) => {
    if (!isClient) return null

    return (
        <div className={styles.connectButtonWrapper}>
            <BtnWithAction onClickAction={onConnect} buttonText="Connect" />
        </div>
    )
}

export default ConnectWalletBtn
