import { useContractRead } from "wagmi"
import { marketplaceAbi } from "@constants"

export const useGetProceeds = (marketplaceAddress, userAddress) => {
    const {
        data: returnedProceeds,
        isLoading: isLoadingProceeds,
        error: errorLoadingProceeds,
        status: proceedsStatus,
        refetch: refetchProceeds,
    } = useContractRead({
        address: marketplaceAddress,
        abi: marketplaceAbi,
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
