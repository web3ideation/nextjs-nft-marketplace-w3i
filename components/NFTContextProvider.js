import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { ethers } from "ethers"
import { useQuery } from "@apollo/client"
import { GET_ACTIVE_ITEMS, GET_INACTIVE_ITEMS } from "../constants/subgraphQueries"

const NFTContext = createContext()

// Custom hook to use the NFT context
export const useNFT = () => {
    return useContext(NFTContext)
}

export const NFTProvider = ({ children }) => {
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

    console.log("Active Loading:", activeLoading)
    console.log("Active Error:", activeError)
    console.log("Inactive Loading:", inactiveLoading)
    console.log("Inactive Error:", inactiveError)

    const [nftsData, setNftsData] = useState([])
    const [nftCollections, setNftCollections] = useState([])

    const [loadingAllImages, setLoadingAllImages] = useState(true)

    console.log("NFTContext data", nftsData)
    console.log("NFTCollections data", nftCollections)

    // Function to get the raw token URI
    const getRawTokenURI = useCallback(async (nftAddress, tokenId) => {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        try {
            const functionSignature = ethers.utils.id("tokenURI(uint256)").slice(0, 10)
            const tokenIdHex = ethers.utils
                .hexZeroPad(ethers.BigNumber.from(tokenId).toHexString(), 32)
                .slice(2)
            const data = functionSignature + tokenIdHex

            const result = await provider.call({
                to: nftAddress,
                data: data,
            })
            const decodedData = ethers.utils.defaultAbiCoder.decode(["string"], result)
            return decodedData[0]
        } catch (error) {
            console.error("Error fetching raw tokenURI:", error)
            throw error
        }
    }, [])

    // Function to load the image for a given NFT
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
                return {
                    ...nft,
                    error: true,
                }
            }
        },
        [getRawTokenURI]
    )

    // Function to get the highest listing ID for each NFT,
    // means the nft which is the last time listed,
    // !!!W works only with orderBy listingId subgraphQueries
    const getHighestListingIdPerNFT = (arr) => {
        const map = new Map()

        arr.forEach((item) => {
            const key = `${item.nftAddress}-${item.tokenId}`
            const existingItem = map.get(key)

            // Compare the listingId values ​​as numbers
            if (!existingItem || Number(item.listingId) > Number(existingItem.listingId)) {
                map.set(key, item)
            }
        })

        return Array.from(map.values())
    }

    useEffect(() => {
        const loadAllImages = async (items) => {
            return await Promise.all(items.map((nft) => loadImage(nft)))
        }

        if (activeItemsData && inactiveItemsData) {
            setLoadingAllImages(true)

            Promise.all([
                loadAllImages(activeItemsData.items),
                loadAllImages(inactiveItemsData.items),
            ]).then(([activeData, inactiveData]) => {
                const combinedData = [...activeData, ...inactiveData]
                console.log("Combined Data", combinedData)
                const highestListingData = getHighestListingIdPerNFT(combinedData)
                console.log("Highest Listing Data", highestListingData)
                setNftsData(highestListingData)
                setLoadingAllImages(false)
            })
        }
    }, [activeItemsData, inactiveItemsData, loadImage])

    const createCollections = (nfts) => {
        const collectionsMap = new Map()

        nfts.forEach((nft) => {
            const { nftAddress, tokenId, imageURI, tokenName } = nft

            // Wenn die Sammlung noch nicht existiert, erstelle eine neue
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

            // Überprüfe, ob das tokenId bereits in der Sammlung existiert
            if (!collection.items.some((item) => item.tokenId === tokenId)) {
                collection.items.push(nft)
                collection.count += 1
            }
        })

        return Array.from(collectionsMap.values())
    }

    useEffect(() => {
        const collections = createCollections(nftsData)
        setNftCollections(collections)
    }, [nftsData])

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
