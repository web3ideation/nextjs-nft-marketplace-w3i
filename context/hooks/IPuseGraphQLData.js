// React Hook für die Verwendung von Apollo Client mit GraphQL-Abfragen.
import { useQuery } from "@apollo/client"

// ------------------ GraphQL Queries ------------------
// Importieren von GraphQL-Abfragen für aktive und inaktive Items.
import { GET_ACTIVE_ITEMS, GET_INACTIVE_ITEMS } from "../../constants/subgraphQueries"

/**
 * Custom Hook for fetching and organizing data from GraphQL queries.
 */
export const useGraphQLData = () => {
    // Abfragen für aktive Items mit Apollo Client.
    const {
        data: activeItemsData,
        loading: loadingActive,
        error: errorActive,
        refetch: refetchActiveItems,
    } = useQuery(GET_ACTIVE_ITEMS)

    // Abfragen für inaktive Items mit Apollo Client.
    const {
        data: inactiveItemsData,
        loading: loadingInactive,
        error: errorInactive,
        refetch: refetchInactiveItems,
    } = useQuery(GET_INACTIVE_ITEMS)

    /**
     * Hilfsfunktion zur Ermittlung der Items mit der höchsten ListingID und Buyer Count.
     * @param {Array} activeItems - Liste der aktiven Items.
     * @param {Array} inactiveItems - Liste der inaktiven Items.
     * @return {Object} - Objekt mit gefilterten Listen für aktive und inaktive Items.
     */
    const getHighestListingItemsWithBuyerCount = (activeItems, inactiveItems) => {
        const combinedItems = [...activeItems, ...inactiveItems]
        const highestListingMap = new Map()

        combinedItems.forEach((item) => {
            const key = `${item.nftAddress}-${item.tokenId}`
            const existingItem = highestListingMap.get(key)

            if (!existingItem) {
                highestListingMap.set(key, {
                    ...item,
                    highestListingId: item.listingId,
                    buyerCount: item.buyer ? 1 : 0,
                })
            } else {
                if (Number(item.listingId) > Number(existingItem.highestListingId)) {
                    highestListingMap.set(key, {
                        ...item,
                        highestListingId: item.listingId,
                        buyerCount: existingItem.buyerCount + (item.buyer ? 1 : 0),
                    })
                } else if (item.buyer) {
                    highestListingMap.set(key, {
                        ...existingItem,
                        buyerCount: existingItem.buyerCount + 1,
                    })
                }
            }
        })
        // Trennen der aktiven und inaktiven Items nach der Verarbeitung
        const filteredActiveItems = []
        const filteredInactiveItems = []

        highestListingMap.forEach((value, key) => {
            if (activeItems.some((item) => `${item.nftAddress}-${item.tokenId}` === key)) {
                filteredActiveItems.push(value)
            } else {
                filteredInactiveItems.push(value)
            }
        })

        return {
            active: filteredActiveItems,
            inactive: filteredInactiveItems,
        }
    }

    /**
     * Funktion zum Neuladen beider GraphQL Queries.
     */
    const refetchNFTQueryData = async () => {
        await Promise.all([refetchActiveItems(), refetchInactiveItems()])
    }

    // Datenverarbeitung für aktive und inaktive Items.
    const { active, inactive } = getHighestListingItemsWithBuyerCount(
        activeItemsData ? activeItemsData.items : [],
        inactiveItemsData ? inactiveItemsData.items : []
    )

    // Rückgabe der verarbeiteten Daten und Zustände.
    return {
        activeItems: active,
        inactiveItems: inactive,
        isLoading: loadingActive || loadingInactive,
        isError: errorActive || errorInactive,
        refetchNFTQueryData,
    }
}
