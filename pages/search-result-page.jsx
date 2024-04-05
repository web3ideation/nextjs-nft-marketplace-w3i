// --- React Imports ---
import React, { useState, useEffect } from "react"
import { useRouter } from "next/router"

// --- Custom Hooks and Components Imports ---
import { useNFT } from "@context/NFTDataProvider"
import SearchSideFilters from "@components/Main/SearchSideBar/SearchSideFilters"
import NFTBox from "@components/Main/NftCard/NFTCard"
import NFTList from "@components/Main/NftViewer/Lists/NFTList"
import BtnWithAction from "@components/UI/BtnWithAction"

// --- Third-party Libraries ---
import { ethers } from "ethers"

// --- Styles ---
import styles from "@styles/Home.module.scss"

// SearchResultPage Component
// This component displays the search results for NFTs based on the user's query.
const SearchResultPage = () => {
    const router = useRouter()
    const { data: nftsData, loadingImage } = useNFT()

    const [searchResults, setSearchResults] = useState([])
    const [filteredNFTs, setFilteredNFTs] = useState([])

    // Retrieving the search term from the URL query.
    const searchTermFromQuery = router.query.search || ""

    const attributesToString = (attributes) => {
        if (!attributes || !Array.isArray(attributes)) {
            return "" // Rückgabe eines leeren Strings, wenn keine Attribute vorhanden sind
        }
        return attributes
            .map((attr) =>
                attr.trait_type && attr.value ? `${attr.trait_type}: ${attr.value}` : ""
            )
            .join(" ")
            .toLowerCase()
    }

    // Effect: Filter NFTs based on the search term when data or query changes.
    useEffect(() => {
        const filteredResults = nftsData.filter((item) => {
            const formattedPrice = ethers.utils.formatUnits(item.price, "ether")
            const attributesString = attributesToString(item.attributes)
            const concatenatedFields = [
                // Concatenating relevant fields for the search functionality.
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

    // Handler for updating the filtered NFTs based on side filter changes.
    const handleFilteredItemsChange = (newFilteredItems) => {
        setFilteredNFTs(newFilteredItems)
    }

    // Rendering loading state or the search results.
    if (loadingImage) {
        return <div>Loading...</div>
    }

    return (
        <>
            {" "}
            <SearchSideFilters
                initialItems={searchResults}
                onFilteredItemsChange={handleFilteredItemsChange}
            />
            <div className={styles.nftSearchResultsContainer}>
                <div className={styles.nftSearchResultsWrapper}>
                    <NFTList
                        nftsData={filteredNFTs}
                        sortType={""} // Ersetze "yourSortType" mit dem gewünschten Sortierungstyp
                        title={`${"Search Results for: "}${searchTermFromQuery}`}
                    />
                </div>
            </div>
        </>
    )
}

export default SearchResultPage
