// React and Hooks import
import React, { useState } from "react"
import { useRouter } from "next/router"

// Styles
import styles from "../../../styles/Home.module.css"

// SearchBar Functional Component
const SearchBar = () => {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState("")
    const [isFocused, setIsFocused] = useState(false)

    // Determine whether to show the search button based on searchTerm
    const showButton = searchTerm.length > 0

    // ------------------ Handlers ------------------

    // Function to handle search action
    const handleSearch = () => {
        router.push({
            pathname: "/search-result-page",
            query: {
                search: searchTerm,
            },
        })
    }

    // Function to handle key press event in the search bar
    const handleKeyPress = (event) => {
        if (event.key === "Enter") {
            handleSearch()
        }
    }

    return (
        <div className={styles.searchBarWrapper}>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search..."
                onBlur={() => setIsFocused(false)}
                onFocus={() => setIsFocused(true)}
                className={isFocused ? styles.inputFocused : ""}
                aria-label="Search field"
            />
            {showButton && (
                <button onClick={handleSearch} className={styles.visible}>
                    Go
                </button>
            )}
        </div>
    )
}

export default SearchBar
