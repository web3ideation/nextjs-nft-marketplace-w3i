import React, { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Image from "next/image"
import styles from "./SearchBar.module.scss"

const SearchBar = () => {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        // Set the search term from the query parameter on initial load
        if (router.query.search) {
            setSearchTerm(router.query.search)
        }

        const handleRouteChange = (url) => {
            const query = new URLSearchParams(url.split("?")[1])
            const search = query.get("search") || ""
            setSearchTerm(search)
        }

        router.events.on("routeChangeComplete", handleRouteChange)

        return () => router.events.off("routeChangeComplete", handleRouteChange)
    }, [router.query, router.events])

    const handleSearch = () => {
        router.push({
            pathname: "/search-results",
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

            <div className={styles.searchBarBtn}>
                <button onClick={handleSearch} aria-label="Start Search">
                    <Image src="/media/SearchIcon.png" alt="Search Icon" width={20} height={20} />
                </button>
            </div>
        </div>
    )
}

export default SearchBar
