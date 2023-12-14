import Link from "next/link"
import React, { useEffect, useState } from "react"
import { useWeb3Modal } from "@web3modal/wagmi/react"
import { useDisconnect, useAccount, useEnsName, useEnsAvatar, useBalance } from "wagmi"

import PopupMenu from "../components/PopupMenu"
import SearchBar from "../components/SearchBar"
import ConnectButton from "../components/ConnectButton"

import styles from "../styles/Home.module.css"

// Header component for the NFT Marketplace
const Header = () => {
    return (
        <div className={styles.headerContainer}>
            <nav>
                {/* Logo and headline section */}
                <div className={styles.logoAndHeadlineWrapper}>
                    <Link href="/" className={styles.headerLogo}>
                        {/* Logo image */}

                        <img src="/media/only-lightbulb.png" alt="Logo"></img>
                    </Link>
                    <h1 className={styles.headerHeadline}>NFT Marketplace</h1>
                </div>
                <div className={styles.headerElementsWrapper}>
                    {/* Search bar component */}
                    <SearchBar />
                    {/* Link to an external website */}
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
                    {/* Popup menu component */}
                    <PopupMenu />
                    <ConnectButton />
                </div>{" "}
            </nav>{" "}
        </div>
    )
}

export default Header
