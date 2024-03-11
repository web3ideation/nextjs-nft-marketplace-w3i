// React and Hooks import
import React, { useState, useEffect } from "react"
import { useRouter } from "next/router"

// Styles
import styles from "./SearchBar.module.scss"

// SearchBar Functional Component
const SearchBar = () => {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState("")

    // Determine whether to show the search button based on searchTerm
    const showButton = searchTerm.length > 0

    useEffect(() => {
        const handleRouteChange = () => {
            setSearchTerm("")
        }

        router.events.on("routeChangeStart", handleRouteChange)

        return () => {
            router.events.off("routeChangeStart", handleRouteChange)
        }
    }, [router.events])

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
                className={styles.searchBarInput}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Search..."
                aria-label="Search field"
            />
            {showButton && (
                <div className={styles.searchBarBtn}>
                    <button onClick={handleSearch} className={styles.visible}>
                        Go
                    </button>
                </div>
            )}
        </div>
    )
}

export default SearchBar
