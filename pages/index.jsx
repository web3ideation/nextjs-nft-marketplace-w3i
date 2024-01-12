// React Imports
import React from "react"

// Custom Components Imports
import NFTListed from "../components/Main/NftViewer/Listed/NFTListed"
import NFTCollection from "../components/Main/NftViewer/Collection/NFTCollection"
import NFTTopCollection from "../components/Main/NftViewer/Collection/NFTTopCollections"
import NFTMostSold from "../components/Main/NftViewer/Listed/NFTMostSold"

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
