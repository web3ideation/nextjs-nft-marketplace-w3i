import React, { useRef, useState } from "react"
import styles from "../styles/Home.module.css"

const SearchSideFiltersElement = ({ label, options, selected, onOptionChange }) => {
    const menuRef = useRef(null)
    const [isOpen, setIsOpen] = useState(false)

    const handleMouseEnter = () => {
        setIsOpen(true)
    }

    const handleMouseLeave = () => {
        setIsOpen(false)
    }

    return (
        <div
            className={styles.searchSideFilters}
            ref={menuRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <h4>{label}</h4>
            {isOpen && (
                <div>
                    <div
                        className={styles.searchSideFiltersItemsWrapper}
                        value={selected}
                        onClick={(e) => onOptionChange(e.target.value)}
                    >
                        {options.map((option, index) => (
                            <button key={index} value={option.value}>
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default SearchSideFiltersElement
