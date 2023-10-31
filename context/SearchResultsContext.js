import React, { createContext, useContext, useState } from "react"

// Create a context for search results
const SearchResultsContext = createContext()

// Custom hook to use the SearchResultsContext
export const useSearchResults = () => {
    const context = useContext(SearchResultsContext)

    // Throw an error if the context is not wrapped with a provider
    if (!context) {
        throw new Error("useSearchResults must be used within a SearchResultsProvider")
    }

    return context
}

export const SearchResultsProvider = ({ children }) => {
    // State for active search results
    const [activeSearchResults, setActiveSearchResults] = useState([])

    // State for inactive search results
    const [inactiveSearchResults, setInactiveSearchResults] = useState([])

    return (
        // Provide the search results states and their setters to children components
        <SearchResultsContext.Provider
            value={{
                activeSearchResults,
                setActiveSearchResults,
                inactiveSearchResults,
                setInactiveSearchResults,
            }}
        >
            {children}
        </SearchResultsContext.Provider>
    )
}
