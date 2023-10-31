import React from "react"
import NFTListed from "../components/NFTListed"
import styles from "../styles/Home.module.css"
import NFTCollection from "../components/NFTCollection"
import NFTMostSold from "../components/NFTMostSold"

export default function Home() {
    return (
        <div className={styles.nftListingContainer}>
            <NFTListed />
            <NFTCollection />
            <NFTMostSold />
        </div>
    )
}
