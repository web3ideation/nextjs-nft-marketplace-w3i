import React, { useState } from "react"
import styles from "../styles/Home.module.css"
import { Button } from "web3uikit"
import { useRouter } from "next/router"
import { GET_ACTIVE_ITEMS, GET_INACTIVE_ITEMS } from "../constants/subgraphQueries"
import { useQuery } from "@apollo/client"

const SearchBar = ({}) => {
    const router = useRouter()
    const [activeSearchResults, setActiveSearchResults] = useState([])
    const [inactiveSearchResults, setInactiveSearchResults] = useState([]) // State for the results of the second querys
    const [searchTerm, setSearchTerm] = useState("")

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
                const activeSearchResults = activeData.items.filter((item) => {
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

                setActiveSearchResults(activeSearchResults)
            } else {
                console.log("No results found.")
            }

            // Process the results of the second query for inactive elements
            if (!inactiveLoading && !inactiveError && inactiveData && inactiveData.items) {
                const inactiveSearchResults = inactiveData.items.filter((item) => {
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

            await refetchInactiveItems()
            await navigateToSearchResultPage()
        } catch (error) {
            console.error("Error fetching data:", error.message)
            console.error("Error fetching data:", error)
        }
    }

    const navigateToSearchResultPage = async () => {
        router.push({
            pathname: "/SearchResultPage",
            query: {
                search: searchTerm,
                activeSearchResults: JSON.stringify(activeSearchResults),
                inactiveSearchResults: JSON.stringify(inactiveSearchResults), // Add the results of the second query
            },
        })
    }

    const handleKeyPress = (event) => {
        if (event.key === "Enter") {
            const termToSearch = searchTerm || ""
            handleSearch(termToSearch)
            navigateToSearchResultPage(termToSearch)
        }
    }

    const handleOnClick = () => {
        const termToSearch = searchTerm || ""
        handleSearch(termToSearch)
        navigateToSearchResultPage(termToSearch)
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
