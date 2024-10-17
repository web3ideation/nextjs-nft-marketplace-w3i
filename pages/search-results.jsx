import React, { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/router"
import { ethers } from "ethers"
import { useNFT } from "@context"
import { SearchSideFilters, List } from "@components"
import styles from "@styles/Home.module.scss"

const SearchResults = () => {
    const router = useRouter()
    const { data: nftsData, loadingImage } = useNFT()
    const [searchTerm, setSearchTerm] = useState("")

    const [searchResults, setSearchResults] = useState([])
    const [filteredNFTs, setFilteredNFTs] = useState([])

    useEffect(() => {
        const searchTermFromQuery = router.query.search || ""
        setSearchTerm(searchTermFromQuery)
    }, [router.query.search])

    const attributesToString = useCallback((attributes) => {
        if (!attributes || !Array.isArray(attributes)) {
            return ""
        }
        const result = attributes
            .map((attr) =>
                attr.trait_type && attr.value ? `${attr.trait_type}: ${attr.value}` : ""
            )
            .join(" ")
            .toLowerCase()
        return result
    }, [])

    useEffect(() => {
        if (!nftsData) {
            setSearchResults([])
            setFilteredNFTs([])
            return
        }

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

            const includesSearchTerm = concatenatedFields.includes(searchTerm.toLowerCase())
            return includesSearchTerm
        })

        setSearchResults(filteredResults)
        setFilteredNFTs(filteredResults)
    }, [nftsData, searchTerm, attributesToString])

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
                    {filteredNFTs.length > 0 ? (
                        <List
                            nftsData={filteredNFTs}
                            sortType={""}
                            title={`Search Results for: ${searchTerm}`}
                        />
                    ) : (
                        <div>No search results</div>
                    )}{" "}
                </div>
            </div>
        </>
    )
}

export default SearchResults
