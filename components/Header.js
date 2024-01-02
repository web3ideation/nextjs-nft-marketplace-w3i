import Link from "next/link"
import React from "react"

import PopupMenu from "../components/PopupMenu"
import SearchBar from "../components/SearchBar"
import ConnectButton from "./ui/ConnectButton"

import styles from "../styles/Home.module.css"

// Header component for the NFT Marketplace
const Header = () => {
    return (
        <div className={styles.headerContainer}>
            <nav>
                <div className={styles.logoAndHeadlineWrapper}>
                    <Link href="/" className={styles.headerLogo}>
                        <img src="/media/only-lightbulb.png" alt="Logo"></img>
                    </Link>
                    <h1 className={styles.headerHeadline}>NFT Marketplace</h1>
                </div>
                <div className={styles.headerElementsWrapper}>
                    <SearchBar />
                    <Link
                        href="https://web3ideation.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.headerButton}
                    >
                        <img
                            src="/media/Logo-insconsolata-straightened-e1690296964226.png"
                            alt="Logo-Web3Ideation"
                        ></img>
                    </Link>
                    <PopupMenu />
                    <ConnectButton />
                </div>{" "}
            </nav>{" "}
        </div>
    )
}

export default Header
