import React, { useState, useRef } from "react"
import styles from "../styles/Home.module.css"
import { Button } from "web3uikit"
import Link from "next/link"

const PopupMenu = () => {
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef(null)

    const handleMouseEnter = () => {
        setIsOpen(true)
    }

    const handleMouseLeave = () => {
        setIsOpen(false)
    }

    return (
        <div
            className={styles.popupMenuWrapper}
            ref={menuRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className={styles.menuButton}>
                <Button text="Menu" />
                {isOpen ? (
                    <span className={styles.menuIconMinus}>-</span>
                ) : (
                    <span className={styles.menuIcon}>+</span>
                )}
            </div>
            {isOpen && (
                <div
                    className={`${styles.popupMenuLinksWrapper} ${
                        isOpen ? styles.popupMenuLinksWrapperOpen : ""
                    }`}
                >
                    <Link className={styles.popupMenuLinks} href="/">
                        <Button text="Home" />
                    </Link>
                    <Link className={styles.popupMenuLinks} href="/sell-nft">
                        <Button text="Sell NFT" />
                    </Link>
                    <Link className={styles.popupMenuLinks} href="/">
                        <Button text="Collections" />{" "}
                    </Link>
                    <Link className={styles.popupMenuLinks} href="/">
                        <Button text="Create" />{" "}
                    </Link>
                    <Link className={styles.popupMenuLinks} href="/my-nft">
                        <Button text="My NFT" />{" "}
                    </Link>
                </div>
            )}
        </div>
    )
}

export default PopupMenu
