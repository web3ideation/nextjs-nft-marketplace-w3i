import React from "react"
import styles from "./ComingSoon.module.scss"

const ComingSoon = ({ children, size }) => {
    const overlayClass = `${styles.comingSoonOverlay} ${
        size === "small"
            ? styles.comingSoonOverlaySmall
            : size === "large"
            ? styles.comingSoonOverlayLarge
            : ""
    }`

    return (
        <div className={styles.comingSoonWrapper}>
            {children}
            <div className={overlayClass}>
                <span className={styles.comingSoonText}>Coming soon...</span>
            </div>
        </div>
    )
}

export default ComingSoon
