import { useState, useEffect } from "react"
import { fetchNFTByAddressAndTokenId } from "@api/fetchNFTByAddressAndTokenId" // Importiere deine fetch-Funktion

/**
 * Custom hook to fetch a specific NFT's data based on its contract address and token ID.
 *
 * @param {string} nftAddress - The contract address of the NFT.
 * @param {string} tokenId - The token ID of the NFT.
 * @returns {object} { nftData, isLoading, error }
 */
const useSingleNFTData = (nftAddress, tokenId) => {
    const [nftData, setNftData] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!nftAddress || !tokenId) return

        const fetchNftData = async () => {
            setIsLoading(true)
            setError(null)
            try {
                const data = await fetchNFTByAddressAndTokenId(nftAddress, tokenId)
                setNftData(data)
            } catch (error) {
                setError(error.message || "An error occurred while fetching NFT data")
            } finally {
                setIsLoading(false)
            }
        }

        fetchNftData()
    }, [nftAddress, tokenId])

    return { nftData, isLoading, error }
}

export default useSingleNFTData
