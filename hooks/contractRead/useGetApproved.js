import { useState, useCallback } from "react"
import { erc721ABI, useContractRead } from "wagmi"
import { useTransactionHandlers } from "@hooks"

const useGetApproved = (nftAddress, tokenId, marketplaceAddress) => {
    const {
        handleTransactionError,
        handleTransactionFailure,
        transactionInProgress,
        handleTransactionSuccess,
    } = useTransactionHandlers()

    const [isApprovedForMarketplace, setIsApprovedForMarketplace] = useState(false) // Zustand, ob der NFT für den Marktplatz genehmigt ist

    const { status: getApproveStatus, refetch: getApproved } = useContractRead({
        address: nftAddress,
        abi: erc721ABI,
        functionName: "getApproved",
        args: [tokenId],
        enabled: !!nftAddress && !!tokenId,
        onError: (error) => {
            console.error("An error occurred while fetching approval status: ", error.message)
            handleTransactionError(error)
            handleTransactionFailure("getApproved")
        },
        onSuccess: (data) => {
            const approvedAddress = data.toLowerCase()
            console.log("Approval status fetched: ", approvedAddress)

            if (
                approvedAddress !== "0x0000000000000000000000000000000000000000" &&
                approvedAddress === marketplaceAddress.toLowerCase()
            ) {
                setIsApprovedForMarketplace(true)
                handleTransactionSuccess("getApproved")
            } else {
                setIsApprovedForMarketplace(false)
                console.warn("NFT is not approved for the marketplace address")
            }
        },
    })

    // Ability to manually reetch if required
    const handleGetApproved = useCallback(() => {
        if (transactionInProgress("getApproved", getApproveStatus === "loading")) return

        try {
            getApproved()
        } catch (error) {
            console.error("An error occurred while refetching approval: ", error)
        }
    }, [transactionInProgress, getApproveStatus, getApproved])

    return {
        isApprovedForMarketplace,
        handleGetApproved,
    }
}

export default useGetApproved
