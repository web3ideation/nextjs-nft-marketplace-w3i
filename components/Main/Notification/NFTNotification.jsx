// React Imports
import React from "react"

// Custom Hooks and Components
import { useNftNotification } from "../../../context/NotificationProvider"
import SingleNotification from "./NotificationElement/NFTSingleNotification"

// Styles
import styles from "../../../styles/Home.module.css"

/**
 * NftNotification Component
 * Purpose: To render NFT-related notifications.
 * Uses the NFTNotificationContext for managing notification state and actions.
 */
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
