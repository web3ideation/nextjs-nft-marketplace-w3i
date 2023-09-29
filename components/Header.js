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
                        <img src="/media/only-lightbulb.png" alt="Logo"></img>
                    </Link>
                    <h1 className={styles.headerHeadline}>NFT Marketplace</h1>
                </div>
                <div className={styles.headerElementsWrapper}>
                    <SearchBar />
                    <Link
                        href="https://web3ideation.com/"
                        target="blank"
                        className={styles.headerButton}
                    >
                        <img
                            src="/media/Logo-insconsolata-straightened-e1690296964226.png"
                            alt="Logo-Web3Ideation"
                        ></img>
                    </Link>
                    <PopupMenu />
                    <ConnectButton className={styles.connectButton} moralisAuth={false} />
                </div>
            </nav>
        </div>
    )
}
