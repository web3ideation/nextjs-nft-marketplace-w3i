import React from "react"
import styles from "./ComingSoon.module.scss"

const ComingSoon = ({ children }) => {
    return (
        <div className={styles.comingSoonWrapper}>
            {children}
            <div className={styles.comingSoonOverlay}>
                <span className={styles.comingSoonText}>Coming soon...</span>
            </div>
        </div>
    )
}

export default ComingSoon
