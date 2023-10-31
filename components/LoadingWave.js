import React from "react"
import styles from "../styles/Home.module.css" // Importieren Sie Ihre CSS-Datei für die Animation

const LoadingWave = () => {
    return (
        <div className={styles.loadingContainer}>
            <div className={styles.loadingWave}>
                <div className={styles.wave}></div>
                <div className={styles.wave}></div>
                <div className={styles.wave}></div>
                <div className={styles.wave}></div>
                <div className={styles.wave}></div>
            </div>
        </div>
    )
}

export default LoadingWave
