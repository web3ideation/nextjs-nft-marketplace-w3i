import React, { useState } from "react"
import PropTypes from "prop-types"
import DropDownSearch from "../components/DropDownSearch"
import { Button } from "web3uikit"
import styles from "../styles/Home.module.css"

const SearchResultPage = ({ searchResults = [], setSearchResults }) => {
    const [sortingOption, setSortingOption] = useState("default")
    const [showDropdowns, setShowDropdowns] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    console.log("searchResults prop:", searchResults)

    const handleSortingChange = (event, sortingType) => {
        setSortingOption(sortingType)
        let sortedResults = [...searchResults] // Create a new array to avoid modifying the original
        console.log(searchResults)
        switch (sortingType) {
            case "Active Items":
                // Default sorting by ID (you can replace with appropriate field)
                sortedResults.sort((a, b) => a.id.localeCompare(b.id))
                break
            case "Recently Sold":
                // Sorting by most recent date (you can replace with appropriate field)
                sortedResults.sort(
                    (a, b) => new Date(b.recentlySoldDate) - new Date(a.recentlySoldDate)
                )
                break
            case "Most Sold":
                // Sorting by most sold count
                sortedResults.sort((a, b) => b.mostSoldCount - a.mostSoldCount)
                break
            case "Oldest":
                // Sorting by oldest date (you can replace with appropriate field)
                sortedResults.sort((a, b) => new Date(a.date) - new Date(b.date))
                break
            case "Youngest":
                // Sorting by most recent date
                sortedResults.sort((a, b) => new Date(b.date) - new Date(a.date))
                break
            case "Highest Price":
                // Sorting by highest price
                sortedResults.sort((a, b) => b.price - a.price)
                break
            default:
                // Use default sorting logic here
                break
        }

        // Set the sorted results to the state or perform any further processing
        setSearchResults(sortedResults)

        console.log("Hier stehen die sortierten Ergebnisse" + sortedResults)
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
                                    { id: "recent", label: "Recently Sold" },
                                    { id: "most", label: "Most Sold" },
                                    { id: "oldest", label: "Oldest" },
                                    { id: "youngest", label: "Youngest" },
                                    { id: "highest Price", label: "Highest Price" },
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
                                    { id: "music", label: "Music" },
                                    { id: "art", label: "Art" },
                                    { id: "dao", label: "DAO" },
                                    { id: "wearables", label: "Wearables" },
                                    { id: "utillities", label: "Utillities" },
                                    { id: "more", label: "More" },
                                    { id: "and more", label: "And More" },
                                    { id: "and morer", label: "And Morer" },
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
                                buttonText="Collections"
                                options={[
                                    { id: "sun", label: "Sun" },
                                    { id: "moon", label: "Moon" },
                                    { id: "earth", label: "Earth" },
                                    { id: "venus", label: "Venus" },
                                    { id: "jupiter", label: "Jupiter" },
                                    { id: "saturn", label: "Saturn" },
                                ]}
                                onChange={(event, sortingType) =>
                                    handleSortingChange(event, sortingType)
                                }
                                value={sortingOption}
                            />
                        </div>
                    )}
                </div>
            </div>
            <div className={styles.searchResultsWrapper}>
                <h2>Suchergebnisse</h2>
                <div className={styles.searchResults}>
                    <ul>
                        {loading && <p>Loading...</p>}
                        {error && <p>Error: {error.message}</p>}
                        {searchResults.map((result) => (
                            <div>
                                <li
                                    key={result.id}
                                    className="border border-gray-300 p-4 mb-2 w-96 rounded-lg shadow-md"
                                >
                                    <h3 className="text-xl font-semibold">{result.art}</h3>
                                    <p className="text-gray-600">{result.music}</p>
                                    {/* You can add more information from the search result object */}
                                </li>
                            </div>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}

SearchResultPage.propTypes = {
    searchResults: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            art: PropTypes.string.isRequired,
            music: PropTypes.string.isRequired,
        })
    ).isRequired,
    setSearchResults: PropTypes.func.isRequired,
}

export default SearchResultPage
