import React, { useState } from "react"

import Categories from "./Categories/Categories"

import styles from "./CategoriesList.module.scss"

const CategoriesList = () => {
    const [selectedCategory, setSelectedCategory] = useState("")

    const categories = [
        { id: "1", name: "Brand New" },
        { id: "2", name: "Top 10" },
        { id: "3", name: "Top Value" },
        { id: "4", name: "Most Sold" },
        { id: "5", name: "DAO" },
        { id: "6", name: "Music" },
        { id: "7", name: "Membership" },
        { id: "8", name: "RWAs" },
        { id: "9", name: "Gaming" },
        { id: "10", name: "Wearables" },
        { id: "11", name: "Digital Twin" },
        { id: "12", name: "Utility" },
    ]

    const handleCategorySelect = (categoryName) => {
        setSelectedCategory(categoryName)
    }

    return (
        <div className={styles.categoriesListWrapper}>
            <Categories categories={categories} onCategorySelect={handleCategorySelect} />
        </div>
    )
}

export default CategoriesList
