import React from "react"
import styles from "./LoadingWave.module.scss"

const LoadingWave = () => {
    const numberOfWaves = 5
    const waves = Array.from({ length: numberOfWaves }, (_, index) => (
        <div key={index} className={styles.wave}></div>
    ))

    return <div className={styles.loadingWave}>{waves}</div>
}

export default LoadingWave
