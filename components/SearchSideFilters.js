import React, { useState, useRef } from "react"
import styles from "../styles/Home.module.css"
import { Button } from "web3uikit"

const SearchSideFilters = ({ buttonText, options, onChange }) => {
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef(null)

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
            <Button text={buttonText} />
            {isOpen && (
                <div className={styles.searchSideFiltersItemsWrapper}>
                    {options.map((option) => (
                        <Button
                            key={option.id}
                            text={option.label}
                            onClick={() => onChange(event, option.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default SearchSideFilters
