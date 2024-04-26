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
                <List sortType={"brandNew"} title={"Brand New"} />
            </div>
            <div className={styles.nftCollectionsContainer}>
                <Collection sortBy={"collectionCount"} title={"Top 10"} />
                <Collection sortBy={"collectionPrice"} title={"Top Value"} />
            </div>
            <div className={styles.nftListingContainer}>
                <List sortType={"mostSold"} title={"Most Sold"} />
                <List sortType={"expensive"} title={"Expensive Shit"} />
            </div>
        </>
    )
}
export default Home
