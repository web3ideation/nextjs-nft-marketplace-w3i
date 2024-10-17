import React from "react"
import Image from "next/image"
import styles from "./LoadingBulb.module.scss"

const LoadingBulb = () => {
    return (
        <div className={styles.loadingBulb}>
            <Image src="/media/only-lightbulb.png" alt="Loading bulb" width={50} height={50} />
        </div>
    )
}

export default LoadingBulb
