// React and Hooks import
import React from "react"
import Image from "next/image"
import Link from "next/link"

// Importing custom components
import SearchBar from "./SearchBar/SearchBar"
import WalletConnectionManager from "./WalletConnect/WalletConnectionManager"
import PopupMenu from "@components/Header/PopupMenu/PopupMenu"

// Styles
import styles from "./Header.module.scss"

// Header component for the NFT Marketplace
const Header = () => {
    return (
        <header className={styles.headerContainer}>
            <nav>
                <div className={styles.logoAndHeadlineWrapper}>
                    <Link className={styles.headerLogo} href="/" target="_self">
                        <Image
                            height={30}
                            width={100}
                            src="/media/Logo-w3i-marketplace.png"
                            alt="Logo-W3I-Market"
                        />
                    </Link>
                    <h1 className={styles.headerHeadline}></h1>
                </div>
                <div className={styles.headerElementsWrapper}>
                    <SearchBar />
                    <Link className={styles.headerMenuBtn} href="/sell-nft">
                        <button>Sell</button>
                    </Link>
                    <Link className={styles.headerMenuBtn} href="/swap-nft">
                        <button>Swap</button>
                    </Link>
                    <WalletConnectionManager />
                    <Link
                        className={styles.headerLogo}
                        href="https://web3ideation.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Image
                            height={30}
                            width={100}
                            src="/media/Logo-insconsolata-straightened-e1690296964226.png"
                            alt="Logo-Web3Ideation"
                        />
                    </Link>
                </div>
                <div className={styles.popupMenuWrapper}>
                    <PopupMenu />
                </div>
            </nav>
        </header>
    )
}

export default Header
