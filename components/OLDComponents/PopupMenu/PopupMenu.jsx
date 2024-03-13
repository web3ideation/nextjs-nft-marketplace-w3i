import React, { useState, useRef, useEffect } from "react"

import Link from "next/link"

import styles from "./PopupMenu.module.scss"

const PopupMenu = () => {
    // State to manage the visibility of the popup menu
    const [isOpen, setIsOpen] = useState(false)

    // Reference to the menu wrapper, useful for future enhancements or interactions
    const menuRef = useRef(null)

    // Handler to show/hide the popup menu when the mouse enters the menu wrapper
    const handleMouseClick = () => {
        setIsOpen(!isOpen)
    }
    // Funktion, die überprüft, ob außerhalb des Menüs geklickt wurde
    const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setIsOpen(false)
        }
    }

    // Event-Listener hinzufügen, um Klicks außerhalb zu erkennen
    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside)

        return () => {
            // Bereinigung des Event-Listeners, um Memory-Leaks zu vermeiden
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])
    return (
        <div className={styles.popupMenu} ref={menuRef} onClick={handleMouseClick}>
            <div className={`${styles.hamburgerMenu} ${isOpen ? styles.hamburgerMenuOpen : ""}`}>
                <div className={styles.line}></div>
                <div className={styles.line}></div>
                <div className={styles.line}></div>
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
                <Link className={styles.popupMenuLinks} href="/sell-nft">
                    <button>Sell NFT</button>
                </Link>
                <Link className={styles.popupMenuLinks} href="/swap-nft">
                    <button>Swap NFT</button>
                </Link>
                <Link className={styles.popupMenuLinks} href="/my-nft">
                    <button>My NFT</button>
                </Link>
            </div>
        </div>
    )
}

export default PopupMenu
