import React from "react"
import styles from "../styles/Home.module.css"
import NFTListed from "../components/NFTListed"
import NFTCollection from "../components/NFTCollection"
import NFTTopCollection from "../components/NFTTopCollections"
import NFTMostSold from "../components/NFTMostSold"

export default function Home() {
    return (
        <div className={styles.nftListingContainer}>
            <NFTListed />
            <div>
                <NFTCollection />
                <NFTTopCollection />
            </div>
            <NFTMostSold />
        </div>
    )
}
