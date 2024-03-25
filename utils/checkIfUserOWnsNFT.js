import { ethers } from "ethers"
import { erc721ABI } from "wagmi"

/**
 * Checks if the specified user owns the given token of an NFT.
 *
 * @param {string} userAddress - The Ethereum address of the user.
 * @param {string} nftContractAddress - The smart contract address of the NFT.
 * @param {number} tokenId - The token ID of the NFT.
 * @param {ethers.providers.Web3Provider} provider - An ethers.js Web3 provider.
 * @returns {Promise<boolean>} - True if the user owns the token, false otherwise.
 */
const checkIfUserOwnsNFT = async (userAddress, nftContractAddress, tokenId, provider) => {
    try {
        const ERC721_ABI = erc721ABI
        const nftContract = new ethers.Contract(nftContractAddress, ERC721_ABI, provider)
        const owner = await nftContract.ownerOf(tokenId)
        return owner.toLowerCase() === userAddress.toLowerCase()
    } catch (error) {
        console.error("Error checking NFT ownership: ", error)
        return false
    }
}

export default checkIfUserOwnsNFT
