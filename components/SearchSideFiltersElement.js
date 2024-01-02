import React, { useState } from "react"
import styles from "../styles/Home.module.css"

const SearchSideFiltersElement = ({ label, options, selected, onOptionChange }) => {
    const [isOpen, setIsOpen] = useState(false)

    // Handlers
    const handleMouseEnter = () => setIsOpen(true)
    const handleMouseLeave = () => setIsOpen(false)
    const handleButtonClick = (value) => onOptionChange(value)

    // Helper to render the check icon
    const renderIcon = (optionValue) => (
        <div className={selected === optionValue ? styles.checkIcon : styles.uncheckedIcon} />
    )

    return (
        <div
            className={styles.searchSideFilters}
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
                        key={option.value}
                        value={option.value}
                        onClick={() => handleButtonClick(option.value)}
                    >
                        <span className={styles.filterButtonText}>{option.label}</span>
                        {renderIcon(option.value)}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default SearchSideFiltersElement
