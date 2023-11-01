import React, { useEffect, useState } from "react"
import { useNftNotification } from "../context/NFTNotificationContext"
import styles from "../styles/Home.module.css" // Stellen Sie sicher, dass dies auf Ihre SCSS-Datei verweist

const NftNotification = () => {
    const { nftNotification, clearNftNotification } = useNftNotification()
    const [animation, setAnimation] = useState("")

    useEffect(() => {
        if (nftNotification.isVisible) {
            // Verwenden Sie requestAnimationFrame, um sicherzustellen, dass die Animationen im nächsten Frame beginnen
            requestAnimationFrame(() => {
                setAnimation(styles.enter) // Starten Sie mit der Eingangsklasse
            })

            const exitTimer = setTimeout(() => {
                requestAnimationFrame(() => {
                    setAnimation(styles.exit) // Beginnen Sie mit der Ausgangsklasse
                })
            }, (nftNotification.duration || 5000) - 1000) // Starten Sie die Ausblendanimation 1 Sekunde vor dem Ende

            const clearTimer = setTimeout(() => {
                clearNftNotification()
                setAnimation("") // Setzen Sie die Animation zurück
            }, nftNotification.duration || 5000)

            return () => {
                clearTimeout(exitTimer)
                clearTimeout(clearTimer)
            }
        }
    }, [nftNotification, clearNftNotification, styles])

    if (!nftNotification.isVisible) return null

    // Bestimmen Sie die Klasse basierend auf dem Typ der Nachricht
    const notificationClass = `${styles.nftNotification} ${
        nftNotification.type === "error" ? styles.error : styles.success
    } ${animation}`

    return (
        <div className={notificationClass}>
            <strong>{nftNotification.title}</strong>
            <p>{nftNotification.message}</p>
        </div>
    )
}

export default NftNotification
