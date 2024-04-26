import { useState, useEffect, useRef, useCallback } from "react"

import { useContractWrite, useWaitForTransaction } from "wagmi"

import { useTransactionErrorHandler } from "./transactionErrorHandling/useTransactionErrorHandler"
import { useNotification } from "@context/NotificationProvider"
import nftMarketplaceAbi from "@constants/NftMarketplace.json"

export const useUpdateListing = (
    marketplaceAddress,
    newPrice,
    nftAddress,
    tokenId,
    newDesiredNftAddress,
    newDesiredTokenId,
    isConnected,
    onSuccessCallback
) => {
    const [updateListingTxHash, setUpdateListingTxHash] = useState(null)
    const [updating, setUpdating] = useState(false)

    const { showNotification, closeNotification } = useNotification()

    const confirmUpdateListingNotificationId = useRef(null)
    const whileUpdatingListingNotificationId = useRef(null)

    const [polling, setPolling] = useState(false)

    const checkTransactionStatus = async () => {
        try {
            const receipt = await web3Provider.getTransactionReceipt(updateListingTxHash)
            if (receipt) {
                handleTransactionSuccess()
                setPolling(false)
            }
        } catch (error) {
            console.error("Error fetching transaction receipt: ", error)
        }
    }

    useEffect(() => {
        let interval
        if (polling) {
            interval = setInterval(checkTransactionStatus, 2500)
        }
        return () => clearInterval(interval)
    }, [polling])

    const { handleTransactionError } = useTransactionErrorHandler()

    const handleTransactionLoading = useCallback(() => {
        whileUpdatingListingNotificationId.current = showNotification(
            "Updating",
            "Transaction sent. Awaiting confirmation...",
            "info",
            true
        )
    }, [showNotification])

    const handleTransactionSuccess = useCallback(() => {
        setUpdating(false)
        closeNotification(whileUpdatingListingNotificationId.current)
        showNotification("Listing updated", "New price approved", "success")
        onSuccessCallback?.()
        setPolling(false)
    }, [closeNotification, showNotification, onSuccessCallback])

    const handleTransactionFailure = useCallback(() => {
        setUpdating(false)
        closeNotification(whileUpdatingListingNotificationId.current)
        showNotification("Error", "Failed to update the NFT.", "error")
        setPolling(false)
    }, [closeNotification, showNotification])

    const { data: updateListingData, writeAsync: updateListing } = useContractWrite({
        address: marketplaceAddress,
        abi: nftMarketplaceAbi,
        functionName: "updateListing",
        args: [nftAddress, tokenId, newPrice, newDesiredNftAddress, newDesiredTokenId],
        onSuccess: (data) => {
            setUpdateListingTxHash(data.hash)
            closeNotification(confirmUpdateListingNotificationId.current)
        },
        onError: (error) => {
            console.error("Update listing send error: ", error)
            setUpdating(false)
            handleTransactionError(error)
            closeNotification(confirmUpdateListingNotificationId.current)
        },
    })

    const {
        data: updateListingTxReceipt,
        isLoading: isUpdateListingTxLoading,
        isSuccess: isUpdateListingTxSuccess,
        isError: isUpdateListingTxError,
    } = useWaitForTransaction({
        hash: updateListingTxHash,
    })

    const handleUpdateListing = useCallback(async () => {
        if (updating) {
            showNotification(
                "Updating",
                "A update is already in progress! Check your wallet!",
                "error"
            )
            return
        }
        setUpdating(true)
        confirmUpdateListingNotificationId.current = showNotification(
            "Check your wallet",
            "Confirm updating...",
            "info",
            true
        )
        try {
            await updateListing()
            setPolling(true)
        } catch (error) {
            console.error("An error occurred during the transaction: ", error)
        }
    }, [isConnected, updating, updateListing, showNotification])

    useEffect(() => {
        if (isUpdateListingTxLoading) {
            handleTransactionLoading()
        } else if (isUpdateListingTxSuccess) {
            handleTransactionSuccess()
        } else if (isUpdateListingTxError) {
            handleTransactionFailure()
        }
    }, [isUpdateListingTxLoading, isUpdateListingTxSuccess, isUpdateListingTxError])

    useEffect(() => {
        return () => {
            closeNotification(confirmUpdateListingNotificationId.current)
            closeNotification(whileUpdatingListingNotificationId.current)
        }
    }, [closeNotification])

    return { handleUpdateListing, updating }
}
