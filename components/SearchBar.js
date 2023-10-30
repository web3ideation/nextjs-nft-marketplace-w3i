import React, { useState } from "react"
import styles from "../styles/Home.module.css"
import { Button } from "web3uikit"
import { useRouter } from "next/router"

const SearchBar = () => {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState("")

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
                className={styles.searchBar}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search..."
            />
            <Button key="goButton" text="Go" onClick={handleOnClick} />
        </div>
    )
}

export default SearchBar
