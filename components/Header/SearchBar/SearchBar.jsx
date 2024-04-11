import React, { useState, useEffect } from "react"

import { useRouter } from "next/router"

import styles from "./SearchBar.module.scss"

const SearchBar = () => {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        const handleRouteChange = () => setSearchTerm("")

        router.events.on("routeChangeStart", handleRouteChange)

        return () => router.events.off("routeChangeStart", handleRouteChange)
    }, [router.events])

    const handleSearch = () => {
        router.push({
            pathname: "/search-result-page",
            query: { search: searchTerm },
        })
    }

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
            {searchTerm.length > 0 && (
                <button onClick={handleSearch} className={styles.searchBarBtn}>
                    Go
                </button>
            )}
        </div>
    )
}

export default SearchBar
