import React, { useState, useEffect } from "react"
import SearchSideFilters from "../components/SearchSideFilters"
import styles from "../styles/Home.module.css"
import NFTBox from "../components/NFTBox"
import { useRouter } from "next/router"
import { useNFT } from "../context/NFTContextProvider"
import { ethers } from "ethers"

const SearchResultPage = () => {
    const router = useRouter()
    const { nftsData, loadingImage } = useNFT()

    const [searchResults, setSearchResults] = useState([])
    const [filteredNFTs, setFilteredNFTs] = useState([])

    // Retrieve search term from the URL query
    const searchTermFromQuery = router.query.search || ""

    // ------------------ Effects ------------------

    // Filter NFTs based on the search term when data or query changes
    useEffect(() => {
        const filteredResults = nftsData.filter((item) => {
            const formattedPrice = ethers.utils.formatUnits(item.price, "ether")

            const concatenatedFields = [
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
            ].join(" ")
            const lowerCaseConcatenated = concatenatedFields.toLowerCase()

            return lowerCaseConcatenated.includes(searchTermFromQuery.toLowerCase())
        })

        setSearchResults(filteredResults)
        setFilteredNFTs(filteredResults)
    }, [nftsData, searchTermFromQuery])

    // ------------------ Handlers ------------------

    // Update the filtered NFTs based on side filter changes
    const handleFilteredItemsChange = (newFilteredItems) => {
        setFilteredNFTs(newFilteredItems)
    }
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
                <h1>Search results for: {searchTermFromQuery} </h1>
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
