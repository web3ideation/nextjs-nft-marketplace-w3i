import React, { useState, useRef, useEffect } from "react"
import SearchSideFilters from "../components/SearchSideFilters"
import styles from "../styles/Home.module.css"
import NFTBox from "../components/NFTBox"
import { useRouter } from "next/router"
import { Chart } from "@web3uikit/icons"
import { useSearchResults } from "../components/SearchResultsContext"

const SearchResultPage = () => {
    const router = useRouter()
    const { activeSearchResults, inactiveSearchResults } = useSearchResults()

    const [sortingOption, setSortingOption] = useState("default")
    const [selectedCategory, setSelectedCategory] = useState("default")
    const [selectedCollection, setSelectedCollection] = useState("default")
    const [selectedStatus, setSelectedStatus] = useState("default")
    const [filteredNFTs, setFilteredNFTs] = useState([])

    const searchTermFromQuery = router.query.search || ""
    const [combinedResults, setCombinedResults] = useState([])

    useEffect(() => {
        // Hier kombinieren Sie die beiden Arrays und setzen das kombinierte Ergebnis
        const combined = activeSearchResults.concat(inactiveSearchResults)
        setCombinedResults(combined)
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
        if (combinedResults.length) {
            let filteredList = [...combinedResults]
            console.log(filteredList)
            if (selectedStatus === "active") {
                filteredList = filteredList.filter((nft) => nft.isListed)
                console.log("Active items:", filteredList)
            } else if (selectedStatus === "inactive") {
                filteredList = filteredList.filter((nft) => !nft.isListed)
                console.log("Inactive items:", filteredList)
            }

            if (selectedCategory !== "default") {
                // Beispielhafte Filterung (muss an das tatsächliche Datenmodell angepasst werden)
                filteredList = filteredList.filter((nft) => nft.category === selectedCategory)
            }

            if (selectedCollection !== "default") {
                // Beispielhafte Filterung (muss an das tatsächliche Datenmodell angepasst werden)
                filteredList = filteredList.filter((nft) => nft.nftAddress === selectedCollection)
            }

            switch (sortingOption) {
                case "lowestId":
                    // Sorting by tokenId in ascending order
                    filteredList.sort((a, b) => a.tokenId - b.tokenId)
                    break
                case "highestId":
                    // Sorting by tokenId in descending order
                    filteredList.sort((a, b) => b.tokenId - a.tokenId)
                    break
                case "highestPrice":
                    // Sorting by price in ascending order
                    filteredList.sort((a, b) => b.price - a.price)
                    break
                case "lowestPrice":
                    // Sorting by price in descending order
                    filteredList.sort((a, b) => a.price - b.price)
                    break
                default:
                    break
            }
            console.log("NFTs to render:", filteredNFTs)
            setFilteredNFTs(filteredList)
        }
        console.log("filteredNFTs after filtering and sorting:", filteredNFTs)
    }, [combinedResults, selectedStatus, sortingOption, selectedCategory, selectedCollection])

    const handleFilterChange = (type, value) => {
        console.log("Changing filter type:", type, "with value:", value)
        switch (type) {
            case "status":
                setSelectedStatus(value)
                break
            case "sorting":
                setSortingOption(value)
                break
            case "category":
                setSelectedCategory(value)
                break
            case "collection":
                setSelectedCollection(value)
                break
            default:
                break
        }
    }

    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef(null)

    const handleMouseEnter = () => {
        setIsOpen(true)
    }

    const handleMouseLeave = () => {
        setIsOpen(false)
    }

    return (
        <div className={styles.searchResultPage}>
            <div
                className={styles.filterButton}
                ref={menuRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <Chart fontSize="35px" />
            </div>
            {isOpen && (
                <div
                    className={styles.searchSideFiltersWrapper}
                    ref={menuRef}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <p>Filter</p>
                    <div>
                        {isOpen && (
                            <SearchSideFilters
                                buttonText="Sorting"
                                options={[
                                    { id: "default", label: "Default" },
                                    { id: "highestId", label: "Highest ID" },
                                    { id: "lowestId", label: "Lowest ID" },
                                    { id: "highestPrice", label: "Highest Price" },
                                    { id: "lowestPrice", label: "Lowest Price" },
                                ]}
                                onChange={handleFilterChange}
                                value={sortingOption}
                                type="sorting"
                            />
                        )}
                    </div>
                    <div>
                        {isOpen && (
                            <div className="">
                                <SearchSideFilters
                                    buttonText="Status"
                                    options={[
                                        { id: "default", label: "Default" },
                                        { id: "active", label: "Active" },
                                        { id: "inactive", label: "Inactive" },
                                    ]}
                                    onChange={handleFilterChange}
                                    value={selectedStatus}
                                    type="status"
                                />
                            </div>
                        )}
                    </div>
                    <div>
                        {isOpen && (
                            <div className="">
                                <SearchSideFilters
                                    buttonText="Categories"
                                    options={[
                                        { id: "wearables", label: "Wearables" },
                                        { id: "utillities", label: "Utillities" },
                                    ]}
                                    onChange={handleFilterChange}
                                    value={selectedCategory}
                                />
                            </div>
                        )}
                    </div>
                    <div>
                        {isOpen && (
                            <div className="">
                                <SearchSideFilters
                                    buttonText="Collections"
                                    options={[
                                        { id: "pug", label: "Pug" },
                                        { id: "moon", label: "Moon" },
                                    ]}
                                    onChange={handleFilterChange}
                                    value={selectedCollection}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
            <div className={styles.searchResultsWrapper}>
                <h1>Search results for: {searchTermFromQuery} </h1>
                <div className={styles.nftList}>
                    {filteredNFTs.map((result) => (
                        <div key={`${result.nftAddress}${result.tokenId}`}>
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
