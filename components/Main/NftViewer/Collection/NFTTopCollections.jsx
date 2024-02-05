// React Imports
import React, { useState, useEffect } from "react"

// Custom Hooks and Components
import { useNFT } from "../../../../context/NFTDataProvider"
import NFTTable from "../../NftTable/NFTTable"
import NFTTableElement from "../../NftTable/NftTableElement/NFTTableElement"

// Style Imports
import styles from "./NFTCollection.module.scss"

function NFTCollection() {
    // State management for NFT collections and modal states
    const { collections: nftCollections, loadingImage, reloadNFTs } = useNFT()

    // Reload NFT collections on dependency change
    useEffect(() => {
        reloadNFTs()
    }, [reloadNFTs])

    // Sort collections based on collection count in descending order
    const sortedCollections = [...nftCollections].sort(
        (a, b) => b.collectionCount - a.collectionCount
    )

    // Map each collection to a table row element
    const tableRows = sortedCollections.map((collection) => (
        <NFTTableElement
            key={`"topColl"${collection.nftAddress}${collection.itemCount}`}
            collection={collection}
            loadingImage={loadingImage}
            nftCollections={nftCollections}
        />
    ))

    // Render component
    return (
        <>
            <div className={styles.nftTableContainer}>
                <div className={styles.nftTableWrapper}>
                    <h1>Top 10</h1>
                    <div className={styles.nftCollection}>
                        <NFTTable tableRows={tableRows} />
                    </div>
                </div>
            </div>
        </>
    )
}

export default NFTCollection
