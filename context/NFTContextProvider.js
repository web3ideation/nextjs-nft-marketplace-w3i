import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { ethers } from "ethers"
import { useQuery } from "@apollo/client"
import { GET_ACTIVE_ITEMS, GET_INACTIVE_ITEMS } from "../constants/subgraphQueries"

// Creating a context for NFT data
const NFTContext = createContext()

// Custom hook to access NFT context
export const useNFT = () => useContext(NFTContext)

export const NFTProvider = ({ children }) => {
    // Fetching active and inactive NFT items using GraphQL queries
    const {
        data: activeItemsData,
        loading: activeLoading,
        error: activeError,
    } = useQuery(GET_ACTIVE_ITEMS)
    const {
        data: inactiveItemsData,
        loading: inactiveLoading,
        error: inactiveError,
    } = useQuery(GET_INACTIVE_ITEMS)

    // State to store NFT data and collections
    const [nftsData, setNftsData] = useState([])
    const [nftCollections, setNftCollections] = useState([])
    const [loadingAllAttributes, setLoadingAllAttributes] = useState(true)

    console.log("Active Data", activeItemsData)
    console.log("Inactive Data", inactiveItemsData)
    console.log("Nfts Data", nftsData)
    console.log("Nft Collection", nftCollections)

    // Function to retrieve the raw token URI from the blockchain
    const getRawTokenURI = useCallback(async (nftAddress, tokenId) => {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
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

    // Using useCallback for useRawName and useRawSymbol to prevent unnecessary re-creations
    const useRawName = useCallback((nftAddress) => {
        const provider = new ethers.providers.Web3Provider(window.ethereum)

        return async () => {
            const functionSignature = ethers.utils.id("name()").slice(0, 10)
            const signer = provider.getSigner()
            const response = await signer.call({ to: nftAddress, data: functionSignature })

            // Decoding the response
            const decodedResponse = ethers.utils.defaultAbiCoder.decode(["string"], response)
            return decodedResponse[0]
        }
    }, [])

    const useRawSymbol = useCallback((nftAddress) => {
        const provider = new ethers.providers.Web3Provider(window.ethereum)

        return async () => {
            const functionSignature = ethers.utils.id("symbol()").slice(0, 10)
            const signer = provider.getSigner()
            const response = await signer.call({ to: nftAddress, data: functionSignature })

            // Decoding the response
            const decodedResponse = ethers.utils.defaultAbiCoder.decode(["string"], response)
            return decodedResponse[0]
        }
    }, [])

    // Function to load image metadata for a given NFT
    const loadAttributes = useCallback(
        async (nft) => {
            try {
                const tokenURI = await getRawTokenURI(nft.nftAddress, nft.tokenId)
                const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
                const tokenURIResponse = await fetch(requestURL).then((res) => res.json())

                // Retrieving name and symbol using useRawName and useRawSymbol
                const nftName = await useRawName(nft.nftAddress)()
                const nftSymbol = await useRawSymbol(nft.nftAddress)()

                // Extracting attributes
                const attributes = tokenURIResponse.attributes.reduce((acc, attribute) => {
                    acc[attribute.trait_type] = attribute.value
                    return acc
                }, {})

                // Returning attributes along with imageURI, tokenName, and tokenDescription
                return {
                    ...nft,
                    imageURI: {
                        src: tokenURIResponse.image.replace("ipfs://", "https://ipfs.io/ipfs/"),
                        width: 0,
                        height: 0,
                    },
                    tokenName: tokenURIResponse.name,
                    tokenDescription: tokenURIResponse.description,
                    nftName,
                    nftSymbol,
                    ...attributes,
                }
            } catch (error) {
                console.error("Error loading image for NFT:", nft, error)
                return { ...nft, error: true }
            }
        },
        [getRawTokenURI, useRawName, useRawSymbol]
    )

    // Function to get the highest listing ID for each NFT
    const getHighestListingIdPerNFT = useCallback((arr) => {
        const map = new Map()

        arr.forEach((item) => {
            const key = `${item.nftAddress}-${item.tokenId}`
            let existingItem = map.get(key)

            if (!existingItem) {
                existingItem = {
                    ...item,
                    highestListingId: item.listingId,
                    buyerCount: item.buyer ? 1 : 0,
                }
                map.set(key, existingItem)
            } else {
                if (item.buyer && Number(item.listingId) < Number(existingItem.highestListingId)) {
                    existingItem.buyerCount += 1
                }
                if (Number(item.listingId) > Number(existingItem.highestListingId)) {
                    existingItem.highestListingId = item.listingId
                }
            }
        })

        return Array.from(map.values())
    }, [])

    // Load images for all NFTs when active or inactive data changes
    useEffect(() => {
        const loadAllAttributes = async (items) => Promise.all(items.map(loadAttributes))

        if (activeItemsData && inactiveItemsData) {
            setLoadingAllAttributes(true)

            Promise.all([
                loadAllAttributes(activeItemsData.items),
                loadAllAttributes(inactiveItemsData.items),
            ]).then(([activeData, inactiveData]) => {
                const combinedData = [...activeData, ...inactiveData]
                const highestListingData = getHighestListingIdPerNFT(combinedData)
                setNftsData(highestListingData)
                setLoadingAllAttributes(false)
            })
        }
    }, [activeItemsData, inactiveItemsData, loadAttributes])

    // Creating collections from NFT data
    const createCollections = useCallback((nfts) => {
        const collectionsMap = new Map()

        nfts.forEach((nft) => {
            const { nftAddress, tokenId, imageURI, tokenName, price, nftName } = nft
            const numericPrice = Number(price)

            if (!collectionsMap.has(nftAddress)) {
                collectionsMap.set(nftAddress, {
                    nftAddress,
                    items: [],
                    count: 0,
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

    // Update collections when NFT data changes
    useEffect(() => {
        const collections = createCollections(nftsData)
        setNftCollections(collections)
    }, [nftsData, createCollections])

    // Providing NFT data and state through context
    return (
        <NFTContext.Provider
            value={{ nftsData, nftCollections, loadingAttributes: loadingAllAttributes }}
        >
            {children}
        </NFTContext.Provider>
    )
}
