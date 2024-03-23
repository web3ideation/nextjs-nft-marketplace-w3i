// React Imports
import React, { useEffect } from "react"

// Custom Hooks and Components Imports
import { useNFT } from "@context/NFTDataProvider"
import Table from "@components/Main/NftTable/Table"
import TableElement from "@components/Main/NftTable/TableElement/TableElement"

// Style Imports
import styles from "./Collection.module.scss"

function NFTCollection() {
    // Hooks & Data Retrieval
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
        <TableElement
            key={`"topColl"${collection.nftAddress}${collection.itemCount}`}
            collection={collection}
            loadingImage={loadingImage}
            nftCollections={nftCollections}
        />
    ))

    // Render component
    return (
        <>
            <div className={styles.tableContainer}>
                <div className={styles.tableWrapper}>
                    <h2>Top 10</h2>
                    <div className={styles.nftCollection}>
                        <Table tableRows={tableRows} />
                    </div>
                </div>
            </div>
        </>
    )
}

export default NFTCollection
