import React, { useState } from "react"
import styles from "../styles/Home.module.css"
import { Button } from "web3uikit"
import { useRouter } from "next/router"
import { GET_ACTIVE_ITEMS, GET_INACTIVE_ITEMS } from "../constants/subgraphQueries"
import { useQuery } from "@apollo/client"
import { useSearchResults } from "../components/SearchResultsContext"

const SearchBar = () => {
    const router = useRouter()

    const [searchTerm, setSearchTerm] = useState("")

    const {
        activeSearchResults,
        setActiveSearchResults,
        inactiveSearchResults,
        setInactiveSearchResults,
    } = useSearchResults()

    const {
        loading: activeLoading,
        error: activeError,
        data: activeData,
    } = useQuery(GET_ACTIVE_ITEMS, {
        variables: { searchTerm: searchTerm },
    })

    // second query for inactive elements
    const {
        loading: inactiveLoading,
        error: inactiveError,
        data: inactiveData,
        refetch: refetchInactiveItems,
    } = useQuery(GET_INACTIVE_ITEMS, {
        variables: { searchTerm: searchTerm },
    })

    const handleSearch = async () => {
        try {
            if ((activeLoading && inactiveLoading) || (activeError && inactiveError)) {
                console.log("Data is loading or there's an error.")
                return
            }
            if (!activeLoading && !activeError && activeData && activeData.items) {
                const filteredActiveResults = activeData.items.filter((item) => {
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
                console.log("Search term:", searchTerm, "Results:", activeSearchResults)

                setActiveSearchResults(filteredActiveResults)
            } else {
                console.log("No results found.")
            }

            // Process the results of the second query for inactive elements
            if (!inactiveLoading && !inactiveError && inactiveData && inactiveData.items) {
                const filteredInactiveResults = inactiveData.items.filter((item) => {
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

                setInactiveSearchResults(filteredInactiveResults)
            } else {
                console.log("No inactive results found.")
            }

            await refetchInactiveItems()
        } catch (error) {
            console.error("Error fetching data:", error.message)
            console.error("Error fetching data:", error)
        }
        router.push({
            pathname: "/search-result-page",
            query: {
                search: searchTerm,
            },
        })
    }

    const handleKeyPress = (event) => {
        if (event.key === "Enter") {
            const termToSearch = searchTerm || ""
            handleSearch(termToSearch)
        }
    }

    const handleOnClick = () => {
        const termToSearch = searchTerm || ""
        handleSearch(termToSearch)
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
