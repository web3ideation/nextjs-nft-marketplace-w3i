// React imports
import React, { useEffect } from "react"

// ------------------ Custom Hook Imports ------------------
import { useNFT } from "../../../../context/NFTDataProvider"

// ------------------ Component Imports ------------------
import NFTTable from "../../NftTable/NFTTable"
import NFTTableElement from "../../NftTable/NftTableElement/NFTTableElement"

// Style imports
import styles from "../../../../styles/Home.module.css"

function NFTCollection() {
    // Hooks & Data Retrieval
    const { collections: nftCollections, loadingImage, reloadNFTs } = useNFT()

    // Reload NFT collections on component mount
    useEffect(() => {
        reloadNFTs()
    }, [reloadNFTs])

    // Sort collections based on collectionPrice in descending order
    const sortedCollections = [...nftCollections].sort(
        (a, b) => b.collectionPrice - a.collectionPrice
    )

    // Create table rows for each collection
    const tableRows = sortedCollections.map((collection) => (
        <NFTTableElement
            key={`"coll"${collection.nftAddress}${collection.itemCount}`}
            collection={collection}
            loadingImage={loadingImage}
            nftCollections={nftCollections}
        />
    ))

    // Render Function
    return (
        <>
            <div className={styles.nftTableContainer}>
                <div className={styles.nftTableWrapper}>
                    <h1>Top Value</h1>
                    <div className={styles.nftCollection}>
                        <NFTTable tableRows={tableRows} />
                    </div>
                </div>
            </div>
        </>
    )
}

export default NFTCollection
