// React Imports
import React, { createContext, useContext, useState, useEffect, useCallback } from "react"

// External Library Imports
// Ethereum blockchain interaction library.
import { ethers } from "ethers"
import { erc721ABI } from "wagmi"

// Apollo Client for GraphQL queries.
import { useQuery } from "@apollo/client"

// GraphQL Queries
// Importing GraphQL query for active items.
import { GET_ACTIVE_ITEMS } from "@constants/subgraphQueries"

// Context Creation
// Creating a React context for NFT data management.
const NFTContext = createContext({})

// Custom Hooks creation
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
    })

    // Custom hook for Apollo Client GraphQL query.
    const {
        data: activeItemsData,
        loading: activeLoading,
        error: activeError,
        refetch: refetchActiveItems,
    } = useQuery(GET_ACTIVE_ITEMS)

    console.log("Nfts Data", nftState.data)

    // Helper function for updating NFT state.
    const updateNftState = useCallback((newState) => {
        setNftState((prevState) => ({ ...prevState, ...newState }))
    }, [])

    // Function to reload NFT data.
    const reloadNFTs = useCallback(async () => {
        try {
            updateNftState({ isLoading: true })
            await refetchActiveItems()
            updateNftState({ isError: false })
        } catch (error) {
            console.error("Error reloading NFT data:", error)
            updateNftState({ isError: true })
        } finally {
            updateNftState({ isLoading: false })
        }
    }, [refetchActiveItems])

    // Function to fetch NFT information.
    const getNFTInfo = useCallback(async (nftAddress, tokenId) => {
        let provider

        // Check if window.ethereum is available(wallet)
        if (window.ethereum) {
            // console.log("Using wallet provider")
            provider = new ethers.providers.Web3Provider(window.ethereum)
        } else {
            // Using the Infura provider if no wallet is available
            // console.log("Using Infura provider")
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
                    attributes: tokenURIData.attributes || "",
                    tokenDescription: tokenURIData.description || "",
                    tokenExternalLink: tokenURIData.external_url || "",
                    tokenName: tokenURIData.name,
                    tokenOwner,
                    collectionName,
                    tokenSymbol,
                    tokenURI,
                    imageURI: tokenURIData.image.replace("ipfs://", "https://ipfs.io/ipfs/"),
                }
            } else {
                // Additional code for fetching and handling tokenURI data...
                return {
                    imageURI: { src: requestURL },
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
        return { ...nft, ...nftInfo }
    }, [])

    // Effect to load images and attributes for all NFTs when data changes.
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
    }, [activeItemsData, loadAttributes])

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

    // Effect to update collections when NFT data changes.
    useEffect(() => {
        const collections = createCollections(nftState.data)
        updateNftState({ collections })
    }, [nftState.data, createCollections])

    // Effect to check and set loading status.
    useEffect(() => {
        updateNftState({ isLoading: activeLoading })
    }, [activeLoading])

    // Effect to check and set error status.
    useEffect(() => {
        if (activeError) {
            updateNftState({ isError: true })
        }
    }, [activeError])

    // Context provider for NFT data and state.
    return (
        <NFTContext.Provider value={{ ...nftState, reloadNFTs }}>{children}</NFTContext.Provider>
    )
}
