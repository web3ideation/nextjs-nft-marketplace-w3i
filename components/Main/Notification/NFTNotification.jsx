// React Imports
import React from "react"

// Custom Hooks and Components
import { useNftNotification } from "@context/NotificationProvider"
import SingleNotification from "./NotificationElement/NFTSingleNotification"

// Styles
import styles from "./Notification.module.scss"

/**
 * NftNotification Component
 * Purpose: To render NFT-related notifications.
 * Uses the NFTNotificationContext for managing notification state and actions.
 */
const NftNotification = () => {
    // Destructuring methods and state from the NFT notification context
    const { nftNotifications, closeNftNotification, clearNftNotification } = useNftNotification()

    const handleNotificationClose = (notificationId) => {
        // Hier können Sie die zusätzliche Logik hinzufügen
        console.log("Notification closed with ID:", notificationId)
    }

    return (
        <div className={styles.notificationsContainer}>
            {nftNotifications.map((notification) => (
                <SingleNotification
                    key={notification.id}
                    notification={notification}
                    clearNftNotification={clearNftNotification}
                    closeNftNotification={closeNftNotification}
                    onClose={handleNotificationClose}
                />
            ))}
        </div>
    )
}

export default NftNotification
