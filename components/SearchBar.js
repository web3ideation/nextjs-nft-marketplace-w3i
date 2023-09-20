import React, { useState } from "react"
import styles from "../styles/Home.module.css"
import { Button } from "web3uikit"
import { useRouter } from "next/router"
import { GET_ACTIVE_ITEMS, GET_INACTIVE_ITEMS } from "../constants/subgraphQueries"
import { useQuery } from "@apollo/client"

const SearchBar = ({}) => {
    const router = useRouter()
    const [searchResults, setSearchResults] = useState([])
    const [inactiveSearchResults, setInactiveSearchResults] = useState([]) // State for the results of the second query

    const [searchTerm, setSearchTerm] = useState("")
    const { loading, error, data } = useQuery(GET_ACTIVE_ITEMS, {
        variables: { searchTerm },
    })

    // second query for inactive elements
    const {
        loading: inactiveLoading,
        error: inactiveError,
        data: inactiveData,
    } = useQuery(GET_INACTIVE_ITEMS, {
        variables: { searchTerm },
    })

    console.log(loading)
    console.log(error)
    console.log(data)
    console.log(inactiveLoading)
    console.log(inactiveError)
    console.log(inactiveData)

    const handleSearch = async () => {
        try {
            if (!loading && !error && data && data.items) {
                const searchResults = data.items.filter((item) => {
                    const concatenatedFields = [
                        item.listingId,
                        item.nftAddress,
                        item.tokenId,
                        item.seller,
                    ].join(" ")
                    const lowerCaseConcatenated = concatenatedFields.toLowerCase()
                    const lowerCaseSearchTerm = searchTerm.toLowerCase()

                    return lowerCaseConcatenated.includes(lowerCaseSearchTerm)
                })
                console.log("Search term:", searchTerm, "Results:", searchResults)

                setSearchResults(searchResults)
            } else {
                console.log("No results found.")
            }

            // Process the results of the second query for inactive elements
            if (!inactiveLoading && !inactiveError && inactiveData && inactiveData.inactiveItems) {
                const inactiveSearchResults = inactiveData.inactiveItems.filter((item) => {
                    const concatenatedFields = [
                        item.listingId,
                        item.nftAddress,
                        item.tokenId,
                        item.seller,
                    ].join(" ")
                    const lowerCaseConcatenated = concatenatedFields.toLowerCase()
                    const lowerCaseSearchTerm = searchTerm.toLowerCase()

                    return lowerCaseConcatenated.includes(lowerCaseSearchTerm)
                })
                console.log("Inactive Search term:", searchTerm, "Results:", inactiveSearchResults)

                setInactiveSearchResults(inactiveSearchResults)
            } else {
                console.log("No inactive results found.")
            }
        } catch (error) {
            console.error("Error fetching data:", error.message)
            console.error("Error fetching data:", error)
        }
    }

    const navigateToSearchResultPage = () => {
        router.push({
            pathname: "/SearchResultPage",
            query: {
                search: searchTerm,
                searchResults: JSON.stringify(searchResults),
                inactiveSearchResults: JSON.stringify(inactiveSearchResults), // Add the results of the second query
            },
        })
    }

    const handleKeyPress = (event) => {
        if (event.key === "Enter") {
            handleSearch()
            navigateToSearchResultPage(searchTerm)
        }
    }

    const handleOnClick = () => {
        handleSearch()
        navigateToSearchResultPage(searchTerm)
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
