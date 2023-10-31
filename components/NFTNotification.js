import React, { useEffect, useState } from "react"
import { useNftNotification } from "../context/NFTNotificationContext"
import styles from "../styles/Home.module.css"

const NftNotification = () => {
    const { nftNotification, clearNftNotification } = useNftNotification()

    useEffect(() => {
        console.log(`Notification visibility: ${nftNotification.isVisible}`)
        console.log(`Notification duration: ${nftNotification.duration}`)
        if (nftNotification.isVisible) {
            const timer = setTimeout(() => {
                clearNftNotification()
            }, nftNotification.duration || 5000) // Fallback to 5000ms if duration is not set

            return () => clearTimeout(timer)
        }
    }, [nftNotification, clearNftNotification])

    // Log to check if the component is rendering
    console.log("Rendering notification component", { isVisible: nftNotification.isVisible })

    if (!nftNotification.isVisible) return null

    // Bestimmen Sie die Klasse basierend auf dem Typ der Nachricht
    const notificationClass = `${styles.nftNotification} ${
        nftNotification.type === "error"
            ? styles.nftNotificationError
            : styles.nftNotificationSuccess
    }`

    return (
        <div className={notificationClass}>
            <strong>{nftNotification.title}</strong>
            <p>{nftNotification.message}</p>
        </div>
    )
}

export default NftNotification
