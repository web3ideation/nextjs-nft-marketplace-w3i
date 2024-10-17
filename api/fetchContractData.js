import { ethers } from "ethers"
import { erc721ABI } from "wagmi"

/**
 * Fetches NFT contract data including the token URI, owner, collection name, and symbol.
 * Utilizes the provided Ethereum provider to interact with the specified ERC-721 contract.
 *
 * @param {ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider} provider - The Ethereum provider used to interact with the blockchain.
 * @param {string} nftAddress - The contract address of the NFT.
 * @param {string | number} tokenId - The ID of the token to retrieve information for.
 * @returns {Promise<{ tokenURI: string | null, tokenOwner: string | null, collectionName: string | null, tokenSymbol: string | null, balanceOf: number | null, totalSupply: number | null, getApproved: string | null }>} The fetched data including token URI, owner address, collection name, and symbol, or null if the data is not available.
 * @throws Will throw an error if the contract interaction fails.
 */
export const fetchNFTContractData = async (provider, nftAddress, tokenId) => {
    // Return null if no provider is available
    if (!provider) return null

    // Create a new contract instance using the ERC-721 ABI and the provided provider
    const contract = new ethers.Contract(nftAddress, erc721ABI, provider)
    const tokenIdBigNumber = ethers.BigNumber.from(tokenId)

    // Helper function to safely fetch contract data
    const safeFetch = async (fetchFn, defaultValue = null) => {
        try {
            return await fetchFn()
        } catch (error) {
            console.warn(`Error fetching data: ${error.message}`)
            return defaultValue
        }
    }

    try {
        // Fetch the token URI, owner address, collection name, and symbol safely
        const [
            tokenURI,
            tokenOwner,
            collectionName,
            tokenSymbol,
            balanceOf,
            totalSupply,
            getApproved,
        ] = await Promise.all([
            safeFetch(() => contract.tokenURI(tokenIdBigNumber), null),
            safeFetch(() => contract.ownerOf(tokenIdBigNumber), null),
            safeFetch(() => contract.name(), null),
            safeFetch(() => contract.symbol(), null),
            safeFetch(() => contract.balanceOf(nftAddress), null),
            safeFetch(() => contract.totalSupply(), null),
            safeFetch(() => contract.getApproved(tokenIdBigNumber), null),
        ])

        // Return the fetched contract data
        return {
            tokenURI,
            tokenOwner,
            collectionName,
            tokenSymbol,
            balanceOf,
            totalSupply,
            getApproved,
        }
    } catch (error) {
        // Log the error for debugging purposes
        console.error("Error fetching contract data:", error)
        // Re-throw the error to allow higher-level error handling
        throw error
    }
}
