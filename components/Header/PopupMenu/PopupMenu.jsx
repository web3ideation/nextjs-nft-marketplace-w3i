import React, { useState, useRef, useEffect } from "react"

import WalletConnectionManager from "../WalletConnect/WalletConnectionManager"
import WalletMenu from "../WalletConnect/WalletMenu/WalletMenu"

import styles from "./PopupMenu.module.scss"

const PopupMenu = () => {
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef(null)

    const handleMouseClick = () => {
        setIsOpen(!isOpen)
    }

    const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setIsOpen(false)
        }
    }

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
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
                <WalletConnectionManager />
                <WalletMenu />
            </div>
        </div>
    )
}

export default PopupMenu
