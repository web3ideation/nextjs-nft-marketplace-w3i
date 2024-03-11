// React and Hooks import
import Link from "next/link"
import React from "react"

// Importing custom components
import SearchBar from "./SearchBar/SearchBar"
import WalletConnectionManager from "./WalletConnect/WalletConnectionManager"

// Styles
import styles from "./Header.module.scss"

// Header component for the NFT Marketplace
const Header = () => {
    return (
        <div className={styles.headerContainer}>
            <nav>
                <div className={styles.logoAndHeadlineWrapper}>
                    <Link className={styles.headerLogo} href="/" target="_self">
                        <img src="/media/Logo-w3i-marketplace.png" alt="Logo-W3I-Market"></img>
                    </Link>
                    <h1 className={styles.headerHeadline}>Headline</h1>
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
                        <img
                            src="/media/Logo-insconsolata-straightened-e1690296964226.png"
                            alt="Logo-Web3Ideation"
                        ></img>
                    </Link>
                </div>
            </nav>
        </div>
    )
}

export default Header
