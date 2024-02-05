import React, { useState, useRef } from "react"
import styles from "./PopupMenu.module.scss"
import Link from "next/link"

const PopupMenu = () => {
    // State to manage the visibility of the popup menu
    const [isOpen, setIsOpen] = useState(false)

    // Reference to the menu wrapper, useful for future enhancements or interactions
    const menuRef = useRef(null)

    // Handler to show/hide the popup menu when the mouse enters the menu wrapper
    const handleMouseEnter = () => setIsOpen(true)
    const handleMouseLeave = () => setIsOpen(false)

    return (
        <div
            className={styles.popupMenuWrapper}
            ref={menuRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className={styles.menuButton}>
                <button>Menu</button>
                <span className={isOpen ? styles.menuIconMinus : styles.menuIcon}>
                    {isOpen ? "-" : "+"}
                </span>
            </div>
            <div
                className={`${styles.popupMenuLinksWrapper} ${
                    isOpen ? styles.popupMenuLinksWrapperOpen : ""
                }`}
            >
                {/* List of menu links */}
                <Link className={styles.popupMenuLinks} href="/">
                    <button>Home</button>
                </Link>
                <Link className={styles.popupMenuLinks} href="/sell-swap-nft">
                    <button>Sell / Swap NFT</button>
                </Link>
                <Link className={styles.popupMenuLinks} href="/my-nft">
                    <button>My NFT</button>
                </Link>
            </div>
        </div>
    )
}

export default PopupMenu
