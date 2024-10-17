/**
 * Fetches NFTs owned by a specific wallet address using the Alchemy API.
 * Falls back to a hypothetical backup API if the primary request fails.
 *
 * @param {string} walletAddress - The wallet address to fetch NFTs for.
 * @returns {Promise<any[]>} The list of NFTs owned by the wallet, or an empty array if an error occurs.
 */
export const fetchNFTsByWallet = async (walletAddress) => {
    const alchemyApiUrl = `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}/getNFTs?owner=${walletAddress}`
    // const fallbackApiUrl = `https://backup-nft-api.example.com/getNFTs?owner=${walletAddress}` // Hypothetical fallback URL

    try {
        // Attempt to fetch from the primary Alchemy API
        const response = await fetch(alchemyApiUrl)

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`)
        }

        const data = await response.json()
        console.log("Fetched Data from Alchemy:", data)

        // Transform the Alchemy API response to match the desired structure
        const transformedNfts = data.ownedNfts.map((nft) => ({
            tokenName: nft.title || "Unknown NFT",
            tokenSymbol: nft.contractMetadata.symbol || "",
            collectionName: nft.contractMetadata.name || "",
            tokenURI: nft.tokenUri.raw || "",
            attributes: nft.metadata.attributes || "",
            tokenOwner: walletAddress.toLowerCase(),
            imageURI: nft.media[0]?.gateway.replace("ipfs://", "https://ipfs.io/ipfs/"),
            tokenDescription: nft.description || "",
            nftAddress: nft.contract.address,
            tokenId: BigInt(nft.id.tokenId).toString(),
            desiredNftAddress: "0x0000000000000000000000000000000000000000",
            desiredTokenId: "0",
            price: 0,
        }))

        return transformedNfts
    } catch (error) {
        console.error("Error with Alchemy API, falling back to the backup API:", error)

        // Fallback to another API if the Alchemy API fails
        try {
            const fallbackResponse = await fetch(fallbackApiUrl)

            if (!fallbackResponse.ok) {
                throw new Error(`Network response was not ok: ${fallbackResponse.statusText}`)
            }

            const fallbackData = await fallbackResponse.json()
            console.log("Fetched Fallback Data:", fallbackData)

            // Transform the fallback API response (adjust this transformation based on actual fallback API response format)
            const transformedFallbackNfts = fallbackData.ownedNfts.map((nft) => ({
                tokenName: nft.title || "Unknown NFT",
                tokenSymbol: nft.contractMetadata.symbol || "",
                collectionName: nft.contractMetadata.name || "",
                tokenURI: nft.tokenUri.raw || "",
                attributes: nft.metadata.attributes || "",
                tokenOwner: walletAddress.toLowerCase(),
                imageURI: nft.media[0]?.gateway.replace("ipfs://", "https://ipfs.io/ipfs/"),
                tokenDescription: nft.description || "",
                nftAddress: nft.contract.address,
                tokenId: BigInt(nft.id.tokenId).toString(),
                desiredNftAddress: "0x0000000000000000000000000000000000000000",
                desiredTokenId: "0",
                price: 0,
            }))

            return transformedFallbackNfts
        } catch (fallbackError) {
            console.error("Error fetching NFTs from fallback API:", fallbackError)
            return []
        }
    }
}
