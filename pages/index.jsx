import React from "react"

import CategoriesList from "@components/CategoriesList/CategoriesList"
import List from "@components/NftViewer/NftLists/List"
import Collection from "@components/NftViewer/NftCollection/Collection"

import styles from "@styles/Home.module.scss"

const Home = () => {
    return (
        <>
            <div className={styles.categoriesListContainer}>
                <CategoriesList />
            </div>

            <div className={styles.nftListingContainer}>
                <List sortType={"brandNew"} title={"Brand New NFTs"} />
                <List sortType={"swap"} title={"Swap NFTs"} />
            </div>
            <div className={styles.nftCollectionsContainer}>
                <Collection sortBy={"collectionCount"} title={"Top 10 Collections"} />
                <Collection sortBy={"collectionPrice"} title={"Top Value Collections"} />
            </div>
            <div className={styles.nftListingContainer}>
                <List sortType={"mostSold"} title={"Most Sold NFTs"} />
                <List sortType={"expensive"} title={"Expensive NFTs"} />
            </div>
        </>
    )
}
export default Home
