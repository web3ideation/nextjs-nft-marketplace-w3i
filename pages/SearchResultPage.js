import React, { useState, useRef } from "react"
import SearchSideFilters from "../components/SearchSideFilters"
import styles from "../styles/Home.module.css"
import NFTBox from "../components/NFTBox"
import { useRouter } from "next/router"
import { Chart } from "@web3uikit/icons"

const SearchResultPage = ({}) => {
    const router = useRouter()
    const [sortingOption, setSortingOption] = useState("default")
    const [selectedCategory, setSelectedCategory] = useState("default")
    const [selectedCollection, setSelectedCollection] = useState("default")

    const searchTermFromQuery = router.query.search || ""
    const activeSearchResultsFromQuery = JSON.parse(router.query.activeSearchResults || "[]")
    const inactiveSearchResultsFromQuery = JSON.parse(router.query.inactiveSearchResults || "[]")

    console.log("Active Search results from query:", activeSearchResultsFromQuery)
    console.log("Inactive search results from query:", inactiveSearchResultsFromQuery)

    const handleSortingChange = (event, sortingType) => {
        setSortingOption(sortingType)
        let sortedResults = [...activeSearchResultsFromQuery] // Create a new array to avoid modifying the original
        console.log(activeSearchResultsFromQuery)
        switch (sortingType) {
            case "Active Items":
                // Default sorting by ID (you can replace with appropriate field)
                sortedResults.sort((a, b) => a.id.localeCompare(b.id))
                break
            case "Inactive Items":
                // Sorting by a different field (replace with appropriate field)
                sortedResults.sort((a, b) => a.someField.localeCompare(b.someField))
                break
            default:
                // Use default sorting logic here
                break
        }
    }
    const handleCategoryChange = (event, selectedCategory) => {
        setSelectedCategory(selectedCategory)
        const filteredResults = searchResults.filter(
            (result) => result.category === selectedCategory
        )
        console.log("Choosen category:", selectedCategory)
        // Hier können Sie Ihre Verarbeitungslogik hinzufügen, um die Suchergebnisse basierend auf der ausgewählten Kategorie zu filtern oder sortieren.
        setSearchResults(filteredResults)
        console.log("Here are the results filtered by categories" + filteredResults)
    }

    const handleCollectionChange = (even, selectedCollection) => {
        setSelectedCollection(selectedCollection)
        const filteredResults = searchResults.filter(
            (result) => result.category === selectedCollection
        )
        console.log("Choosen collection:", selectedCollection)
        // Hier können Sie Ihre Verarbeitungslogik hinzufügen, um die Suchergebnisse basierend auf der ausgewählten Kategorie zu filtern oder sortieren.
        setSearchResults(filteredResults)
        console.log("Here are the results filtered by collections" + filteredResults)
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
                    className={styles.dropDownSearchWrapper}
                    ref={menuRef}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <p>Filter</p>
                    {isOpen && (
                        <SearchSideFilters
                            buttonText="Show all"
                            options={[
                                { id: "active", label: "Active Items" },
                                { id: "inactive", label: "Inactive Items" },
                            ]}
                            onChange={(event, sortingType) =>
                                handleSortingChange(event, sortingType)
                            }
                            value={sortingOption}
                        />
                    )}
                    <div>
                        {isOpen && (
                            <div className="">
                                <SearchSideFilters
                                    buttonText="Categories"
                                    options={[
                                        { id: "wearables", label: "Wearables" },
                                        { id: "utillities", label: "Utillities" },
                                    ]}
                                    onChange={(event, selectedCategory) =>
                                        handleCategoryChange(event, selectedCategory)
                                    }
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
                                    onChange={(event, selectedCollection) =>
                                        handleCollectionChange(event, selectedCollection)
                                    }
                                    value={selectedCollection}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
            <div className={styles.searchResultsWrapper}>
                <h1>Search results for: {searchTermFromQuery} </h1>
                <h3>Active items: </h3>
                <div className={styles.NFTListed}>
                    {activeSearchResultsFromQuery.map((result) => (
                        <div key={`${result.nftAddress}${result.tokenId}`}>
                            <NFTBox
                                price={result.price}
                                nftAddress={result.nftAddress}
                                tokenId={result.tokenId}
                            ></NFTBox>
                        </div>
                    ))}
                </div>
                <h3>Inactive items: </h3>
                <div className={styles.NFTListed}>
                    {inactiveSearchResultsFromQuery.map((resultInactive) => (
                        <div key={`${resultInactive.nftAddress}${resultInactive.tokenId}`}>
                            <NFTBox
                                price={resultInactive.price}
                                nftAddress={resultInactive.nftAddress}
                                tokenId={resultInactive.tokenId}
                            ></NFTBox>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default SearchResultPage
