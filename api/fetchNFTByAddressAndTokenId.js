import { fetchNFTContractData } from "./fetchContractData"
import { ethers } from "ethers"

/**
 * Fetches details of a specific NFT using the Alchemy API and contract data.
 * Falls back to a hypothetical backup API if the primary request fails.
 *
 * @param {ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider} provider - The Ethereum provider used to interact with the blockchain.
 * @param {string} nftAddress - The contract address of the NFT.
 * @param {string | number} tokenId - The token ID of the NFT.
 * @returns {Promise<any>} The NFT details, or null if an error occurs.
 */

export const fetchNFTByAddressAndTokenId = async (nftAddress, tokenId) => {
    const provider =
        typeof window !== "undefined" && window.ethereum
            ? new ethers.providers.Web3Provider(window.ethereum)
            : new ethers.providers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com")
    const alchemyApiUrl = `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}/getNFTMetadata?contractAddress=${nftAddress}&tokenId=${tokenId}`

    try {
        // Attempt to fetch from the primary Alchemy API
        const response = await fetch(alchemyApiUrl)

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`)
        }

        const nftData = await response.json()
        console.log("Fetched Data from Alchemy:", nftData)

        // Fetch contract data using the provider and the contract details
        const contractData = await fetchNFTContractData(provider, nftAddress, tokenId)

        // Transform the Alchemy API response and combine it with the contract data
        const transformedNft = {
            tokenName: nftData.metadata?.name || contractData?.collectionName || "Unknown NFT",
            tokenSymbol: nftData.contractMetadata?.symbol || contractData?.tokenSymbol || "",
            collectionName: nftData.contractMetadata?.name || contractData?.collectionName || "",
            tokenURI: nftData.tokenUri?.raw || contractData?.tokenURI || "",
            attributes: nftData.metadata?.attributes || "",
            tokenOwner: nftData.owner?.toLowerCase() || contractData?.tokenOwner || "Unknown",
            imageURI:
                nftData.media?.[0]?.gateway?.replace("ipfs://", "https://ipfs.io/ipfs/") || "",
            tokenDescription: nftData.metadata?.description || "",
            nftAddress: nftAddress.toLowerCase(),
            tokenId: BigInt(tokenId).toString(),
            desiredNftAddress: "0x0000000000000000000000000000000000000000",
            desiredTokenId: "0",
            price: 0,
            // Additional contract data fields
            balanceOf: contractData?.balanceOf || "0",
            totalSupply: contractData?.totalSupply || "0",
            getApproved: contractData?.getApproved || "N/A",
        }
        console.log("Transformed NFT Data:", transformedNft)
        return transformedNft
    } catch (error) {
        console.error("Error with Alchemy API or Contract data:", error)

        // Handle fallback to another API or return null
        return null
    }
}
