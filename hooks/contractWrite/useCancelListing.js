import { useState, useCallback } from "react"
import { useContractWrite, useWaitForTransaction } from "wagmi"
import nftMarketplaceAbi from "@constants/NftMarketplace.json"
import useTransactionHandlers from "../transactionHandlers/useTransactionHandlers"
import useTransactionStatus from "../transactionStatus/useTransactionStatus"

export const useCancelListing = (marketplaceAddress, nftAddress, tokenId, onSuccessCallback) => {
    const {
        handleTransactionError,
        handleTransactionFailure,
        checkWalletConnection,
        transactionInProgress,
    } = useTransactionHandlers()

    const [cancelListingTxHash, setCancelListingTxHash] = useState(null)

    const {
        writeAsync: cancelListing,
        status: cancelListingStatus,
        error: cancelListingStatusError,
    } = useContractWrite({
        address: marketplaceAddress,
        abi: nftMarketplaceAbi,
        functionName: "cancelListing",
        args: [nftAddress, tokenId],
        onSuccess: (data) => {
            setCancelListingTxHash(data.hash)
        },
        onError: (error) => {
            console.error("Cancel listing error", error)
            handleTransactionError(error)
            handleTransactionFailure("cancelListing")
        },
    })

    const { status: waitCancelListingStatus, error: waitCancelListingStatusError } =
        useWaitForTransaction({
            hash: cancelListingTxHash,
            onError: (error) => {
                handleTransactionError(error)
                handleTransactionFailure("cancelListing")
            },
        })

    useTransactionStatus({
        status: cancelListingStatus,
        statusError: cancelListingStatusError,
        waitStatus: waitCancelListingStatus,
        waitStatusError: waitCancelListingStatusError,
        type: "cancelListing",
        tokenId,
        nftAddress,
        onSuccessCallback,
    })

    const handleCancelListing = useCallback(async () => {
        if (!checkWalletConnection("cancelListing")) return
        if (transactionInProgress("cancelListing", cancelListingStatus === "loading")) return

        try {
            await cancelListing()
        } catch (error) {
            console.error("An error occurred during the transaction: ", error)
        }
    }, [checkWalletConnection, transactionInProgress, cancelListingStatus, cancelListing])

    return { handleCancelListing }
}

export default useCancelListing
