// React imports
import React from "react";

// Style imports
import styles from "../../../styles/Home.module.css";

/**
 * LoadingWave Component
 * Purpose: To display a loading animation with wave-like elements.
 * Returns a series of div elements styled to create a wave effect.
 */
const LoadingWave = () => {
    return (
        <div className={styles.loadingWave}>
            {/* Each wave element represents a part of the loading animation */}
            <div className={styles.wave}></div>
            <div className={styles.wave}></div>
            <div className={styles.wave}></div>
            <div className={styles.wave}></div>
            <div className={styles.wave}></div>
        </div>
    );
};

export default LoadingWave;