import React from "react"
import NFTTable from "./NFTTable.js" // Import the NFTTable component
import styles from "../styles/Home.module.css"
import { useNFT } from "../context/NFTContextProvider.js"

function NFTTopCollection() {
    // ------------------ Hooks & Data Retrieval ------------------

    // Retrieve NFT data and loading state using custom hook
    const { nftCollections, loadingImage } = useNFT()

    // ------------------ Render Functions ------------------

    return (
        <div className={styles.nftTableContainer}>
            <div className={styles.nftTableWrapper}>
                <h1>NFT Top Collections</h1>
                <div id="NFTCollection" className={styles.nftCollection}>
                    <NFTTable nftCollections={nftCollections} loadingImage={loadingImage} />
                </div>
            </div>
        </div>
    )
}

export default NFTTopCollection
