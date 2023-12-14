import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { ethers } from "ethers"
import { useQuery } from "@apollo/client"
import { GET_ACTIVE_ITEMS, GET_INACTIVE_ITEMS } from "../constants/subgraphQueries"

// Context for managing and accessing NFT data.
const NFTContext = createContext({})

// Custom hook for accessing NFT context in components.
export const useNFT = () => useContext(NFTContext)

export const NFTProvider = ({ children }) => {
    // GraphQL queries to fetch active and inactive NFT items.
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

    // States for NFT data and collections.
    const [nftsData, setNftsData] = useState([])
    const [nftCollections, setNftCollections] = useState([])

    const [loadingAllAttributes, setLoadingAllAttributes] = useState(true)

    const [isLoading, setIsLoading] = useState(true)

    // console.log("Active Data", activeItemsData)
    // console.log("Inactive Data", inactiveItemsData)
    console.log("Nfts Data", nftsData)
    console.log("Nft Collections", nftCollections)
    // console.log("loaded all attributes", loadingAllAttributes)
    // console.log("Is Loaded Context", isLoading)

    const getEthereumObject = () => window.ethereum

    // Fetch the raw token URI from the blockchain using Ethereum provider.
    const getRawTokenURI = useCallback(async (nftAddress, tokenId) => {
        const ethereum = getEthereumObject()
        const provider = new ethers.providers.Web3Provider(ethereum)
        console.log("Provider", provider)
        try {
            const functionSignature = ethers.utils.id("tokenURI(uint256)").slice(0, 10)
            const tokenIdHex = ethers.utils
                .hexZeroPad(ethers.BigNumber.from(tokenId).toHexString(), 32)
                .slice(2)
            const data = functionSignature + tokenIdHex

            const result = await provider.call({ to: nftAddress, data })
            const decodedData = ethers.utils.defaultAbiCoder.decode(["string"], result)
            return decodedData[0]
        } catch (error) {
            console.error("Error fetching raw tokenURI:", error)
            throw error
        }
    }, [])

    const fetchOwnerOf = useCallback(async (nftAddress, tokenId) => {
        const ethereum = getEthereumObject()
        const provider = new ethers.providers.Web3Provider(ethereum)
        const functionSignature = ethers.utils.id("ownerOf(uint256)").slice(0, 10)
        const tokenIdHex = ethers.utils
            .hexZeroPad(ethers.BigNumber.from(tokenId).toHexString(), 32)
            .slice(2)
        const data = functionSignature + tokenIdHex

        try {
            const response = await provider.call({ to: nftAddress, data })
            const decodedResponse = ethers.utils.defaultAbiCoder.decode(["address"], response)
            return decodedResponse[0]
        } catch (error) {
            console.error(`Error fetching owner of tokenId ${tokenId}:`, error)
            throw error
        }
    }, [])

    // Function to fetch contract details (name or symbol) from the blockchain.
    const fetchContractDetail = useCallback(async (nftAddress, detailType) => {
        const ethereum = getEthereumObject()
        const provider = new ethers.providers.Web3Provider(ethereum)
        const functionSignature = ethers.utils.id(`${detailType}()`).slice(0, 10)

        try {
            const response = await provider.call({ to: nftAddress, data: functionSignature })
            const decodedResponse = ethers.utils.defaultAbiCoder.decode(["string"], response)
            return decodedResponse[0]
        } catch (error) {
            console.error(`Error fetching contract ${detailType}:`, error)
            throw error
        }
    }, [])

    // Load image and metadata for a given NFT.
    const loadAttributes = useCallback(
        async (nft) => {
            try {
                const tokenURI = await getRawTokenURI(nft.nftAddress, nft.tokenId)
                console.log("Context token uri", tokenURI)
                const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
                const tokenURIResponse = await fetch(requestURL).then((res) => res.json())

                // Fetching name and symbol of the NFT.
                const nftName = await fetchContractDetail(nft.nftAddress, "name")
                const nftSymbol = await fetchContractDetail(nft.nftAddress, "symbol")
                const nftOwner = await fetchOwnerOf(nft.nftAddress, nft.tokenId, "ownerOf")

                // Processing attributes.
                const attributes = tokenURIResponse.attributes.reduce((acc, attribute) => {
                    acc[attribute.trait_type] = attribute.value
                    return acc
                }, {})

                // Compiling NFT data with loaded attributes.
                return {
                    ...nft,
                    tokenURI,
                    imageURI: {
                        src: tokenURIResponse.image.replace("ipfs://", "https://ipfs.io/ipfs/"),
                        width: 0,
                        height: 0,
                        alt: "",
                    },
                    tokenName: tokenURIResponse.name,
                    tokenDescription: tokenURIResponse.description,
                    nftName,
                    nftSymbol,
                    nftOwner,
                    ...attributes,
                }
            } catch (error) {
                console.error("Error loading image for NFT:", nft, error)
                return { ...nft, error: true }
            }
        },
        [getRawTokenURI, fetchContractDetail]
    )

    // Function to get a buyerCount and the highest listing ID for each NFT.
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

    // Function to create collections from NFT data.
    const createCollections = useCallback((nfts) => {
        const collectionsMap = new Map()

        nfts.forEach((nft) => {
            const { nftAddress, tokenId, imageURI, tokenName, price, nftName, buyerCount } = nft
            const numericPrice = Number(price)

            if (!collectionsMap.has(nftAddress)) {
                collectionsMap.set(nftAddress, {
                    nftAddress,
                    items: [],
                    count: 0,
                    collectionCount: 0,
                    collectionPrice: 0,
                    firstImageURI: imageURI,
                    collectionName: nftName,
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

    // Funktion zum Neuladen der NFT-Daten
    const loadNFTs = useCallback(async () => {
        try {
            // Rufe die refetch-Funktionen für beide Queries auf
            await refetchActiveItems()
            await refetchInactiveItems()
        } catch (error) {
            console.error("Fehler beim Neuladen der NFT-Daten:", error)
        }
    }, [refetchActiveItems, refetchInactiveItems])

    // Effect to load images and attributes for all NFTs when data changes.
    useEffect(() => {
        const loadAllAttributes = async (items) => Promise.all(items.map(loadAttributes))

        if (activeItemsData && inactiveItemsData) {
            setLoadingAllAttributes(true)

            const combinedData = [...activeItemsData.items, ...inactiveItemsData.items]
            // console.log("Combined Data", combinedData)
            const highestListingData = getHighestListingIdPerNFT(combinedData)
            // console.log("Highest Listing Data", highestListingData)
            loadAllAttributes(highestListingData).then((loadedData) => {
                // console.log("Loaded Data", loadedData)
                setNftsData(loadedData)
                setLoadingAllAttributes(false)
            })
        }
    }, [activeItemsData, inactiveItemsData, loadAttributes, getHighestListingIdPerNFT])

    // Effect to update collections when NFT data changes.
    useEffect(() => {
        const collections = createCollections(nftsData)
        setNftCollections(collections)
    }, [nftsData, createCollections])

    useEffect(() => {
        // Setze isLoading auf true, wenn einer der Ladevorgänge aktiv ist
        const isDataLoading = activeLoading || inactiveLoading || loadingAllAttributes
        setIsLoading(isDataLoading)
    }, [activeLoading, inactiveLoading, loadingAllAttributes])

    // Context provider for NFT data and state.
    return (
        <NFTContext.Provider
            value={{
                isLoading,
                nftsData,
                nftCollections,
                loadingAttributes: loadingAllAttributes,
                loadNFTs,
            }}
        >
            {children}
        </NFTContext.Provider>
    )
}
