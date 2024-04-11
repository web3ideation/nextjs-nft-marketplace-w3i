import React, { useState, useRef, useEffect } from "react"
import Image from "next/image"
import SearchSideFiltersElement from "./SideBarElement/SearchSideFiltersElement"
import styles from "./SearchSideFilters.module.scss"

const SearchSideFilters = ({ initialItems, onFilteredItemsChange }) => {
    const menuRef = useRef(null)
    const [isOpen, setIsOpen] = useState(false)
    const [isButtonPressed, setIsButtonPressed] = useState(false)

    const [optionsMap, setOptionsMap] = useState({
        Status: [],
        Sorting: [],
        Categories: [],
        Collections: [],
    })

    const [filters, setFilters] = useState({
        selectedSorting: "default",
        selectedStatus: "default",
        selectedCategory: "default",
        selectedCollections: "default",
    })

    const getUniqueCollections = () => {
        const collections = { default: "Default" }
        initialItems.forEach(({ nftAddress, collectionName }) => {
            collections[nftAddress] = collections[nftAddress] || collectionName
        })
        return Object.entries(collections).map(([value, label]) => ({ value, label }))
    }

    useEffect(() => {
        setOptionsMap((prev) => ({
            ...prev,
            Status: [
                { value: "default", label: "All" },
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
                { value: "dao", label: "DAO" },
                { value: "music", label: "Music" },
                { value: "membership", label: "Membership" },
                { value: "real world assets", label: "Real world assets" },
                { value: "gaming", label: "Gaming" },
                { value: "wearables", label: "Wearables" },
                { value: "digital twin", label: "Digital Twin" },
                { value: "utility", label: "Utility" },
            ],
            Collections: getUniqueCollections(),
        }))
    }, [initialItems])

    const filterItems = () => {
        let filteredList = [...initialItems]
        if (filters.selectedStatus !== "default") {
            filteredList = filteredList.filter((nft) => {
                if (filters.selectedStatus === "sell")
                    return nft.desiredNftAddress === "0x0000000000000000000000000000000000000000"
                if (filters.selectedStatus === "swap")
                    return nft.desiredNftAddress !== "0x0000000000000000000000000000000000000000"
                return true
            })
        }
        if (filters.selectedCategory !== "default") {
            filteredList = filteredList.filter((nft) => nft.category === filters.selectedCategory)
        }
        if (filters.selectedCollections !== "default") {
            filteredList = filteredList.filter(
                (nft) => nft.nftAddress === filters.selectedCollections
            )
        }
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

        onFilteredItemsChange(filteredList)
    }

    useEffect(() => filterItems(), [filters])

    const handleOptionChange = (type, value) => {
        setFilters((prevFilters) => ({ ...prevFilters, [type]: value }))
    }

    const toggleMenu = () => setIsOpen((prevIsOpen) => !prevIsOpen)
    const handleButtonInteraction = (isPressed) => setIsButtonPressed(isPressed)

    return (
        <div ref={menuRef}>
            <div
                className={`${styles.searchSideFiltersWrapper} ${
                    isOpen ? styles.searchSideFiltersWrapperOpen : ""
                }`}
            >
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
                            <Image
                                width={20}
                                height={20}
                                src="/media/arrow_down.png"
                                alt="Menu Arrow"
                            />
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
                        onTouchStart={() => handleButtonInteraction(true)}
                        onTouchEnd={() => handleButtonInteraction(false)}
                        onMouseDown={() => handleButtonInteraction(true)}
                        onMouseUp={() => handleButtonInteraction(false)}
                        onClick={() =>
                            setFilters({
                                selectedSorting: "default",
                                selectedStatus: "default",
                                selectedCategory: "default",
                                selectedCollections: "default",
                            })
                        }
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
