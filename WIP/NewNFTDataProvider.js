import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { ethers } from "ethers"
import { useActiveItems } from "./useActiveItems"
import { useNFTMetadata } from "./useNFTMetadata"

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
        if (typeof window !== "undefined") {
            const ethProvider = window.ethereum
                ? new ethers.providers.Web3Provider(window.ethereum)
                : new ethers.providers.JsonRpcProvider(
                      "https://ethereum-sepolia-rpc.publicnode.com"
                  )
            setProvider(ethProvider)
        }
    }, [])

    const updateNftState = useCallback((newState) => {
        setNftState((prevState) => ({ ...prevState, ...newState }))
    }, [])

    const {
        getNFTInfo,
        nftInfo,
        loading: metadataLoading,
        error: metadataError,
    } = useNFTMetadata(provider)

    const loadAttributes = useCallback(
        async (nft) => {
            try {
                const nftInfo = await getNFTInfo(nft.nftAddress, nft.tokenId)
                return { ...nft, ...nftInfo }
            } catch (error) {
                console.error("Error loading attributes for NFT:", error)
                return null
            }
        },
        [getNFTInfo]
    )

    const loadAllAttributes = useCallback(
        async (items, batchSize = 10) => {
            const loadedItems = []
            for (let i = 0; i < items.length; i += batchSize) {
                const batch = items.slice(i, i + batchSize)
                const batchResults = await Promise.all(batch.map(loadAttributes))
                loadedItems.push(...batchResults.filter((item) => item !== null))
                updateNftState((prevState) => ({
                    ...prevState,
                    data: [...prevState.data, ...batchResults.filter((item) => item !== null)],
                }))
            }
            return loadedItems
        },
        [loadAttributes, updateNftState]
    )

    const {
        data: activeItemsData,
        loading: activeLoading,
        error: activeError,
        refetch: refetchActiveItems,
    } = useActiveItems(
        (data) => {
            if (data) {
                updateNftState({ isLoading: true })
                loadAllAttributes(data.items)
                    .then((loadedData) => {
                        updateNftState({ data: loadedData, isLoading: false })
                    })
                    .catch((error) => {
                        console.error("Error loading all attributes:", error)
                        updateNftState({ isError: true, isLoading: false })
                    })
            }
        },
        (error) => {
            console.error("Error fetching active items:", error)
            updateNftState({ isError: true, isLoading: false })
        }
    )

    useEffect(() => {
        if (activeLoading) {
            updateNftState({ isLoading: true })
        } else if (activeError) {
            updateNftState({ isError: true, isLoading: false })
        } else if (activeItemsData) {
            updateNftState({ isLoading: true })
            loadAllAttributes(activeItemsData.items)
                .then((loadedData) => {
                    updateNftState({ data: loadedData, isLoading: false })
                })
                .catch((error) => {
                    console.error("Error loading all attributes:", error)
                    updateNftState({ isError: true, isLoading: false })
                })
        }
    }, [activeItemsData, activeLoading, activeError, loadAllAttributes, updateNftState])

    const reloadNFTs = useCallback(async () => {
        if (!provider) return
        try {
            updateNftState({ isLoading: true })
            await refetchActiveItems()
            updateNftState({ isError: false, isLoading: false })
        } catch (error) {
            console.error("Error reloading NFT data:", error)
            updateNftState({ isError: true, isLoading: false })
        }
    }, [refetchActiveItems, updateNftState, provider])

    const createCollections = useCallback((nfts) => {
        const collectionsMap = new Map()
        nfts.forEach((nft) => {
            const {
                nftAddress,
                tokenId,
                imageURI,
                collectionName,
                price,
                tokenSymbol,
                buyerCount,
            } = nft
            const numericPrice = Number(price)
            if (!collectionsMap.has(nftAddress)) {
                collectionsMap.set(nftAddress, {
                    nftAddress,
                    items: [],
                    count: 0,
                    collectionCount: 0,
                    collectionPrice: 0,
                    firstImageURI: imageURI,
                    collectionName,
                    collectionSymbol: tokenSymbol,
                    tokenIds: [],
                })
            }
            const collection = collectionsMap.get(nftAddress)
            if (!collection.items.some((item) => item.tokenId === tokenId)) {
                collection.items.push(nft)
                collection.count += 1
                collection.tokenIds.push(tokenId)
                collection.collectionCount += buyerCount
                if (!isNaN(numericPrice)) {
                    collection.collectionPrice += numericPrice
                }
            }
        })
        return Array.from(collectionsMap.values()).map((collection) => {
            collection.tokenIds.sort((a, b) => a - b)
            collection.tokenIds = collection.tokenIds.join(",")
            collection.collectionPrice = collection.collectionPrice.toString()
            return collection
        })
    }, [])

    useEffect(() => {
        const collections = createCollections(nftState.data)
        updateNftState({ collections })
    }, [nftState.data, createCollections, updateNftState])

    const fetchIndividualNFT = useCallback(
        async (nftAddress, tokenId) => {
            return await getNFTInfo(nftAddress, tokenId)
        },
        [getNFTInfo]
    )

    return (
        <NftContext.Provider value={{ ...nftState, reloadNFTs, fetchIndividualNFT }}>
            {children}
        </NftContext.Provider>
    )
}
