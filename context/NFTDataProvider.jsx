// ------------------ React Imports ------------------
import React, { createContext, useContext, useState, useEffect, useCallback } from "react"

// ------------------ External Library Imports ------------------
// Ethereum blockchain interaction library.
import { ethers } from "ethers"
import { erc721ABI } from "wagmi"

// Apollo Client for GraphQL queries.
import { useQuery } from "@apollo/client"

// ------------------ GraphQL Queries ------------------
// Importing GraphQL queries for active and inactive items.
import { GET_ACTIVE_ITEMS, GET_INACTIVE_ITEMS } from "../constants/subgraphQueries"

// ------------------ Context Creation ------------------
// Creating a React context for NFT data management.
const NFTContext = createContext({})

// ------------------ Custom Hooks ------------------
// Hook for accessing NFT context.
export const useNFT = () => useContext(NFTContext)

// ------------------ NFT Provider Component ------------------
export const NFTProvider = ({ children }) => {
    // State hook to manage NFT data and collections.
    const [nftState, setNftState] = useState({
        data: [],
        collections: [],
        isLoading: true,
        isError: false,
        loadingAllAttributes: true,
    })

    // Custom hook for Apollo Client GraphQL queries.
    const {
        data: activeItemsData,
        loading: activeLoading,
        error: activeError,
        refetch: refetchActiveItems,
    } = useQuery(GET_ACTIVE_ITEMS)
    const {
        data: inactiveItemsData,
        loading: inactiveLoading,
        error: inactiveError,
        refetch: refetchInactiveItems,
    } = useQuery(GET_INACTIVE_ITEMS)

    // Helper function for updating NFT state.
    const updateNftState = useCallback((newState) => {
        setNftState((prevState) => ({ ...prevState, ...newState }))
    }, [])

    // Function to reload NFT data.
    const reloadNFTs = useCallback(async () => {
        try {
            updateNftState({ isLoading: true })
            await Promise.all([refetchActiveItems(), refetchInactiveItems()])
            updateNftState({ isError: false })
        } catch (error) {
            console.error("Fehler beim Neuladen der NFT-Daten:", error)
            updateNftState({ isError: true })
        } finally {
            updateNftState({ isLoading: false })
        }
    }, [refetchActiveItems, refetchInactiveItems])

    // console.log("Active Data", activeItemsData)
    // console.log("Inactive Data", inactiveItemsData)
    console.log("Nfts Data", nftState.data)
    // console.log("Nft Collections", nftState.collections)
    // console.log("loaded all attributes", loadingAllAttributes)
    // console.log("Is Loaded Context", isLoading)

    // Function to retrieve the Ethereum object from the window
    //const getEthereumObject = useCallback(() => {
    //    const ethereum = window.ethereum
    //    if (!ethereum) {
    //        console.error("Ethereum object not found")
    //        updateNftState({ isError: true })
    //        return null
    //    }
    //    return ethereum
    //}, [])

    // Function to fetch NFT information.
    const getNFTInfo = useCallback(async (nftAddress, tokenId) => {
        let provider

        // Check if window.ethereum is available(wallet)
        if (window.ethereum) {
            console.log("Using wallet provider")
            provider = new ethers.providers.Web3Provider(window.ethereum)
        } else {
            // Using the Infura provider if no wallet is available
            console.log("Using Infura provider")
            const infuraUrl = "https://sepolia.infura.io/v3/2c8fdbbe1b46451fa44c97b461ccb3c5"
            provider = new ethers.providers.JsonRpcProvider(infuraUrl)
        }

        const contract = new ethers.Contract(nftAddress, erc721ABI, provider)
        const tokenIdBigNumber = ethers.BigNumber.from(tokenId)

        try {
            const [tokenURI, tokenOwner, collectionName, tokenSymbol] = await Promise.all([
                contract.tokenURI(tokenIdBigNumber),
                contract.ownerOf(tokenIdBigNumber),
                contract.name(),
                contract.symbol(),
            ])

            // Fetch tokenURI and other details, then return structured NFT info.
            const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
            const response = await fetch(requestURL)
            const contentType = response.headers.get("content-type")

            if (contentType && contentType.includes("application/json")) {
                const tokenURIData = await response.json()
                return {
                    attributes: tokenURIData.attributes,
                    tokenDescription: tokenURIData.description,
                    tokenExternalLink: tokenURIData.external_url,
                    tokenName: tokenURIData.name,
                    tokenOwner,
                    collectionName,
                    tokenSymbol,
                    tokenURI,
                    imageURI: {
                        src: tokenURIData.image.replace("ipfs://", "https://ipfs.io/ipfs/"),
                        width: 0,
                        height: 0,
                        alt: "",
                    },
                }
            } else {
                // Additional code for fetching and handling tokenURI data...
                return {
                    imageURI: { src: requestURL, width: 0, height: 0, alt: "" },
                    tokenOwner,
                    collectionName,
                    tokenSymbol,
                    tokenURI,
                }
            }
        } catch (error) {
            console.error("Fehler beim Abrufen von NFT-Infos:", error)
            updateNftState({ isError: true })
            return null
        }
    }, [])

    // Callback to generate attributes for an NFT.
    const loadAttributes = useCallback(async (nft) => {
        const nftInfo = await getNFTInfo(nft.nftAddress, nft.tokenId)
        return nftInfo ? { ...nft, ...nftInfo } : null
    }, [])

    // Callback to get the highest listing ID and buyer count for each NFT.
    const getHighestListingIdPerNFT = useCallback((arr) => {
        const map = new Map()
        arr.forEach((item) => {
            const key = `${item.nftAddress}-${item.tokenId}`
            const existingItem = map.get(key)
            if (!existingItem) {
                map.set(key, {
                    ...item,
                    highestListingId: item.listingId,
                    buyerCount: item.buyer ? 1 : 0,
                })
            } else {
                if (Number(item.listingId) > Number(existingItem.highestListingId)) {
                    map.set(key, {
                        ...item,
                        highestListingId: item.listingId,
                        buyerCount: existingItem.buyerCount + (item.buyer ? 1 : 0),
                    })
                } else if (item.buyer) {
                    map.set(key, {
                        ...existingItem,
                        buyerCount: existingItem.buyerCount + 1,
                    })
                }
            }
        })

        return Array.from(map.values())
    }, [])

    // Callback to create collections from NFT data.
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

    // Effect zum Laden von Bildern und Attributen für alle NFTs, wenn sich die Daten ändern.
    useEffect(() => {
        const loadAllAttributes = async (items) => {
            const loadedItems = await Promise.all(items.map(loadAttributes))
            return loadedItems.filter((item) => item !== null)
        }

        if (activeItemsData && inactiveItemsData) {
            updateNftState({ loadingAllAttributes: true })
            const combinedData = [...activeItemsData.items, ...inactiveItemsData.items]
            const highestListingData = getHighestListingIdPerNFT(combinedData)

            loadAllAttributes(highestListingData)
                .then((loadedData) => {
                    updateNftState({ data: loadedData, loadingAllAttributes: false })
                })
                .catch((error) => {
                    console.error("Fehler beim Laden aller Attribute:", error)
                    updateNftState({ isError: true, loadingAllAttributes: false })
                })
        }
    }, [activeItemsData, inactiveItemsData, loadAttributes, getHighestListingIdPerNFT])

    // Effect to update collections when NFT data changes.
    useEffect(() => {
        const collections = createCollections(nftState.data)
        updateNftState({ collections })
    }, [nftState.data, createCollections])

    // Effect zur Prüfung des Ladestatus.
    useEffect(() => {
        const isDataLoading = activeLoading || inactiveLoading || nftState.loadingAllAttributes
        updateNftState({ isLoading: isDataLoading })
    }, [activeLoading, inactiveLoading, nftState.loadingAllAttributes])

    // Effect zur Überprüfung und Festlegung des Fehlerstatus.
    useEffect(() => {
        if (activeError || inactiveError) {
            updateNftState({ isError: true })
        }
    }, [activeError, inactiveError])

    // Context provider for NFT data and state.
    return (
        <NFTContext.Provider value={{ ...nftState, reloadNFTs }}>{children}</NFTContext.Provider>
    )
}
