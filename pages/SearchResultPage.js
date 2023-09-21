import React, { useState } from "react"
import DropDownSearch from "../components/DropDownSearch"
import { Button } from "web3uikit"
import styles from "../styles/Home.module.css"
import NFTBox from "../components/NFTBox"
import { useRouter } from "next/router"

const SearchResultPage = ({}) => {
    const router = useRouter()
    const [sortingOption, setSortingOption] = useState("default")
    const [selectedCategory, setSelectedCategory] = useState("default")
    const [selectedCollection, setSelectedCollection] = useState("default")
    const [showDropdowns, setShowDropdowns] = useState(true)

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

    const toggleDropdowns = () => {
        setShowDropdowns(!showDropdowns)
    }

    return (
        <div className={styles.searchResultPage}>
            <div className={styles.dropDownSearchWrapper}>
                <Button onClick={toggleDropdowns} text="Filters" />
                <div>
                    {showDropdowns && (
                        <div className="">
                            <DropDownSearch
                                buttonText="Sort by"
                                options={[
                                    { id: "active", label: "Active Items" },
                                    { id: "inactive", label: "Inactive Items" },
                                ]}
                                onChange={(event, sortingType) =>
                                    handleSortingChange(event, sortingType)
                                }
                                value={sortingOption}
                            />
                        </div>
                    )}
                </div>
                <div>
                    {showDropdowns && (
                        <div className="">
                            <DropDownSearch
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
                    {showDropdowns && (
                        <div className="">
                            <DropDownSearch
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
            <div className={styles.searchResultsWrapper}>
                <h2>Search results for: {searchTermFromQuery} </h2>
                <h3>Active items: </h3>
                <div className={styles.NFTListed}>
                    {activeSearchResultsFromQuery.map((result) => (
                        <div key={`${result.nftAddress}${result.tokenId}`}>
                            <NFTBox
                                price={result.price}
                                nftAddress={result.nftAddress}
                                tokenId={result.tokenId}
                                marketplaceAddress={result.marketplaceAddress}
                                seller={result.seller}
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
                                marketplaceAddress={resultInactive.marketplaceAddress}
                                seller={resultInactive.seller}
                            ></NFTBox>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default SearchResultPage
