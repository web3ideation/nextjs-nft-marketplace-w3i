import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { ethers } from "ethers"
import { useQuery } from "@apollo/client"
import { GET_ACTIVE_ITEMS, GET_INACTIVE_ITEMS } from "../constants/subgraphQueries"

// Create a context for the NFT data
const NFTContext = createContext()

// Custom hook to use the NFT context
export const useNFT = () => useContext(NFTContext)

export const NFTProvider = ({ children }) => {
    // Fetch active and inactive NFT items using GraphQL queries
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

    // State for storing NFT data and collections
    const [nftsData, setNftsData] = useState([])
    const [nftCollections, setNftCollections] = useState([])
    const [loadingAllImages, setLoadingAllImages] = useState(true)

    console.log("Nfts Data", nftsData)
    console.log("Nft Collection", nftCollections)

    // Function to get the raw token URI from the blockchain
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

    // Function to load the image metadata for a given NFT
    const loadImage = useCallback(
        async (nft) => {
            try {
                const tokenURI = await getRawTokenURI(nft.nftAddress, nft.tokenId)
                const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
                const tokenURIResponse = await fetch(requestURL).then((res) => res.json())
                const imageURI = tokenURIResponse.image
                const imageURIURL = imageURI.replace("ipfs://", "https://ipfs.io/ipfs/")
                return {
                    ...nft,
                    imageURI: { src: imageURIURL, width: 100 },
                    tokenName: tokenURIResponse.name,
                    tokenDescription: tokenURIResponse.description,
                }
            } catch (error) {
                console.error("Error loading image for NFT:", nft, error)
                return { ...nft, error: true }
            }
        },
        [getRawTokenURI]
    )

    // Function to get the highest listing ID for each NFT
    const getHighestListingIdPerNFT = (arr) => {
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
    }

    // Load images for all NFTs when active or inactive data changes
    useEffect(() => {
        const loadAllImages = async (items) => Promise.all(items.map(loadImage))

        if (activeItemsData && inactiveItemsData) {
            setLoadingAllImages(true)

            Promise.all([
                loadAllImages(activeItemsData.items),
                loadAllImages(inactiveItemsData.items),
            ]).then(([activeData, inactiveData]) => {
                const combinedData = [...activeData, ...inactiveData]
                const highestListingData = getHighestListingIdPerNFT(combinedData)
                setNftsData(highestListingData)
                setLoadingAllImages(false)
            })
        }
    }, [activeItemsData, inactiveItemsData, loadImage])

    // Create collections from NFT data
    const createCollections = (nfts) => {
        const collectionsMap = new Map()

        nfts.forEach((nft) => {
            const { nftAddress, tokenId, imageURI, tokenName } = nft

            if (!collectionsMap.has(nftAddress)) {
                collectionsMap.set(nftAddress, {
                    nftAddress,
                    items: [],
                    count: 0,
                    firstImageURI: imageURI,
                    firstTokenName: tokenName,
                })
            }

            const collection = collectionsMap.get(nftAddress)
            if (!collection.items.some((item) => item.tokenId === tokenId)) {
                collection.items.push(nft)
                collection.count += 1
            }
        })

        return Array.from(collectionsMap.values())
    }

    // Update collections when NFT data changes
    useEffect(() => {
        const collections = createCollections(nftsData)
        setNftCollections(collections)
    }, [nftsData])

    // Provide the NFT data and state through context
    return (
        <NFTContext.Provider
            value={{
                nftsData,
                nftCollections,
                loadingImage: loadingAllImages,
            }}
        >
            {children}
        </NFTContext.Provider>
    )
}
