import { ConnectButton } from "web3uikit"
import Link from "next/link"
import PopupMenu from './PopupMenu'
import SearchBar from "./SearchBar";
import React from 'react';
import styles from '../styles/Home.module.css'

export default function Header({ setSearchResults }) {

  const handleSearch = async (searchTerm) => {
    try {
      const response = await fetch(`/my-nft?q=${searchTerm}`);
      const data = await response.json();

      if (data && Array.isArray(data)) {
        setSearchResults(data);
        console.log('Search term:', searchTerm, 'Results:', data);
      }
      // ... perform search logic here

      // Update search results using the setSearchResults function from props
      setSearchResults(results);
    } catch (error) {
      // Handle error
      console.error('Error fetching data:', error.message);
      setSearchResults([]);
    }
  };

  return (
    <div class={styles.headerContainer}>
      <nav>
        <div class={styles.logoAndHeadlineWrapper}>
          <Link
            class={styles.headerLogo}
            href="/"
          >
            <img src="/favicon.ico/"></img>
          </Link>
          <h1 class={styles.headerHeadline}>NFT Marketplace</h1>
        </div>
        <div class={styles.headerElementsWrapper}>
          <SearchBar
            onSearch={handleSearch}
            setSearchResults={setSearchResults}
          />
          <Link
            href=""
            class={styles.headerButton}
          >
            <div>Create</div>
          </Link>
          <ConnectButton
            class={styles.connectButton}
            moralisAuth={false}
          />
          <div>
            <PopupMenu />
          </div>
        </div>
      </nav>
    </div>
  )
}
