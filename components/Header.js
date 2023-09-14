import { Button, ConnectButton } from "web3uikit"
import Link from "next/link"
import PopupMenu from './PopupMenu'
import SearchBar from "./SearchBar";
import React from 'react';
import styles from '../styles/Home.module.css'

export default function Header({ setSearchResults }) {
    const handleSearch = async (searchTerm) => {
        try {
            const response = await fetch(`/?q=${searchTerm}`);
            const data = await response.json();

            if (Array.isArray(data)) {
                setSearchResults(data);
                console.log('Search term:', searchTerm, 'Results:', data);
            } else {
                setSearchResults([]);
            }
            setSearchResults(results);
        } catch (error) {
            console.error('Error fetching data:', error.message);
            setSearchResults([]);
        }
    };

    return (
        <div className={styles.headerContainer}>
            <nav>
                <div className={styles.logoAndHeadlineWrapper}>
                    <Link className={styles.headerLogo} href="/">
                        <img src="/favicon.ico/" alt="Logo"></img>
                    </Link>
                    <h1 className={styles.headerHeadline}>NFT Marketplace</h1>
                </div>
                <div className={styles.headerElementsWrapper}>
                    <SearchBar onSearch={handleSearch} setSearchResults={setSearchResults} />
                    <Link href="/my-nft" className={styles.headerButton}>
                        <Button text="Create" />
                    </Link>
                    <ConnectButton className={styles.connectButton} moralisAuth={false} />
                    <PopupMenu />
                </div>
            </nav>
        </div>
    )
}
