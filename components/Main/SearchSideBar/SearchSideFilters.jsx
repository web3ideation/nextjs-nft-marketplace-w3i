// Importing React functionalities
import React, { useState, useRef, useEffect } from "react"

// Importing custom components
import SearchSideFiltersElement from "./SideBarElement/SearchSideFiltersElement"

// Importing styles
import styles from "./SearchSideFilters.module.scss"

// SearchSideFilters component definition
const SearchSideFilters = ({ initialItems, onFilteredItemsChange }) => {
    const menuRef = useRef(null)
    const [isOpen, setIsOpen] = useState(false)
    const [isButtonPressed, setIsButtonPressed] = useState(false)

    // State for managing filter options
    const [optionsMap, setOptionsMap] = useState({
        Status: [],
        Sorting: [],
        Categories: [],
        Collections: [],
    })

    // State for managing selected filters
    const [filters, setFilters] = useState({
        selectedSorting: "default",
        selectedStatus: "default",
        selectedCategory: "default",
        selectedCollections: "default",
    })

    // Function to extract unique collections and their names
    const getUniqueCollections = () => {
        const collections = { default: "Default" }

        initialItems.forEach((nft) => {
            if (!collections[nft.nftAddress]) {
                collections[nft.nftAddress] = nft.collectionName
            }
        })

        return Object.entries(collections).map(([address, name]) => ({
            value: address,
            label: name,
        }))
    }

    // Effect to initialize filter options based on initial items
    useEffect(() => {
        setOptionsMap({
            Status: [
                { value: "default", label: "All" },
                { value: "listed", label: "Listed" },
                { value: "not listed", label: "Not listed" },
                { value: "sell", label: "Sell" },
                { value: "swap", label: "Swap" },
            ],
            Sorting: [
                { value: "default", label: "By Default" },
                { value: "highestId", label: "Highest ID" },
                { value: "lowestId", label: "Lowest ID" },
                { value: "highestPrice", label: "Highest Price" },
                { value: "lowestPrice", label: "Lowest Price" },
                { value: "mostSold", label: "Most Sold" },
                { value: "lessSold", label: "Less Sold" },
            ],
            Categories: [
                { value: "default", label: "Default" },
                { value: "wearables", label: "Wearables" },
                { value: "membership", label: "Membership" },
                { value: "music", label: "Music" },
                { value: "staking", label: "Staking" },
                { value: "gaming", label: "Gaming" },
                { value: "dao", label: "Dao" },
            ],
            Collections: getUniqueCollections(),
        })
    }, [initialItems])

    // ------------------ Filtering Logic ------------------
    // Function to apply filters to the initial items
    const filterItems = () => {
        let filteredList = [...initialItems]
        console.log("Vor dem Filtern:", filteredList.length)
        console.log("selected Filters", filters)
        console.log(initialItems)

        // Apply status filter
        if (filters.selectedStatus === "listed") {
            filteredList = filteredList.filter((nft) => nft.isListed)
        } else if (filters.selectedStatus === "not listed") {
            filteredList = filteredList.filter((nft) => !nft.isListed)
        } else if (filters.selectedStatus === "sell") {
            filteredList = filteredList.filter(
                (nft) => nft.desiredNftAddress === "0x0000000000000000000000000000000000000000"
            )
        } else if (filters.selectedStatus === "swap") {
            filteredList = filteredList.filter(
                (nft) => nft.desiredNftAddress !== "0x0000000000000000000000000000000000000000"
            )
        }

        // Apply sorting logic
        filteredList.sort((a, b) => {
            switch (filters.selectedSorting) {
                case "lowestId":
                    return a.tokenId - b.tokenId
                case "highestId":
                    return b.tokenId - a.tokenId
                case "highestPrice":
                    return b.price - a.price
                case "lowestPrice":
                    return a.price - b.price
                case "mostSold":
                    return b.buyerCount - a.buyerCount
                case "lessSold":
                    return a.buyerCount - b.buyerCount
                default:
                    return 0
            }
        })

        // Apply category filter
        if (filters.selectedCategory !== "default") {
            filteredList = filteredList.filter((nft) => nft.category === filters.selectedCategory)
        }
        // Apply collection filter
        if (filters.selectedCollections != "default") {
            filteredList = filteredList.filter((nft) => {
                return nft.nftAddress === filters.selectedCollections
            })
        }
        console.log("Nach dem Filtern:", filteredList)
        console.log("Nach dem Filtern:", filteredList.length)

        // Inform parent component about the filtered items
        onFilteredItemsChange(filteredList)
    }

    // Function to reset filter states
    const resetFilters = () => {
        setFilters({
            selectedSorting: "default",
            selectedStatus: "default",
            selectedCategory: "default",
            selectedCollections: "default",
        })
    }

    // ------------------ Handlers ------------------
    // Function to update filter states based on selected options
    const handleOptionChange = (type, value) => {
        setFilters((prevFilters) => ({ ...prevFilters, [type]: value }))
    }

    // Function to toggle the filter menu
    const toggleMenu = () => {
        setIsOpen((prevIsOpen) => !prevIsOpen)
    }
    const handleTouchStart = () => {
        setIsButtonPressed(true)
    }

    const handleTouchEnd = () => {
        setIsButtonPressed(false)
        // Aufruf der Reset-Funktion hier, falls nicht bereits im onClick-Handler
        resetFilters()
    }

    const handleMouseDown = () => {
        setIsButtonPressed(true)
    }

    const handleMouseUp = () => {
        setIsButtonPressed(false)
    }

    // Effect to re-filter items when filter states change
    useEffect(() => {
        filterItems()
    }, [filters])

    return (
        <div ref={menuRef}>
            <div
                className={`${styles.searchSideFiltersWrapper} ${
                    isOpen ? styles.searchSideFiltersWrapperOpen : ""
                }`}
            >
                {" "}
                <div className={`${styles.backgroundPlaceholder} ${styles.placeholderA}`}></div>
                <div className={styles.filterHeadlineWrapper}>
                    <h3>Filter</h3>
                    <div
                        className={`${styles.filterOpenButton} ${
                            isOpen ? styles.filterOpenButtonOpen : ""
                        }`}
                        onClick={toggleMenu}
                    >
                        <div
                            className={`${styles.sideBarArrow} ${
                                isOpen ? styles.sideBarArrowOpen : ""
                            }`}
                        >
                            <img src="media/arrow_down.png" alt="Menu Arrow"></img>
                        </div>
                    </div>
                </div>
                {["Status", "Sorting", "Categories", "Collections"].map((label) => (
                    <SearchSideFiltersElement
                        key={label}
                        label={label}
                        text={label}
                        options={optionsMap[label]}
                        selected={filters[`selected${label}`]}
                        onOptionChange={(value) => handleOptionChange(`selected${label}`, value)}
                    />
                ))}
                <div className={styles.resetButton}>
                    <button
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onClick={resetFilters}
                        style={{ transform: isButtonPressed ? "scale(0.95)" : "scale(1)" }}
                    >
                        Reset Filters
                    </button>
                </div>
                <div className={`${styles.backgroundPlaceholder} ${styles.placeholderB}`}></div>
            </div>
        </div>
    )
}

export default SearchSideFilters
