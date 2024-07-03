// React Imports
import React, { useState, useRef, useEffect } from "react"

// Style Imports
import styles from "./SearchSideFiltersElement.module.scss"

// SearchSideFiltersElement: Dropdown filter component for search sidebar.
const SearchSideFiltersElement = ({ label, options, selected, onOptionChange }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isButtonPressed, setIsButtonPressed] = useState(false)

    const handleMouseEnter = () => setIsOpen(true)

    const handleMouseLeave = () => setIsOpen(false)

    // handleButtonClick: Triggered when a filter option is clicked.
    const handleButtonClick = (value) => {
        if (selected === value) {
            onOptionChange("default")
        } else {
            onOptionChange(value)
        }
    }

    const handleTouchStart = (event) => {
        event.preventDefault()
        setIsButtonPressed(true)
    }

    const handleTouchEnd = () => {
        setIsButtonPressed(false)
        setIsOpen(!isOpen)
    }

    const handleMouseDown = () => {
        setIsButtonPressed(true)
    }

    const handleMouseUp = () => {
        setIsButtonPressed(false)
    }

    const listRef = useRef(null)

    const onWheel = (e) => {
        if (!listRef.current) return

        listRef.current.scrollTop += e.deltaY

        // Verhindern, dass das Scroll-Event weitergeleitet wird und andere Scroll-Operationen ausführt
        e.preventDefault()
    }
    // Effect Hook, um den Event Listener hinzuzufügen
    useEffect(() => {
        const listElement = listRef.current
        if (listElement) {
            listElement.addEventListener("wheel", onWheel)
        }

        // Cleanup-Funktion
        return () => {
            if (listElement) {
                listElement.removeEventListener("wheel", onWheel)
            }
        }
    }, [])
    // renderIcon: Renders the check/uncheck icon based on the selected option.
    const renderIcon = (optionValue) => (
        <div className={selected === optionValue ? styles.checkIcon : styles.uncheckedIcon} />
    )

    return (
        <div className={styles.searchSideFilters} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <div
                className={styles.searchSideFiltersOptionWrapper}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                style={{ transform: isButtonPressed ? "scale(0.95)" : "scale(1)" }}
            >
                <h6>{label}</h6>
            </div>
            <div
                ref={listRef}
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
    )
}

export default SearchSideFiltersElement
