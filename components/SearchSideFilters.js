import React, { useState, useRef, useEffect } from "react"
import styles from "../styles/Home.module.css"
import SearchSideFiltersElement from "./SearchSideFiltersElement"
import { Chart } from "@web3uikit/icons"

const SearchSideFilters = ({ initialItems, onFilteredItemsChange }) => {
    const menuRef = useRef(null)
    const [isOpen, setIsOpen] = useState(false)

    const [selectedSorting, setSelectedSorting] = useState("default")
    const [selectedStatus, setSelectedStatus] = useState("default")
    const [selectedCategory, setSelectedCategory] = useState("default")
    const [selectedCollection, setSelectedCollection] = useState("default")

    const filterItems = () => {
        let filteredList = [...initialItems]

        // Status filter
        if (selectedStatus === "active") {
            console.log("Filtering active items")
            filteredList = filteredList.filter((nft) => nft.isListed)
        } else if (selectedStatus === "inactive") {
            console.log("Filtering inactive items")
            filteredList = filteredList.filter((nft) => !nft.isListed)
        } else {
            console.log("No status filter applied")
        }

        // Category filter
        if (selectedCategory !== "default") {
            filteredList = filteredList.filter((nft) => nft.category === selectedCategory)
        }

        // Collection filter
        if (selectedCollection !== "default") {
            filteredList = filteredList.filter((nft) => nft.nftAddress === selectedCollection)
        }

        // Sorting logic
        filteredList.sort((a, b) => {
            switch (selectedSorting) {
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

        // Informieren Sie die übergeordnete Komponente über die gefilterten Elemente
        onFilteredItemsChange(filteredList)
    }

    const handleOptionChange = (type, value) => {
        switch (type) {
            case "status":
                setSelectedStatus(value)
                break
            case "sorting":
                setSelectedSorting(value)
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
        filterItems()
    }

    const handleMouseEnter = () => {
        setIsOpen(true)
    }

    const handleMouseLeave = () => {
        setIsOpen(false)
    }

    useEffect(() => {
        filterItems()
    }, [selectedSorting, selectedStatus, selectedCategory, selectedCollection])

    return (
        <div ref={menuRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <div className={styles.filterButton}>
                <Chart fontSize="35px" />
            </div>
            <div>
                {isOpen && (
                    <div className={styles.searchSideFiltersWrapper}>
                        <SearchSideFiltersElement
                            label="Status"
                            options={[
                                { value: "default", label: "Default" },
                                { value: "active", label: "Active" },
                                { value: "inactive", label: "Inactive" },
                            ]}
                            selected={selectedStatus}
                            onOptionChange={(value) => handleOptionChange("status", value)}
                        />
                        <SearchSideFiltersElement
                            label="Sorting"
                            options={[
                                { value: "default", label: "Default" },
                                { value: "highestId", label: "Highest ID" },
                                { value: "lowestId", label: "Lowest ID" },
                                { value: "highestPrice", label: "Highest Price" },
                                { value: "lowestPrice", label: "Lowest Price" },
                            ]}
                            selected={selectedSorting}
                            onOptionChange={(value) => handleOptionChange("sorting", value)}
                        />
                        <SearchSideFiltersElement
                            label="Categories"
                            options={[
                                { value: "wearables", label: "Wearables" },
                                { value: "utillities", label: "Utillities" },
                            ]}
                            selected={selectedCategory}
                            onOptionChange={(value) => handleOptionChange("category", value)}
                        />

                        <SearchSideFiltersElement
                            label="Collections"
                            options={[
                                { value: "pug", label: "Pug" },
                                { value: "moon", label: "Moon" },
                            ]}
                            selected={selectedCollection}
                            onOptionChange={(value) => handleOptionChange("collection", value)}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

export default SearchSideFilters
