// React Imports
import React from "react"

// Custom Components Imports
import NFTListed from "../components/Main/NftViewer/NFTListed"
import NFTCollection from "../components/Main/NftViewer/NFTCollection"
import NFTTopCollection from "../components/Main/NftViewer/NFTTopCollections"
import NFTMostSold from "../components/Main/NftViewer/NFTMostSold"

// Style Imports
import styles from "../styles/Home.module.css"

// Home Component: Displays the NFT listing, collections, top collections, and most sold NFTs.
export default function Home() {
    return (
        <div className={styles.nftListingContainer}>
            <NFTListed />
            <div className={styles.nftCollectionsContainer}>
                <NFTCollection />
                <NFTTopCollection />
            </div>
            <NFTMostSold />
        </div>
    )
}
