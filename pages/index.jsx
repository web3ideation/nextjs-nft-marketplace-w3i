// React Imports
import React from "react"

// Custom Components Imports
import CategoriesList from "@components/Main/CategoriesList/CategoriesList"
import NFTList from "@components/Main/NftViewer/Lists/NFTList"
import NFTCollection from "@components/Main/NftViewer/Collection/NFTCollection"

// Style Imports
import styles from "@styles/Home.module.scss"

// Home Component: Displays the NFT listing, collections, top collections, and most sold NFTs.
export default function Home() {
    return (
        <>
            <div className={styles.categoriesListContainer}>
                <CategoriesList />
            </div>
            <div className={styles.nftListingContainer}>
                <NFTList sortType={"brandNew"} title={"Brand New"} />
                <NFTList sortType={"myNFT"} title={"My NFT"} />
            </div>
            <div className={styles.nftCollectionsContainer}>
                <NFTCollection sortBy={"collectionCount"} title={"Top 10"} />
                <NFTCollection sortBy={"collectionPrice"} title={"Top Value"} />
            </div>
            <div className={styles.nftListingContainer}>
                <NFTList sortType={"mostSold"} title={"Most Sold"} />
                <NFTList sortType={"expensive"} title={"Expensive Shit"} />
            </div>
        </>
    )
}
