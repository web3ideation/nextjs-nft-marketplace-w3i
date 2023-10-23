import React, { useState, useEffect } from "react"
import SearchSideFilters from "../components/SearchSideFilters"
import styles from "../styles/Home.module.css"
import NFTBox from "../components/NFTBox"
import { useRouter } from "next/router"

import { useSearchResults } from "../components/SearchResultsContext"

const SearchResultPage = () => {
    const router = useRouter()
    const { activeSearchResults, inactiveSearchResults } = useSearchResults()

    const [allItems, setAllItems] = useState([])
    const [filteredNFTs, setFilteredNFTs] = useState([])

    const searchTermFromQuery = router.query.search || ""
    const [combinedResults, setCombinedResults] = useState([])

    useEffect(() => {
        // This is where you combine the two arrays
        const combined = activeSearchResults.concat(inactiveSearchResults)

        // Sort the elements by listingId in descending order
        combined.sort((a, b) => b.listingId - a.listingId)

        const seenNFTs = new Set()
        const uniqueItems = combined.reduce((acc, item) => {
            const key = `${item.nftAddress}${item.tokenId}`
            if (!seenNFTs.has(key)) {
                acc.push(item)
                seenNFTs.add(key)
            }
            return acc
        }, [])

        setCombinedResults(uniqueItems)
        setAllItems(uniqueItems)
    }, [activeSearchResults, inactiveSearchResults])

    useEffect(() => {
        setFilteredNFTs(allItems)
    }, [allItems])

    const handleFilteredItemsChange = (newFilteredItems) => {
        setFilteredNFTs(newFilteredItems)
    }

    return (
        <div className={styles.nftListingContainer}>
            <SearchSideFilters
                initialItems={allItems}
                onFilteredItemsChange={handleFilteredItemsChange}
            />
            <div className={styles.searchResultsWrapper}>
                <h1>Search results for: {searchTermFromQuery} </h1>
                <div className={styles.nftList}>
                    {filteredNFTs.map((result) => (
                        <div key={`${result.nftAddress}${result.tokenId}${result.listingId}`}>
                            <NFTBox
                                price={result.price}
                                nftAddress={result.nftAddress}
                                tokenId={result.tokenId}
                                marketplaceAddress={result.marketplaceAddress}
                                seller={result.seller}
                                buyer={result.buyer}
                                isListed={result.isListed}
                            ></NFTBox>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default SearchResultPage
