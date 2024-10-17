import { useState, useCallback } from "react"
import { ethers } from "ethers"
import { erc721ABI } from "wagmi"

export const useNFTMetadata = (provider) => {
    const [nftInfo, setNftInfo] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const getNFTInfo = useCallback(
        async (nftAddress, tokenId) => {
            if (!provider) return null
            setLoading(true)
            setError(null)

            console.log("Fetching NFT info...")
            const contract = new ethers.Contract(nftAddress, erc721ABI, provider)
            const tokenIdBigNumber = ethers.BigNumber.from(tokenId)

            try {
                const [tokenURI, tokenOwner, collectionName, tokenSymbol] = await Promise.all([
                    contract.tokenURI(tokenIdBigNumber),
                    contract.ownerOf(tokenIdBigNumber),
                    contract.name(),
                    contract.symbol(),
                ])

                console.log("Token URI:", tokenURI)

                const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
                const response = await fetch(requestURL)
                const contentType = response.headers.get("content-type")

                let tokenURIData = {}
                if (contentType && contentType.includes("application/json")) {
                    tokenURIData = await response.json()
                }

                console.log("Token URI Data:", tokenURIData)

                const metadata = {
                    ...tokenURIData,
                    tokenOwner,
                    collectionName,
                    tokenSymbol,
                    tokenURI,
                    imageURI: tokenURIData.image
                        ? tokenURIData.image.replace("ipfs://", "https://ipfs.io/ipfs/")
                        : "",
                }

                setNftInfo(metadata)
                console.log("NFT Metadata:", metadata)
                return metadata
            } catch (error) {
                console.error("Error fetching NFT info:", error)
                setError(error)
                return null
            } finally {
                setLoading(false)
            }
        },
        [provider]
    )

    return { getNFTInfo, nftInfo, loading, error }
}
