import React from "react"

import BtnWithAction from "@components/UI/BtnWithAction"

import styles from "./ConnectWalletBtn.module.scss"

const ConnectWalletBtn = ({ onConnect, isClient }) => {
    // Nur rendern, wenn isClient true ist

    return (
        <div className={styles.connectButtonWrapper}>
            <BtnWithAction onClickAction={onConnect} buttonText={"Connect"} />
        </div>
    )
}

export default ConnectWalletBtn
