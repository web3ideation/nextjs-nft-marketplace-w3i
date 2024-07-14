import { useState, useCallback } from "react"
import { useContractWrite, useWaitForTransaction } from "wagmi"
import { ethers } from "ethers"
import nftMarketplaceAbi from "@constants/NftMarketplace.json"
import useTransactionHandlers from "../transactionHandlers/useTransactionHandlers"
import useTransactionStatus from "../transactionStatus/useTransactionStatus"

export const useUpdateListing = (
    marketplaceAddress,
    nftAddress,
    tokenId,
    price,
    newPrice,
    newDesiredNftAddress,
    newDesiredTokenId,
    onSuccessCallback
) => {
    const {
        handleTransactionError,
        handleTransactionFailure,
        checkWalletConnection,
        transactionInProgress,
    } = useTransactionHandlers()

    const [updateListingTxHash, setUpdateListingTxHash] = useState(null)

    const {
        writeAsync: updateListing,
        status: updateListingStatus,
        error: updateListingStatusError,
    } = useContractWrite({
        address: marketplaceAddress,
        abi: nftMarketplaceAbi,
        functionName: "updateListing",
        args: [
            nftAddress,
            tokenId,
            ethers.utils.parseEther(newPrice),
            newDesiredNftAddress,
            newDesiredTokenId,
        ],
        onSuccess: (data) => {
            setUpdateListingTxHash(data.hash)
        },
        onError: (error) => {
            console.error("Update listing send error: ", error)
            handleTransactionError(error)
            handleTransactionFailure("updateListing")
        },
    })

    const { status: waitUpdateListingStatus, error: waitUpdateListingStatusError } =
        useWaitForTransaction({
            hash: updateListingTxHash,
            onError: (error) => {
                handleTransactionError(error)
                handleTransactionFailure("updateListing")
            },
        })

    useTransactionStatus({
        status: updateListingStatus,
        statusError: updateListingStatusError,
        waitStatus: waitUpdateListingStatus,
        waitStatusError: waitUpdateListingStatusError,
        type: "updateListing",
        tokenId,
        nftAddress,
        price,
        newPrice,
        newDesiredNftAddress,
        newDesiredTokenId,
        onSuccessCallback,
    })

    const handleUpdateListing = useCallback(async () => {
        if (!checkWalletConnection("updateListing")) return
        if (transactionInProgress("updateListing", updateListingStatus === "loading")) return

        try {
            await updateListing()
        } catch (error) {
            console.error("An error occurred during the transaction: ", error)
        }
    }, [checkWalletConnection, transactionInProgress, updateListingStatus, updateListing])

    return { handleUpdateListing }
}
export default useUpdateListing
