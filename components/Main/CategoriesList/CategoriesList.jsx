// React import
import React, { useState } from "react"

// Component imports: Custom hooks and components
import Categories from "./Categories/Categories"

// Style imports
import styles from "./CategoriesList.module.scss"

// CategoriesList component: Displays a list of categories and handles category selection
const CategoriesList = () => {
    // State for tracking the currently selected category
    const [selectedCategory, setSelectedCategory] = useState("")

    // Categories data: List of categories to be displayed
    const categories = [
        { id: "1", name: "New" },
        { id: "2", name: "DAO" },
        { id: "3", name: "Music" },
        { id: "4", name: "Membership" },
        { id: "5", name: "RWAs" },
        { id: "6", name: "Gaming" },
        { id: "7", name: "Art" },
        { id: "8", name: "VR Estate" },
        { id: "9", name: "Collectibles" },
        { id: "10", name: "Sports" },
        { id: "11", name: "Entertainment" },
        { id: "12", name: "Education" },
        { id: "13", name: "Health & Wellness" },
        { id: "14", name: "Finance" },
        { id: "15", name: "Technology" },
        { id: "16", name: "Fashion" },
        { id: "17", name: "Literature" },
        { id: "18", name: "Travel" },
        { id: "19", name: "F&B" },
        { id: "20", name: "Social Media" },
        { id: "21", name: "Environment" },
        { id: "22", name: "Education" },
        { id: "23", name: "Health & Wellness" },
        { id: "24", name: "Finance" },
        { id: "25", name: "Technology" },
        { id: "26", name: "Fashion" },
        { id: "27", name: "Literature" },
        { id: "28", name: "Travel" },
        { id: "29", name: "F&B" },
        { id: "30", name: "Social Media" },
        { id: "31", name: "Environment" },
    ]

    // handleCategorySelect: Updates the state with the selected category and logs the selection
    const handleCategorySelect = (categoryName) => {
        setSelectedCategory(categoryName)
        console.log(`Kategorie ausgewählt: ${categoryName}`)
    }

    // Render: Displays the categories wrapped in a styled div
    return (
        <div className={styles.categoriesListWrapper}>
            <Categories categories={categories} onCategorySelect={handleCategorySelect} />
        </div>
    )
}

export default CategoriesList
