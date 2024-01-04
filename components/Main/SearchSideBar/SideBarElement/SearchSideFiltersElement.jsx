// React Imports
import React, { useState } from "react";

// Style Imports
import styles from "../../../../styles/Home.module.css";

// SearchSideFiltersElement: Dropdown filter component for search sidebar.
const SearchSideFiltersElement = ({ label, options, selected, onOptionChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Event Handlers
    // handleMouseEnter: Opens the filter dropdown on mouse enter.
    const handleMouseEnter = () => setIsOpen(true);

    // handleMouseLeave: Closes the filter dropdown on mouse leave.
    const handleMouseLeave = () => setIsOpen(false);

    // handleButtonClick: Triggered when a filter option is clicked.
    const handleButtonClick = (value) => onOptionChange(value);

    // renderIcon: Renders the check/uncheck icon based on the selected option.
    const renderIcon = (optionValue) => (
        <div className={selected === optionValue ? styles.checkIcon : styles.uncheckedIcon} />
    );

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
                        key={option.value}
                        className={styles.filterButton}
                        value={option.value}
                        onClick={() => handleButtonClick(option.value)}
                    >
                        <span className={styles.filterButtonText}>{option.label}</span>
                        {renderIcon(option.value)}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SearchSideFiltersElement;
