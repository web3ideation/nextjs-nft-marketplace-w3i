// React and Next.js imports
import React, { useRef, useState, useEffect } from "react"
import Image from "next/image"

// User-created components imports
import CategoryIcon from "../CategoriesIcon/CategoryIcon"

// Style imports
import styles from "./Categories.module.scss"

/**
 * Displays a scrollable list of categories with forward and backward scroll functionality.
 * Each category can be selected, triggering a callback function.
 *
 * Props:
 * - categories: Array of category objects to display.
 * - onCategorySelect: Function to call when a category is selected.
 */
const Categories = ({ categories, onCategorySelect }) => {
    const scrollContainerRef = useRef(null)
    const [showScrollBackButton, setShowScrollBackButton] = useState(false)
    const [showScrollForwardButton, setShowScrollForwardButton] = useState(true)

    // Checks the scroll position to toggle the visibility of scroll buttons
    const checkScrollButtons = () => {
        const container = scrollContainerRef.current
        const canScrollLeft = container?.scrollLeft > 0
        const canScrollRight =
            container?.scrollLeft < container?.scrollWidth - container?.clientWidth

        setShowScrollBackButton(canScrollLeft)
        setShowScrollForwardButton(canScrollRight)
    }

    // Scrolls the category list in the specified direction
    const scroll = (direction) => {
        const scrollContainer = scrollContainerRef.current
        if (scrollContainer) {
            // Calculate scroll offset as a percentage of the container's width (e.g., 75%)
            const scrollOffset = scrollContainer.clientWidth * 0.75
            scrollContainer.scrollLeft += direction === "forward" ? scrollOffset : -scrollOffset
            checkScrollButtons()
        }
    }

    // Adds a scroll event listener to check button visibility and performs an initial check
    useEffect(() => {
        const scrollContainer = scrollContainerRef.current
        scrollContainer.addEventListener("scroll", checkScrollButtons)
        checkScrollButtons()

        return () => {
            scrollContainer.removeEventListener("scroll", checkScrollButtons)
        }
    }, [])

    return (
        <div className={styles.categoryList}>
            {showScrollBackButton && (
                <div className={`${styles.scrollButtonContainer} ${styles.left}`}>
                    <button
                        onClick={() => scroll("backward")}
                        className={`${styles.scrollButton} ${styles.buttonLeft}`}
                    >
                        <Image
                            width={20}
                            height={20}
                            src="/media/arrow_down.png"
                            alt="Menu Arrow"
                        />
                    </button>
                </div>
            )}
            <div className={styles.categoryWrapper} ref={scrollContainerRef}>
                {categories.map((category) => (
                    <div
                        key={category.id}
                        className={styles.category}
                        onClick={() => onCategorySelect(category.name)}
                    >
                        <div className={styles.categoryImage}>
                            <CategoryIcon categoryName={category.name} />
                        </div>
                        <div className={styles.categoryName}>{category.name}</div>
                    </div>
                ))}
            </div>
            {showScrollForwardButton && (
                <div className={`${styles.scrollButtonContainer} ${styles.right}`}>
                    <button
                        onClick={() => scroll("forward")}
                        className={`${styles.scrollButton} ${styles.buttonRight}`}
                    >
                        <Image
                            width={20}
                            height={20}
                            src="/media/arrow_down.png"
                            alt="Menu Arrow"
                        />
                    </button>
                </div>
            )}
        </div>
    )
}

export default Categories
