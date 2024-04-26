import React, { useState, useEffect } from "react"
import { useRouter } from "next/router"

import { useNFT } from "@context/NFTDataProvider"
import SearchSideFilters from "@components/SearchSideBar/SearchSideFilters"
import NFTList from "@components/NftViewer/NftLists/List"

import { ethers } from "ethers"

import styles from "@styles/Home.module.scss"

const SearchResultPage = () => {
    const router = useRouter()
    const { data: nftsData, loadingImage } = useNFT()

    const [searchResults, setSearchResults] = useState([])
    const [filteredNFTs, setFilteredNFTs] = useState([])

    const searchTermFromQuery = router.query.search || ""

    const attributesToString = (attributes) => {
        if (!attributes || !Array.isArray(attributes)) {
            return ""
        }
        return attributes
            .map((attr) =>
                attr.trait_type && attr.value ? `${attr.trait_type}: ${attr.value}` : ""
            )
            .join(" ")
            .toLowerCase()
    }

    useEffect(() => {
        const filteredResults = nftsData.filter((item) => {
            const formattedPrice = ethers.utils.formatUnits(item.price, "ether")
            const attributesString = attributesToString(item.attributes)
            const concatenatedFields = [
                item.Background,
                attributesString,
                item.Text1,
                item.Text2,
                item.Text3,
                item.Text4,
                item.Type,
                item.creator,
                item.description,
                item.listingId,
                item.nftAddress,
                item.tokenSymbol,
                formattedPrice,
                item.seller,
                item.tokenDescription,
                item.tokenId,
                item.tokenName,
                item.collectionName,
                item.utility,
            ]
                .join(" ")
                .toLowerCase()

            return concatenatedFields.includes(searchTermFromQuery.toLowerCase())
        })

        setSearchResults(filteredResults)
        setFilteredNFTs(filteredResults)
    }, [nftsData, searchTermFromQuery])

    const handleFilteredItemsChange = (newFilteredItems) => {
        setFilteredNFTs(newFilteredItems)
    }

    if (loadingImage) {
        return <div>Loading...</div>
    }

    return (
        <>
            <SearchSideFilters
                initialItems={searchResults}
                onFilteredItemsChange={handleFilteredItemsChange}
            />
            <div className={styles.nftSearchResultsContainer}>
                <div className={styles.nftSearchResultsWrapper}>
                    <NFTList
                        nftsData={filteredNFTs}
                        sortType={""}
                        title={`${"Search Results for: "}${searchTermFromQuery}`}
                    />
                </div>
            </div>
        </>
    )
}

export default SearchResultPage
