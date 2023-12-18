import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { ethers } from "ethers"
import { useQuery } from "@apollo/client"
import { GET_ACTIVE_ITEMS, GET_INACTIVE_ITEMS } from "../constants/subgraphQueries"
import { erc721ABI } from "wagmi"

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

    console.log("Active Data", activeItemsData)
    console.log("Inactive Data", inactiveItemsData)
    console.log("Nfts Data", nftsData)
    console.log("Nft Collections", nftCollections)
    // console.log("loaded all attributes", loadingAllAttributes)
    // console.log("Is Loaded Context", isLoading)

    // Function to get Ethereum object from the window.
    const getEthereumObject = () => window.ethereum

    // Function to fetch NFT information.
    async function getNFTInfo(nftAddress, tokenId) {
        const ethereum = getEthereumObject()
        const provider = new ethers.providers.Web3Provider(ethereum)
        try {
            // Verwenden Sie erc721ABI von wagmi
            const contract = new ethers.Contract(nftAddress, erc721ABI, provider)
            console.log("Contract", contract)

            // Konvertieren Sie die tokenId in eine BigNumber
            const tokenIdBigNumber = ethers.BigNumber.from(tokenId)

            const tokenOwner = await contract.ownerOf(tokenIdBigNumber)
            const tokenURI = await contract.tokenURI(tokenIdBigNumber)
            const tokenName = await contract.name()
            const tokenSymbol = await contract.symbol()

            const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")

            const response = await fetch(requestURL)
            if (response.headers.get("content-type").includes("application/json")) {
                const tokenURIData = await response.json()
                console.log("TOKEN URI DATA", tokenURIData)
                return {
                    ...tokenURIData.attributes,
                    ...tokenURIData, // Enthält Metadaten wie Name, Beschreibung, Bild-URLs usw.
                    tokenName,
                    tokenOwner,
                    tokenSymbol,
                    tokenURI,
                }
            } else {
                // Hier können Sie z.B. einen Default-Wert zurückgeben oder die URL direkt nutzen
                console.log("Response is not a JSON. URL points to:", requestURL)
                return {
                    image: requestURL, // Verwenden Sie die URL direkt als Bild-URL
                    tokenName,
                    tokenOwner,
                    tokenSymbol,
                    tokenURI,
                    // Andere erforderliche Standardwerte
                }
            }
        } catch (error) {
            console.error("Error fetching NFT info:", error)
            throw error
        }
    }

    // Callback to load attributes for an NFT.
    const loadAttributes = useCallback(async (nft) => {
        try {
            const nftInfo = await getNFTInfo(nft.nftAddress, nft.tokenId)
            //if (nftInfo === null) {
            //    return null
            //}

            return nftInfo
                ? {
                      ...nft,
                      ...nftInfo,
                      imageURI: {
                          src: nftInfo.image.replace("ipfs://", "https://ipfs.io/ipfs/"),
                          width: 0,
                          height: 0,
                          alt: "",
                      },
                  }
                : null
        } catch (error) {
            console.error("Error loading attributes for NFT:", nft, error)
            return null
        }
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
                tokenName,
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
                    collectionName: tokenName,
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
        const loadAllAttributes = async (items) => {
            const loadedItems = await Promise.all(items.map(loadAttributes))
            return loadedItems.filter((item) => item !== null) // Filtern Sie NFTs heraus, die null sind
        }
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
