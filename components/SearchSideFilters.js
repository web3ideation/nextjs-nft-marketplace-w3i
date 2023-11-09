import React, { useState, useRef, useEffect } from "react"
import styles from "../styles/Home.module.css"
import SearchSideFiltersElement from "./SearchSideFiltersElement"
import { Chart } from "@web3uikit/icons"

const SearchSideFilters = ({ initialItems, onFilteredItemsChange }) => {
    const menuRef = useRef(null)
    const [isOpen, setIsOpen] = useState(false)
    const [optionsMap, setOptionsMap] = useState({
        Status: [],
        Sorting: [],
        Categories: [],
        Collections: [],
    })

    // 1. Erstellen Sie eine Funktion, um die Sammlungen und ihre Namen zu extrahieren
    const getUniqueCollections = () => {
        const collections = { default: "Default" }

        initialItems.forEach((nft) => {
            if (!collections[nft.nftAddress]) {
                collections[nft.nftAddress] = nft.tokenName
            }
        })

        const collectionsArray = Object.entries(collections).map(([address, name]) => ({
            value: address,
            label: name,
        }))
        console.log("Unique collections:", collectionsArray)
        return collectionsArray
    }

    // Initial filter states
    const [filters, setFilters] = useState({
        selectedSorting: "default",
        selectedStatus: "default",
        selectedCategory: "default",
        selectedCollections: "default",
    })

    // Filter options for each category
    useEffect(() => {
        setOptionsMap({
            Status: [
                { value: "default", label: "All" },
                { value: "listed", label: "Listed" },
                { value: "not listed", label: "Not listed" },
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

    // Apply filters to the initial items and update the filtered list
    const filterItems = () => {
        let filteredList = [...initialItems]

        // Apply status filter
        if (filters.selectedStatus === "listed") {
            filteredList = filteredList.filter((nft) => nft.isListed)
        } else if (filters.selectedStatus === "not listed") {
            filteredList = filteredList.filter((nft) => !nft.isListed)
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
                case "mostSold":
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

        // Inform parent component about the filtered items
        onFilteredItemsChange(filteredList)
    }

    // ------------------ Handlers ------------------

    // Update filter states when an option is selected
    const handleOptionChange = (type, value) => {
        console.log("handleOptionChange:", type, value)
        setFilters((prevFilters) => ({ ...prevFilters, [type]: value }))
    }

    // Toggle the filter menu open/close
    const toggleMenu = () => {
        setIsOpen((prevIsOpen) => !prevIsOpen)
    }

    // Re-filter items whenever filter states change
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
                <div className={styles.filterText}>
                    <h3>Filter</h3>
                    <div
                        className={`${styles.filterOpenButton} ${
                            isOpen ? styles.filterOpenButtonOpen : ""
                        }`}
                        onClick={toggleMenu}
                    >
                        <Chart fontSize="35px" />
                    </div>
                </div>
                {["Status", "Sorting", "Categories", "Collections"].map((label) => (
                    <SearchSideFiltersElement
                        key={label}
                        label={label}
                        options={optionsMap[label]}
                        selected={filters[`selected${label}`]}
                        onOptionChange={(value) => handleOptionChange(`selected${label}`, value)}
                    />
                ))}
                <div className={styles.backgroundPlaceholder}></div>
            </div>
        </div>
    )
}

export default SearchSideFilters
