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
        // Hier kombinieren Sie die beiden Arrays und setzen das kombinierte Ergebnis
        const combined = activeSearchResults.concat(inactiveSearchResults)
        setCombinedResults(combined)
        setAllItems(combined)
    }, [activeSearchResults, inactiveSearchResults])

    useEffect(() => {
        const uniqueNFTs = []

        // Ein Set, um bereits gesehene NFTs zu verfolgen
        const seenNFTs = new Set()

        filteredNFTs.forEach((nft) => {
            const uniqueId = `${nft.nftAddress}-${nft.tokenId}${nft.listingId}`
            if (!seenNFTs.has(uniqueId)) {
                seenNFTs.add(uniqueId)
                uniqueNFTs.push(nft)
            }
        })
        if (uniqueNFTs.length !== filteredNFTs.length) {
            setFilteredNFTs(uniqueNFTs)
        }
    }, [filteredNFTs])

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
