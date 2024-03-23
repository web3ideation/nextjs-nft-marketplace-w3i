// React Imports
import React, { useEffect } from "react"

// Custom Hooks and Components Imports
import { useNFT } from "@context/NFTDataProvider"
import Table from "@components/Main/NftTable/Table"
import TableElement from "@components/Main/NftTable/TableElement/TableElement"

// Style Imports
import styles from "./NFTCollection.module.scss"

function NFTCollection({ sortBy, title }) {
    // Hooks & Data Retrieval
    const { collections: nftCollections, loadingImage, reloadNFTs } = useNFT()

    // Reload NFT collections on dependency change
    useEffect(() => {
        reloadNFTs()
    }, [reloadNFTs])

    // Dynamische Sortierung basierend auf sortBy Prop
    const sortFunction = (a, b) => {
        return b[sortBy] - a[sortBy]
    }

    const sortedCollections = [...nftCollections].sort(sortFunction)

    // Map each collection to a table row element
    const tableRows = sortedCollections.map((collection) => (
        <TableElement
            key={`"coll"${collection.nftAddress}${collection.itemCount}`}
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
                    <h2>{title}</h2>
                    <div className={styles.nftCollection}>
                        <Table tableRows={tableRows} />
                    </div>
                </div>
            </div>
        </>
    )
}

export default NFTCollection
