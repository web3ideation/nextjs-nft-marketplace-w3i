import React, { useState, useRef, useEffect } from "react"
import styles from "../styles/Home.module.css"
import SearchSideFiltersElement from "./SearchSideFiltersElement"
import { Chart } from "@web3uikit/icons"

const SearchSideFilters = ({ initialItems, onFilteredItemsChange }) => {
    const menuRef = useRef(null)
    const [isOpen, setIsOpen] = useState(false)

    const [filters, setFilters] = useState({
        selectedSorting: "default",
        selectedStatus: "default",
        selectedCategory: "default",
        selectedCollection: "default",
    })

    const OPTIONS_MAP = {
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
        ],
        Categories: [
            { value: "wearables", label: "Wearables" },
            { value: "utillities", label: "Utillities" },
        ],
        Collections: [
            { value: "pug", label: "Pug" },
            { value: "moon", label: "Moon" },
        ],
    }

    const filterItems = () => {
        let filteredList = [...initialItems]

        // Status filter
        if (filters.selectedStatus === "listed") {
            console.log("Filtering listed items")
            filteredList = filteredList.filter((nft) => nft.isListed)
        } else if (filters.selectedStatus === "not listed") {
            console.log("Filtering not listed items")
            filteredList = filteredList.filter((nft) => !nft.isListed)
        } else {
            console.log("No status filter applied")
        }

        // Sorting logic
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
                default:
                    return 0
            }
        })

        // Category filter
        if (filters.selectedCategory !== "default") {
            filteredList = filteredList.filter((nft) => nft.category === filters.selectedCategory)
        }

        // Collection filter
        if (filters.selectedCollection !== "default") {
            filteredList = filteredList.filter(
                (nft) => nft.nftAddress === filters.selectedCollection
            )
        }

        // Informieren Sie die übergeordnete Komponente über die gefilterten Elemente
        onFilteredItemsChange(filteredList)
    }

    const handleOptionChange = (type, value) => {
        setFilters((prevFilters) => ({ ...prevFilters, [type]: value }))
    }

    const toggleMenu = () => {
        setIsOpen((prevIsOpen) => !prevIsOpen)
    }

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
                        options={OPTIONS_MAP[label]}
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
