import React, { useEffect } from "react"
import { useNFT } from "@context"
import { Table } from "@components"
import styles from "./Collection.module.scss"

const Collection = ({ sortBy, title }) => {
    const { collections: nftCollections, reloadNFTs } = useNFT()

    useEffect(() => {
        reloadNFTs()
    }, [reloadNFTs])

    const sortedCollections = [...nftCollections].sort((a, b) => b[sortBy] - a[sortBy])

    return (
        <div className={styles.tableContainer}>
            <div className={styles.tableWrapper}>
                <h3>{title}</h3>
                <div className={styles.nftCollection}>
                    <Table collections={sortedCollections} />
                </div>
            </div>
        </div>
    )
}

export default Collection
