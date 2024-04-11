import React from "react"
import { useNftNotification } from "@context/NotificationProvider"
import SingleNotification from "./NotificationElement/NFTSingleNotification"
import styles from "./Notification.module.scss"

const NftNotification = () => {
    const { nftNotifications, closeNftNotification, clearNftNotification } = useNftNotification()

    const handleNotificationClose = (notificationId) => {
        // Place for additional logic if necessary
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
