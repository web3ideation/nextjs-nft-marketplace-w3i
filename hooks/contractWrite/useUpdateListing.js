import { useState, useEffect, useCallback } from "react"
import { useContractWrite, useWaitForTransaction } from "wagmi"
import { ethers } from "ethers"
import useTransactionHandlers from "../transactionHandlers/useTransactionHandlers"
import nftMarketplaceAbi from "@constants/NftMarketplace.json"
import { truncateStr } from "@utils/formatting"

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
    const [updating, setUpdating] = useState(false)
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

    const { data: updateListingData, writeAsync: updateListing } = useContractWrite({
        address: marketplaceAddress,
        abi: nftMarketplaceAbi,
        functionName: "updateListing",
        args: [nftAddress, tokenId, ethers.utils.parseEther(newPrice), newDesiredNftAddress, newDesiredTokenId],
        onSuccess: (data) => {
            setTxHash(data.hash)
            clearConfirmTransactionNotification()
        },
        onError: (error) => {
            console.error("Update listing send error: ", error)
            setUpdating(false)
            handleTransactionError(error)
            handleTransactionFailure("updateListing", setUpdating)
            clearTransactionLoadingNotification()
            clearConfirmTransactionNotification()
        },
    })

    const {
        data: updateListingTxReceipt,
        isLoading: isTxLoading,
        isSuccess: isTxSuccess,
        isError: isTxError,
    } = useWaitForTransaction({
        hash: txHash,
    })

    const handleUpdateListing = useCallback(async () => {
        if (!checkWalletConnection("updateListing")) return
        if (transactionInProgress("updateListing", updating)) return
        setUpdating(true)
        handleTransactionConfirm("updateListing", {
            nftAddress: truncateStr(nftAddress, 4, 4),
            tokenId: tokenId.toString(),
            price: price.toString(),
            newPrice: newPrice.toString(),
            newDesiredNftAddress: truncateStr(newDesiredNftAddress, 4, 4),
            newDesiredTokenId: newDesiredTokenId.toString(),
        })
        try {
            await updateListing()
        } catch (error) {
            console.error("An error occurred during the transaction: ", error)
            setUpdating(false)
            clearTransactionLoadingNotification()
            clearConfirmTransactionNotification()
        }
    }, [
        checkWalletConnection,
        transactionInProgress,
        updating,
        handleTransactionConfirm,
        price,
        nftAddress,
        tokenId,
        newPrice,
        newDesiredNftAddress,
        newDesiredTokenId,
        updateListing,
        clearTransactionLoadingNotification,
        clearConfirmTransactionNotification,
    ])

    useEffect(() => {
        if (isTxLoading) handleTransactionLoading("updateListing")
        else if (isTxSuccess) {
            handleTransactionSuccess("updateListing", onSuccessCallback, setUpdating)
            clearTransactionLoadingNotification()
        } else if (isTxError) {
            clearTransactionLoadingNotification()
            handleTransactionFailure("updateListing", setUpdating)
        }
    }, [
        isTxLoading,
        isTxSuccess,
        isTxError,
        handleTransactionLoading,
        handleTransactionSuccess,
        handleTransactionFailure,
        clearTransactionLoadingNotification,
        onSuccessCallback,
    ])

    useEffect(() => {
        return () => {
            clearConfirmTransactionNotification()
        }
    }, [clearConfirmTransactionNotification])

    return { handleUpdateListing, updating }
}
export default useUpdateListing
