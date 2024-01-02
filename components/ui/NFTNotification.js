import React, { useState, useEffect } from "react"
import { useNftNotification } from "../../context/NFTNotificationContext"
import styles from "../../styles/Home.module.css"
import SingleNotification from "./NFTSingleNotification"

// NftNotification component for rendering NFT related notifications
const NftNotification = () => {
    // Destructuring methods and state from the NFT notification context
    const { nftNotifications, showNftNotification, clearNftNotification, closeNftNotification } =
        useNftNotification()

    return (
        <div className={styles.notificationsContainer}>
            {nftNotifications.map((notification) => (
                <SingleNotification
                    key={notification.id}
                    className={`${styles.nftNotification} ${styles[notification.type]}`}
                    notification={notification}
                    clearNftNotification={clearNftNotification}
                    showNftNotification={showNftNotification}
                    closeNftNotification={closeNftNotification}
                />
            ))}
        </div>
    )
}

export default NftNotification
