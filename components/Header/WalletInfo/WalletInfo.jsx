import React, { useState, useEffect } from "react"
import Image from "next/image"
import { useAccount } from "wagmi"
import { truncateStr } from "@utils"
import { WalletMenu } from "../index"
import styles from "./WalletInfo.module.scss"

const WalletInfo = () => {
    const [isClient, setIsClient] = useState(false)
    const { address } = useAccount()
    const [formattedAddress, setFormattedAddress] = useState("")
    const [isOpen, setIsOpen] = useState(false)
    const [isButtonPressed, setIsButtonPressed] = useState(false)

    useEffect(() => {
        setIsClient(typeof window !== "undefined")
    }, [])

    useEffect(() => {
        if (!isClient) return
        setFormattedAddress(truncateStr(address, 4, 4))
    }, [address, isClient])

    const handleMouseEnter = () => setIsOpen(true)

    const handleMouseLeave = () => setIsOpen(false)

    const handleTogglePress = (pressed) => () => setIsButtonPressed(pressed)

    const handleToggleOpen = () => setIsOpen(!isOpen)

    if (!isClient) return null

    return (
        <div
            className={`${styles.headerAccountInfoContainer} ${
                isOpen ? styles.headerAccountInfoContainerOpen : ""
            }`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div
                className={styles.headerAccountInfoWrapperInner}
                onTouchStart={handleTogglePress(true)}
                onTouchEnd={handleToggleOpen}
                onMouseDown={handleTogglePress(true)}
                onMouseUp={handleTogglePress(false)}
                style={{ transform: isButtonPressed ? "scale(0.95)" : "scale(1)" }}
            >
                <div className={styles.onlineDot}></div>
                <div className={styles.headerAccountInfo}>
                    <div title={address}>{formattedAddress}</div>
                </div>
                <div className={styles.menuIcon}>
                    <Image width={20} height={20} src="/media/arrow_down.png" alt="Menu Arrow" />
                </div>
            </div>
            <WalletMenu isOpen={isOpen} isClient={isClient} />
        </div>
    )
}

export default WalletInfo
