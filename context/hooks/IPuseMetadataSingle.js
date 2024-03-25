// React imports
import { useCallback, useState, useEffect } from "react"

// External libraries imports
import { ethers } from "ethers"

// Custom hooks and components imports
import { erc721ABI } from "wagmi" // Ensure the import path matches your project structure

/**
 * Custom hook for fetching and managing single NFT metadata.
 *
 * @param {string} nftAddress - Ethereum address of the NFT contract.
 * @param {string} tokenId - Token ID of the NFT.
 * @returns {Object} - Contains NFT metadata, loading and error states, and a function to refetch metadata.
 */
export const useSingleNFTMetadata = (nftAddress, tokenId) => {
    // State for storing NFT metadata and tracking loading/error status
    const [nftMetadata, setNFTMetadata] = useState(null)
    const [isLoadingNFTMetadata, setIsLoadingNFTMetadata] = useState(false)
    const [isErrorNFTMetadata, setIsErrorNFTMetadata] = useState(false)

    // Fetch NFT metadata using useCallback for memoization
    const fetchNFTMetadata = useCallback(async () => {
        setIsLoadingNFTMetadata(true)
        setIsErrorNFTMetadata(false)

        // Ethereum provider detection and setup
        let provider = window.ethereum
            ? new ethers.providers.Web3Provider(window.ethereum)
            : new ethers.providers.JsonRpcProvider(
                  "https://sepolia.infura.io/v3/2c8fdbbe1b46451fa44c97b461ccb3c5"
              ) // Using Infura as a fallback

        // Contract instance creation using ethers
        const contract = new ethers.Contract(nftAddress, erc721ABI, provider)
        const tokenIdBigNumber = ethers.BigNumber.from(tokenId)

        try {
            // Retrieve token URI and process the response
            const tokenURI = await contract.tokenURI(tokenIdBigNumber)
            const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
            const response = await fetch(requestURL)
            const contentType = response.headers.get("content-type")

            // Parse response based on content type
            if (contentType && contentType.includes("application/json")) {
                const tokenURIData = await response.json()
                setNFTMetadata(tokenURIData)
            } else {
                setNFTMetadata({ uri: requestURL })
            }
        } catch (error) {
            console.error("Error fetching NFT metadata:", error)
            setIsErrorNFTMetadata(true)
        }

        setIsLoadingNFTMetadata(false)
    }, [nftAddress, tokenId])

    // useEffect to initiate metadata fetch on mount
    useEffect(() => {
        fetchNFTMetadata()
    }, [fetchNFTMetadata])

    return {
        nftMetadata,
        isLoadingNFTMetadata,
        isErrorNFTMetadata,
        refetchNFTMetadata: fetchNFTMetadata,
    }
}
