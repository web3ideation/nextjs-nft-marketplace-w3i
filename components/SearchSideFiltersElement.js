import React, { useRef, useState } from "react"
import styles from "../styles/Home.module.css"

const SearchSideFiltersElement = ({ label, options, selected, onOptionChange }) => {
    const menuRef = useRef(null)
    const [isOpen, setIsOpen] = useState(false)

    // ------------------ Handlers ------------------

    // Open the filter menu when the mouse enters
    const handleMouseEnter = () => {
        setIsOpen(true)
    }

    // Close the filter menu when the mouse leaves
    const handleMouseLeave = () => {
        setIsOpen(false)
    }

    // Handle the filter option click
    const handleButtonClick = (value) => {
        onOptionChange(value)
    }

    // Render the check icon if the option is selected
    const renderIcon = (optionValue) => {
        return (
            <div
                className={selected === optionValue ? styles.checkIcon : styles.uncheckedIcon}
            ></div>
        )
    }

    return (
        <div
            className={styles.searchSideFilters}
            ref={menuRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className={styles.searchSideFiltersOptionWrapper}>
                <h4>{label}</h4>
            </div>
            <div
                className={`${styles.searchSideFiltersItemsWrapper} ${
                    isOpen ? styles.searchSideFiltersItemsWrapperOpen : ""
                }`}
            >
                {options.map((option, index) => (
                    <button
                        className={styles.filterButton}
                        key={index}
                        value={option.value}
                        onClick={() => handleButtonClick(option.value)}
                    >
                        <span className={styles.filterButtonText}>{option.label}</span>{" "}
                        {renderIcon(option.value)}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default SearchSideFiltersElement
