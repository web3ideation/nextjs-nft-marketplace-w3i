import React, { useEffect } from "react"
import { useNFT } from "@context/NftDataProvider"
import Table from "@components/NftTable/Table"
import TableElement from "@components/NftTable/TableElement/TableElement"
import styles from "./Collection.module.scss"

const NFTCollection = ({ sortBy, title }) => {
    const { collections: nftCollections, reloadNFTs } = useNFT()

    useEffect(() => {
        reloadNFTs()
    }, [reloadNFTs])

    const sortedCollections = [...nftCollections].sort((a, b) => b[sortBy] - a[sortBy])

    const tableRows = sortedCollections.map((collection) => (
        <TableElement
            key={`coll${collection.nftAddress}${collection.itemCount}`}
            collection={collection}
        />
    ))

    return (
        <div className={styles.tableContainer}>
            <div className={styles.tableWrapper}>
                <h3>{title}</h3>
                <div className={styles.nftCollection}>
                    <Table tableRows={tableRows} />
                </div>
            </div>
        </div>
    )
}

export default NFTCollection