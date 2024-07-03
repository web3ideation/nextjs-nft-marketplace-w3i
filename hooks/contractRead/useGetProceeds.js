import { useContractRead } from "wagmi"

import nftMarketplaceAbi from "@constants/NftMarketplace.json"

export const useGetProceeds = (marketplaceAddress, userAddress) => {
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
        args: [userAddress],
    })

    return {
        returnedProceeds,
        isLoadingProceeds,
        errorLoadingProceeds,
        proceedsStatus,
        refetchProceeds,
    }
}

export default useGetProceeds
