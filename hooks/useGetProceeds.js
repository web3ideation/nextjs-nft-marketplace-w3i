// React Imports
import { useCallback, useEffect } from "react"

// wagmi (Ethereum React hooks) imports
import { useContractRead } from "wagmi"

// Custom hooks and utility imports
import nftMarketplaceAbi from "@constants/NftMarketplace.json"

/**
 * Custom hook to get proceeds of an user.
 * @param {string} marketplaceAddress - The marketplace smart contract address.
 * @param {string} abi - The abi of the marketplace.
 * @param {string} userAdress - The address of the user.
 * @returns {Object} - Object containing the refetchProceeds function, the proceeds and belonging states.
 */

export const useGetProceeds = (marketplaceAddress, userAdress) => {
    // Read contract function to get proceeds
    const {
        data: returnedProceeds,
        isLoading: isLoadingProceeds,
        error: errorLoadingProceeds,
        status: proceedsStatus,
        refetch: refetchProceeds,
    } = useContractRead({
        address: marketplaceAddress,
        abi: nftMarketplaceAbi,
        functionName: "getProceeds",
        args: [userAdress],
    })

    return {
        returnedProceeds,
        isLoadingProceeds,
        errorLoadingProceeds,
        proceedsStatus,
        refetchProceeds,
    }
}
