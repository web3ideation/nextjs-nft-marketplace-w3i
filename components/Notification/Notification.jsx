import React from "react"
import { useNotification } from "@context/NotificationProvider"
import SingleNotification from "./NotificationElement/SingleNotification"
import styles from "./Notification.module.scss"

const NftNotification = () => {
    const { notifications, closeNotification, clearNotification } = useNotification()

    const handleNotificationClose = (notificationId) => {
        // Place for additional logic if necessary
    }

    return (
        <div className={styles.notificationsContainer}>
            {notifications.map((notification) => (
                <SingleNotification
                    key={notification.id}
                    notification={notification}
                    clearNotification={clearNotification}
                    closeNotification={closeNotification}
                    onClose={handleNotificationClose}
                />
            ))}
        </div>
    )
}

export default NftNotification
