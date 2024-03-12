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
//              <div className={`${styles.hamburgerMenu} ${isOpen ? "open" : ""}`}>
//                  <div className={styles.line}></div>
//                  <div className={styles.line}></div>
//                  <div className={styles.line}></div>
//              </div>

//              .hamburgerMenu {
//                  margin: 10px 5px;
//                  width: 25px; /* Breite des Menü-Icons */
//                  height: 25px; /* Höhe des Menü-Icons */
//                  display: flex;
//                  flex-direction: column;
//                  justify-content: space-around;
//                  cursor: pointer;
//              }
//
//              .hamburgerMenu .line {
//                  width: 100%; /* Volle Breite des Containers */
//                  height: 5px; /* Höhe jeder Linie */
//                  border-radius: 3px 3px 3px 3px;
//                  background-color: black; /* Farbe der Linien */
//              }

export default Header
