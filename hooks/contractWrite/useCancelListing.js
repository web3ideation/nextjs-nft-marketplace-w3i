import { useState, useEffect, useCallback } from "react"
import { useContractWrite, useWaitForTransaction } from "wagmi"
import useTransactionHandlers from "../transactionHandlers/useTransactionHandlers"
import nftMarketplaceAbi from "@constants/NftMarketplace.json"
import { truncateStr } from "@utils/formatting"

export const useCancelListing = (marketplaceAddress, nftAddress, tokenId, onSuccessCallback) => {
    const [delisting, setDelisting] = useState(false)
    const [txHash, setTxHash] = useState(null)

    const {
        checkWalletConnection,
        handleTransactionConfirm,
        clearConfirmTransactionNotification,
        handleTransactionError,
        handleTransactionFailure,
        transactionInProgress,
        handleTransactionLoading,
        clearTransactionLoadingNotification,
        handleTransactionSuccess,
    } = useTransactionHandlers()

    const { data: cancelListingData, writeAsync: cancelListing } = useContractWrite({
        address: marketplaceAddress,
        abi: nftMarketplaceAbi,
        functionName: "cancelListing",
        args: [nftAddress, tokenId],
        onSuccess: (data) => {
            setTxHash(data.hash)
            clearConfirmTransactionNotification()
        },
        onError: (error) => {
            console.error("Cancel listing error", error)
            setDelisting(false)
            handleTransactionError(error)
            handleTransactionFailure("cancelListing", setDelisting)
            clearTransactionLoadingNotification()
            clearConfirmTransactionNotification()
        },
    })

    const {
        data: cancelTxReceipt,
        isLoading: isTxLoading,
        isSuccess: isTxSuccess,
        isError: isTxError,
    } = useWaitForTransaction({
        hash: txHash,
    })

    const handleCancelListingClick = useCallback(async () => {
        if (!checkWalletConnection("cancelListing")) return
        if (transactionInProgress("cancelListing", delisting)) return
        setDelisting(true)
        handleTransactionConfirm("cancelListing", {
            tokenId: tokenId.toString(),
            nftAddress: truncateStr(nftAddress, 4, 4),
        })
        try {
            await cancelListing()
        } catch (error) {
            console.log("An error occurred during the transaction: ", error)
            setDelisting(false)
            clearTransactionLoadingNotification()
            clearConfirmTransactionNotification()
        }
    }, [
        checkWalletConnection,
        transactionInProgress,
        delisting,
        handleTransactionConfirm,
        nftAddress,
        tokenId,
        cancelListing,
        clearTransactionLoadingNotification,
        clearConfirmTransactionNotification,
    ])

    useEffect(() => {
        if (isTxLoading) handleTransactionLoading("cancelListing")
        else if (isTxSuccess) {
            handleTransactionSuccess("cancelListing", onSuccessCallback, setDelisting)
            clearTransactionLoadingNotification()
        } else if (isTxError) {
            clearTransactionLoadingNotification()
            handleTransactionFailure("cancelListing", setDelisting)
        }
    }, [
        isTxLoading,
        isTxSuccess,
        isTxError,
        setDelisting,
        handleTransactionLoading,
        handleTransactionSuccess,
        handleTransactionFailure,
        clearTransactionLoadingNotification,
        onSuccessCallback,
    ])

    useEffect(() => {
        return () => {
            clearConfirmTransactionNotification()

            clearTransactionLoadingNotification()
        }
    }, [clearTransactionLoadingNotification, clearConfirmTransactionNotification])

    return { handleCancelListingClick, delisting }
}

export default useCancelListing
