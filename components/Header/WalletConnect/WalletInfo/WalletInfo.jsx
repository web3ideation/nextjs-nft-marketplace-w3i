import React, { useEffect, useState } from "react"
import { useAccount, useBalance } from "wagmi"
import { truncateStr, truncatePrice } from "../../../../utils/formatting"
import WalletMenu from "../WalletMenu/WalletMenu"
import styles from "./WalletInfo.module.scss"

const WalletInfo = ({ onDisconnect }) => {
    const { address } = useAccount()
    const { data: balanceData, refetch: refetchBalance } = useBalance({ address })
    const [formattedAddress, setFormattedAddress] = useState("")
    const [formattedPrice, setFormattedPrice] = useState("")
    const [isHovered, setIsHovered] = useState(false)

    useEffect(() => {
        setFormattedAddress(truncateStr(address, 4, 4))
        setFormattedPrice(truncatePrice(balanceData?.formatted || "0", 5))
    }, [address, balanceData])

    return (
        <div
            className={styles.headerAccountInfoWrapper}
            onMouseEnter={() => {
                setIsHovered(true)
                refetchBalance()
            }}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={styles.onlineDot}></div>
            <div className={styles.headerAccountInfo}>
                <div title={address}>{formattedAddress}</div>
            </div>
            <div className={styles.menuIcon}>
                <img src="media/arrow_down.png" alt="Menu Arrow"></img>
            </div>
            <WalletMenu
                balanceData={balanceData}
                formattedPrice={formattedPrice}
                onDisconnect={onDisconnect}
                isHovered={isHovered} // Hover-State an WalletMenu übergeben
            />
        </div>
    )
}

export default WalletInfo
