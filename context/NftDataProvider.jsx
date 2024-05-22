// React Imports
import React, { createContext, useContext, useState, useEffect, useCallback } from "react"

// External Library Imports
import { ethers } from "ethers"
import { erc721ABI } from "wagmi"

// Apollo Client for GraphQL queries.
import { useQuery } from "@apollo/client"

// GraphQL Queries
import { GET_ACTIVE_ITEMS } from "@constants/subgraphQueries"

// Context Creation
const NftContext = createContext({})

// Custom Hooks creation
export const useNFT = () => useContext(NftContext)

// ------------------ NFT Provider Component ------------------
export const NftProvider = ({ children }) => {
    const [nftState, setNftState] = useState({
        data: [],
        collections: [],
        isLoading: true,
        isError: false,
    })
    const [provider, setProvider] = useState(null)

    // Prüfen ob window definiert ist, bevor window.ethereum verwendet wird
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

    const {
        data: activeItemsData,
        loading: activeLoading,
        error: activeError,
        refetch: refetchActiveItems,
    } = useQuery(GET_ACTIVE_ITEMS, { skip: !provider })
    console.log("Data", activeItemsData)
    const updateNftState = useCallback((newState) => {
        setNftState((prevState) => ({ ...prevState, ...newState }))
    }, [])

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

    const getNFTInfo = useCallback(
        async (nftAddress, tokenId) => {
            if (!provider) return null
            const contract = new ethers.Contract(nftAddress, erc721ABI, provider)
            const tokenIdBigNumber = ethers.BigNumber.from(tokenId)

            try {
                const [tokenURI, tokenOwner, collectionName, tokenSymbol] = await Promise.all([
                    contract.tokenURI(tokenIdBigNumber),
                    contract.ownerOf(tokenIdBigNumber),
                    contract.name(),
                    contract.symbol(),
                ])

                const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
                const response = await fetch(requestURL)
                const contentType = response.headers.get("content-type")

                if (contentType && contentType.includes("application/json")) {
                    const tokenURIData = await response.json()
                    return {
                        ...tokenURIData,
                        tokenOwner,
                        collectionName,
                        tokenSymbol,
                        tokenURI,
                        imageURI: tokenURIData.image.replace("ipfs://", "https://ipfs.io/ipfs/"),
                    }
                } else {
                    return {
                        imageURI: { src: requestURL },
                        tokenOwner,
                        collectionName,
                        tokenSymbol,
                        tokenURI,
                    }
                }
            } catch (error) {
                console.error("Error fetching NFT info:", error)
                updateNftState({ isError: true })
                return null
            }
        },
        [provider, updateNftState]
    )

    const loadAttributes = useCallback(
        async (nft) => {
            const nftInfo = await getNFTInfo(nft.nftAddress, nft.tokenId)
            return { ...nft, ...nftInfo }
        },
        [getNFTInfo]
    )

    useEffect(() => {
        const loadAllAttributes = async (items) => {
            const loadedItems = await Promise.all(items.map(loadAttributes))
            return loadedItems.filter((item) => item !== null)
        }

        if (activeItemsData) {
            updateNftState({ isLoading: true })
            loadAllAttributes(activeItemsData.items)
                .then((loadedData) => {
                    updateNftState({ data: loadedData, isLoading: false })
                    console.log("Loaded Data", loadedData)
                })
                .catch((error) => {
                    console.error("Error loading all attributes:", error)
                    updateNftState({ isError: true, isLoading: false })
                })
        }
    }, [activeItemsData, loadAttributes, updateNftState])

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

    useEffect(() => {
        updateNftState({ isLoading: activeLoading })
    }, [activeLoading, updateNftState])

    useEffect(() => {
        if (activeError) {
            updateNftState({ isError: true })
        }
    }, [activeError, updateNftState])

    return (
        <NftContext.Provider value={{ ...nftState, reloadNFTs }}>{children}</NftContext.Provider>
    )
}