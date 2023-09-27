import { Button, ConnectButton } from "web3uikit"
import Link from "next/link"
import PopupMenu from "./PopupMenu"
import SearchBar from "./SearchBar"
import React from "react"
import styles from "../styles/Home.module.css"

export default function Header({}) {
    return (
        <div className={styles.headerContainer}>
            <nav>
                <div className={styles.logoAndHeadlineWrapper}>
                    <Link className={styles.headerLogo} href="/">
                        <img src="/media/w3i-in-line-crammed-e1690296984518.png" alt="Logo"></img>
                    </Link>
                    <h1 className={styles.headerHeadline}>NFT Marketplace</h1>
                </div>
                <div className={styles.headerElementsWrapper}>
                    <SearchBar />
                    <Link href="/my-nft" className={styles.headerButton}>
                        <Button text="Create" />
                    </Link>
                    <PopupMenu />
                    <ConnectButton className={styles.connectButton} moralisAuth={false} />
                </div>
            </nav>
        </div>
    )
}
