import React, { useRef, useState } from "react"
import styles from "../styles/Home.module.css"
import { CheckCircle } from "@web3uikit/icons"
import { CrossCircle } from "@web3uikit/icons"
const SearchSideFiltersElement = ({ label, options, selected, onOptionChange }) => {
    const menuRef = useRef(null)
    const [isOpen, setIsOpen] = useState(false)

    const handleMouseEnter = () => {
        setIsOpen(true)
    }

    const handleMouseLeave = () => {
        setIsOpen(false)
    }

    const handleButtonClick = (value) => {
        onOptionChange(value)
    }

    const renderIcon = (optionValue) => {
        if (selected === optionValue || (selected === "default" && optionValue === "default")) {
            return <CheckCircle fontSize="30px" />
        }
        return <CrossCircle fontSize="30px" />
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
                        {option.label}
                        {renderIcon(option.value)}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default SearchSideFiltersElement
