import React from "react"
import Image from "next/image"
import Link from "next/link"

import SearchBar from "./SearchBar/SearchBar"
import WalletConnectionManager from "./WalletConnect/WalletConnectionManager"
import PopupMenu from "@components/Header/PopupMenu/PopupMenu"

import styles from "./Header.module.scss"

const Header = () => {
    return (
        <header className={styles.headerContainer}>
            <nav>
                <div className={styles.logoAndHeadlineWrapper}>
                    <Link className={styles.headerLogo} href="/" passHref>
                        <Image
                            className={styles.headerImage}
                            height={30}
                            width={100}
                            src="/media/Logo-w3i-marketplace.png"
                            alt="Logo-W3I-Market"
                            loading="eager"
                        />
                    </Link>
                    <h1 className={styles.headerHeadline}>@ sepolia testnet</h1>
                </div>
                <div className={styles.headerElementsWrapper}>
                    <SearchBar />
                    <Link className={styles.headerMenuBtn} href="/sell-nft">
                        Sell
                    </Link>
                    <Link className={styles.headerMenuBtn} href="/swap-nft">
                        Swap
                    </Link>
                    <WalletConnectionManager />
                    <a
                        className={styles.headerLogo}
                        href="https://web3ideation.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Image
                            className={styles.headerImage}
                            height={30}
                            width={100}
                            src="/media/Logo-insconsolata-straightened-e1690296964226.png"
                            alt="Logo-Web3Ideation"
                            loading="eager"
                        />
                    </a>
                </div>
                <div className={styles.popupMenuWrapper}>
                    <PopupMenu />
                </div>
            </nav>
        </header>
    )
}

export default Header
