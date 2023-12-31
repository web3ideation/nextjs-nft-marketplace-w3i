// --- React Imports ---
import React, { useState, useEffect } from "react"
import { useRouter } from "next/router"

// --- Custom Hooks and Components Imports ---
import { useNFT } from "../context/NFTDataProvider"
import SearchSideFilters from "../components/Main/SearchSideBar/SearchSideFilters"
import NFTBox from "../components/Main/NftCard/NFTCard"

// --- Third-party Libraries ---
import { ethers } from "ethers"

// --- Styles ---
import styles from "../styles/Home.module.css"

// SearchResultPage Component
// This component displays the search results for NFTs based on the user's query.
const SearchResultPage = () => {
    const router = useRouter()
    const { data: nftsData, loadingImage } = useNFT()

    const [searchResults, setSearchResults] = useState([])
    const [filteredNFTs, setFilteredNFTs] = useState([])

    // Retrieving the search term from the URL query.
    const searchTermFromQuery = router.query.search || ""

    // Effect: Filter NFTs based on the search term when data or query changes.
    useEffect(() => {
        const filteredResults = nftsData.filter((item) => {
            const formattedPrice = ethers.utils.formatUnits(item.price, "ether")
            const concatenatedFields = [
                // Concatenating relevant fields for the search functionality.
                item.Background,
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
                item.utility,
            ]
                .join(" ")
                .toLowerCase()

            return concatenatedFields.includes(searchTermFromQuery.toLowerCase())
        })

        setSearchResults(filteredResults)
        setFilteredNFTs(filteredResults)
    }, [nftsData, searchTermFromQuery])

    // Handler for updating the filtered NFTs based on side filter changes.
    const handleFilteredItemsChange = (newFilteredItems) => {
        setFilteredNFTs(newFilteredItems)
    }

    // Rendering loading state or the search results.
    if (loadingImage) {
        return <div>Loading...</div>
    }

    return (
        <div className={styles.nftListingContainer}>
            <SearchSideFilters
                initialItems={searchResults}
                onFilteredItemsChange={handleFilteredItemsChange}
            />
            <div className={styles.nftListWrapper}>
                <h1>Search results for: {searchTermFromQuery}</h1>
                <div className={styles.nftList}>
                    {filteredNFTs.map((result) => (
                        <div key={`${result.nftAddress}${result.tokenId}`}>
                            <NFTBox nftData={result} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default SearchResultPage
