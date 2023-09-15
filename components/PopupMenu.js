import React, { useState, useEffect, useRef } from "react"
import styles from "../styles/Home.module.css"
import { Button } from "web3uikit"
import Link from "next/link"

const PopupMenu = () => {
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef(null)

    const toggleMenu = () => {
        setIsOpen(!isOpen)
    }

    const handleOutsideClick = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setIsOpen(false)
        }
    }

    useEffect(() => {
        window.addEventListener("click", handleOutsideClick)
        return () => {
            window.removeEventListener("click", handleOutsideClick)
        }
    }, [])

    return (
        <div className={styles.popupMenuWrapper} ref={menuRef}>
            <Button onClick={toggleMenu} text="Menu" />
            {isOpen && (
                <div className={styles.popupMenuLinksWrapper}>
                    <Link href="/">
                        <Button text="Home" />
                    </Link>
                    <Link href="/"></Link>
                    <Link href="/sell-nft">
                        <Button text="Sell NFT" />
                    </Link>
                    <Link href="/">
                        <Button text="Collections" />{" "}
                    </Link>
                    <Link href="/">
                        <Button text="Create" />{" "}
                    </Link>
                    <Link href="/my-nft">
                        <Button text="My NFT" />{" "}
                    </Link>
                </div>
            )}
        </div>
    )
}

export default PopupMenu
