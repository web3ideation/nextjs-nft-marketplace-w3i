import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import { ethers } from "ethers"
import { useQuery } from "@apollo/client"
import { GET_ACTIVE_ITEMS } from "@constants"
import { loadAttributes, createCollections } from "@api/nftUtils"

const NftContext = createContext({})

export const useNFT = () => useContext(NftContext)

export const NftProvider = ({ children }) => {
    const [nftState, setNftState] = useState({
        data: [],
        collections: [],
        isLoading: true,
        isError: false,
    })

    const [provider, setProvider] = useState(null)

    useEffect(() => {
        if (typeof window === "undefined") return

        const ethProvider = window.ethereum
            ? new ethers.providers.Web3Provider(window.ethereum)
            : new ethers.providers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com")

        setProvider(ethProvider)
    }, [])

    const updateNftState = useCallback(
        (newState) => setNftState((prevState) => ({ ...prevState, ...newState })),
        []
    )

    const loadAllAttributes = useCallback(
        async (items, batchSize = 10) => {
            const loadedItems = []
            try {
                for (let i = 0; i < items.length; i += batchSize) {
                    const batch = items.slice(i, i + batchSize)
                    const batchResults = await Promise.all(
                        batch.map((item) => loadAttributes(provider, item))
                    )
                    const validItems = batchResults.filter((item) => item !== null)
                    loadedItems.push(...validItems)
                }
                updateNftState((prevState) => ({
                    ...prevState,
                    data: [...prevState.data, ...loadedItems],
                }))
                console.log("Loaded items:", loadedItems)
            } catch (error) {
                console.error("Error loading attributes:", error)
                updateNftState({ isError: true })
            }
            return loadedItems
        },
        [provider, updateNftState]
    )

    const {
        loading: activeLoading,
        error: activeError,
        refetch: refetchActiveItems,
    } = useQuery(GET_ACTIVE_ITEMS, {
        skip: !provider || nftState.isError,
        onCompleted: async (data) => {
            if (data && data.items.length > 0) {
                try {
                    const loadedData = await loadAllAttributes(data.items)
                    updateNftState({ data: loadedData, isLoading: false })
                    console.log("Loaded NFT data:", loadedData)
                } catch (error) {
                    updateNftState({ isError: true, isLoading: false })
                }
            }
        },
        onError: () => updateNftState({ isError: true, isLoading: false }),
    })

    useEffect(() => {
        if (activeLoading) {
            updateNftState({ isLoading: true, isError: false })
        } else if (activeError) {
            updateNftState({ isError: true, isLoading: false })
        }
    }, [activeLoading, activeError, updateNftState])

    const collections = useMemo(() => createCollections(nftState.data), [nftState.data.length])

    useEffect(() => {
        updateNftState({ collections })
    }, [collections])

    const reloadNFTs = useCallback(async () => {
        if (!provider) return

        try {
            updateNftState({ isLoading: true }) // Setze den Ladezustand explizit
            const { data, error } = await refetchActiveItems()

            if (error) {
                console.error("Error fetching active items:", error)
                updateNftState({ isError: true, isLoading: false })
                return
            }

            // Wenn Daten vorhanden sind, lade die Attribute erneut
            if (data && data.items.length > 0) {
                const loadedData = await loadAllAttributes(data.items)
                updateNftState({ data: loadedData, isError: false, isLoading: false })
            }
        } catch (error) {
            console.error("Error reloading NFT data:", error)
            updateNftState({ isError: true, isLoading: false })
        }
    }, [provider, updateNftState, refetchActiveItems, loadAllAttributes])

    return (
        <NftContext.Provider value={{ ...nftState, reloadNFTs }}>{children}</NftContext.Provider>
    )
}
