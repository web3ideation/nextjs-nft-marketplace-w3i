import React, { useEffect, useState } from "react"
import { useAccount, useBalance } from "wagmi"
import { truncateStr, truncatePrice } from "../../../../utils/formatting"
import WalletMenu from "../WalletMenu/WalletMenu"
import styles from "./WalletInfo.module.scss"
import Image from "next/image"

const WalletInfo = ({ onDisconnect, isClient }) => {
    const { address } = useAccount()
    const { data: balanceData, refetch: refetchBalance } = useBalance({ address })
    const [formattedAddress, setFormattedAddress] = useState("")
    const [formattedPrice, setFormattedPrice] = useState("")
    const [isOpen, setIsOpen] = useState(false)
    const [isButtonPressed, setIsButtonPressed] = useState(false)

    useEffect(() => {
        if (isClient) {
            setFormattedAddress(truncateStr(address, 4, 4))
            setFormattedPrice(truncatePrice(balanceData?.formatted || "0", 5))
        }
    }, [address, balanceData, isClient])

    const handleMouseEnter = () => {
        setIsOpen(true)
        refetchBalance()
    }

    const handleMouseLeave = () => setIsOpen(false)

    // Aktualisierte Touch und Mouse Event-Handler, die nun `handleToggleMenu` aufrufen
    const handleTouchStart = (event) => {
        event.preventDefault()
        setIsButtonPressed(true)
    }

    const handleTouchEnd = () => {
        setIsButtonPressed(false)
        setIsOpen(!isOpen)
    }

    const handleMouseDown = (event) => {
        event.preventDefault()
        setIsButtonPressed(true)
    }

    const handleMouseUp = () => {
        setIsButtonPressed(false)
    }

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
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
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
            <WalletMenu
                balanceData={balanceData}
                formattedPrice={formattedPrice}
                onDisconnect={onDisconnect}
                isOpen={isOpen}
                isClient={isClient}
                address={address}
            />
        </div>
    )
}

export default WalletInfo
