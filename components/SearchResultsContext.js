import React, { createContext, useContext, useState } from "react"

const SearchResultsContext = createContext()

export const useSearchResults = () => {
    return useContext(SearchResultsContext)
}

export const SearchResultsProvider = ({ children }) => {
    const [activeSearchResults, setActiveSearchResults] = useState([])
    const [inactiveSearchResults, setInactiveSearchResults] = useState([])

    return (
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
