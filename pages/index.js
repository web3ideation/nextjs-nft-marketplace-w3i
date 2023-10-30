import React from "react"
import NFTListed from "../components/NFTListed"
import styles from "../styles/Home.module.css"
import NFTCollection from "../components/NFTCollection"

export default function Home() {
    return (
        <div className={styles.nftListingContainer}>
            <NFTListed />
            <NFTCollection />
        </div>
    )
}
