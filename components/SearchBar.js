import React, { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { useQuery } from "@apollo/client"
import { GET_ACTIVE_ITEMS } from "../constants/subgraphQueries"
import styles from "../styles/Home.module.css"
import { Button } from "web3uikit"

const SearchBar = ({ onSearch }) => {
    const [searchTerm, setSearchTerm] = useState("")
    const history = useRouter()

    const { loading, error, data } = useQuery(GET_ACTIVE_ITEMS, {
        variables: {
            searchTerm,
        },
    })

    //  useEffect(() => {
    //    // Handle the fetched data here
    //    if (!loading && !error && data && data.items) {
    //      onSearch(data.items);
    //      console.log('Search term:', searchTerm, 'Results:', data.items);
    //    }
    //  }, [loading, error, data, searchTerm, onSearch]);

    const handleSearch = async () => {
        try {
            const response = await fetch(`/?q=${searchTerm}`)
            const searchData = await response.json()
            console.log(searchData)
            if (Array.isArray(searchData)) {
                onSearch(searchData)

                console.log("Search term:", searchTerm, "Results:", searchData)
            }
        } catch (error) {
            console.error("Error fetching data:", error.message)
            onSearch([])
        }

        history.push(`/SearchResultPage?search=${searchTerm}`)
    }

    const handleKeyPress = (event) => {
        if (event.key === "Enter") {
            handleSearch()
        }
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
            <Button key="goButton" text="Go" onClick={handleSearch} />
        </div>
    )
}

export default SearchBar
