import React from "react"
import { useNftNotification } from "../context/NFTNotificationContext"
import styles from "../styles/Home.module.css"
import SingleNotification from "../components/NFTSingleNotification"

const NftNotification = () => {
    const { nftNotifications, showNftNotification, clearNftNotification } = useNftNotification()

    return (
        <div className={styles.notificationsContainer}>
            {nftNotifications.map((notification, index) => (
                <SingleNotification
                    key={notification.id}
                    className={`${styles.nftNotification} ${styles[notification.type]}`}
                    notification={notification}
                    clearNftNotification={() => clearNftNotification(notification.id)}
                    showNftNotifications={showNftNotification}
                />
            ))}
        </div>
    )
}

export default NftNotification
