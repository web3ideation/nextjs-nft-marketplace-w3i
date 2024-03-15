// React Imports
import { useCallback, useState, useEffect } from "react"

// External Library Imports
import { ethers } from "ethers" // Provides functionalities for interacting with Ethereum blockchain
import { erc721ABI } from "wagmi" // ERC-721 ABI for interacting with NFT contracts

/**
 * Custom React hook to fetch and manage NFT metadata.
 * This hook is responsible for fetching the metadata for each NFT in the provided array,
 * handling Ethereum provider and Infura fallback for blockchain interactions.
 *
 * @param {Array} nfts - Array of NFT objects to fetch metadata for.
 * @returns {Object} - An object containing the metadata array, loading state, error state, and a refetch function.
 */
export const useMetadata = (nfts) => {
    // State for storing NFT metadata
    const [metadata, setMetadata] = useState([])

    // State to track loading status
    const [isLoadingMetadata, setIsLoadingMetadata] = useState(false)

    // State to track error status
    const [isErrorMetadata, setIsErrorMetadata] = useState(false)

    /**
     * Fetches metadata for each NFT using ethers.js.
     * It checks for an Ethereum browser context and falls back to Infura RPC when necessary.
     * The function updates the state with the fetched metadata or an error.
     */
    const fetchMetadata = useCallback(async () => {
        setIsLoadingMetadata(true)
        setIsErrorMetadata(false)
        const updatedMetadata = []

        for (const nft of nfts) {
            let provider

            // Using Ethereum browser context if available
            if (window.ethereum) {
                provider = new ethers.providers.Web3Provider(window.ethereum)
            } else {
                // Fallback to Infura RPC when Ethereum provider is not available
                const infuraUrl = "https://sepolia.infura.io/v3/2c8fdbbe1b46451fa44c97b461ccb3c5"
                provider = new ethers.providers.JsonRpcProvider(infuraUrl)
            }

            const contract = new ethers.Contract(nft.nftAddress, erc721ABI, provider)
            const tokenIdBigNumber = ethers.BigNumber.from(nft.tokenId)

            try {
                const [tokenURI, tokenOwner, collectionName, tokenSymbol] = await Promise.all([
                    contract.tokenURI(tokenIdBigNumber),
                    contract.ownerOf(tokenIdBigNumber),
                    contract.name(),
                    contract.symbol(),
                ])
                // Fetch token URI and handle IPFS links

                const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
                const response = await fetch(requestURL)
                const contentType = response.headers.get("content-type")

                // Parse JSON content or store URI directly
                if (contentType && contentType.includes("application/json")) {
                    const tokenURIData = await response.json()
                    updatedMetadata.push({
                        ...nft,
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
                    })
                } else {
                    updatedMetadata.push({
                        ...nft,
                        metadata: { uri: requestURL },
                        tokenOwner,
                        collectionName,
                        tokenSymbol,
                        imageURI: { src: requestURL, width: 0, height: 0, alt: "" },
                    })
                }
            } catch (error) {
                console.error("Error fetching NFT metadata:", error)
                setIsErrorMetadata(true)
            }
        }

        setMetadata(updatedMetadata)
        setIsLoadingMetadata(false)
    }, [nfts])

    // Effect to trigger metadata fetch on NFTs array change
    useEffect(() => {
        if (nfts && nfts.length > 0) {
            fetchMetadata()
        }
    }, [fetchMetadata, nfts])

    return { metadata, isLoadingMetadata, isErrorMetadata, refetch: fetchMetadata }
}
