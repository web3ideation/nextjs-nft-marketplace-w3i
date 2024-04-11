import React from "react"

import CategoriesList from "@components/Main/CategoriesList/CategoriesList"
import NFTList from "@components/Main/NftViewer/Lists/NFTList"
import NFTCollection from "@components/Main/NftViewer/Collection/NFTCollection"

import styles from "@styles/Home.module.scss"

const Home = () => {
    return (
        <>
            <div className={styles.categoriesListContainer}>
                <CategoriesList />
            </div>
            <div className={styles.nftListingContainer}>
                <NFTList sortType={"brandNew"} title={"Brand New"} />
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
export default Home
