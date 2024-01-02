import React, { useState } from "react"
import { useRouter } from "next/router"
import styles from "../styles/Home.module.css"

const SearchBar = () => {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState("")
    const [focusedField, setFocusedField] = useState(null)

    // ------------------ Handlers ------------------

    // Redirect to the search result page with the current search term
    const handleSearch = () => {
        router.push({
            pathname: "/search-result-page",
            query: {
                search: searchTerm,
            },
        })
    }

    // Trigger search when the Enter key is pressed
    const handleKeyPress = (event) => {
        if (event.key === "Enter") {
            handleSearch()
        }
    }

    // Trigger search when the Go button is clicked
    const handleOnClick = () => {
        handleSearch()
    }

    return (
        <div className={styles.searchBarWrapper}>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search..."
                onBlur={() => setFocusedField(null)}
                onFocus={() => setFocusedField(searchTerm)}
                className={focusedField === searchTerm ? styles.inputFocused : ""}
                aria-label="Search" // Added for accessibility
            />
            <button onClick={handleOnClick}>Go</button>
        </div>
    )
}

export default SearchBar
