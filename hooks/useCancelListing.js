import { useState, useEffect, useCallback, useRef } from "react"

import { useTransactionErrorHandler } from "./transactionErrorHandling/useTransactionErrorHandler"
import { useContractWrite, useWaitForTransaction } from "wagmi"
import { useNftNotification } from "@context/NotificationProvider"

import nftMarketplaceAbi from "@constants/NftMarketplace.json"

export const useCancelListing = (
    marketplaceAddress,
    nftAddress,
    tokenId,
    isConnected,
    onSuccessCallback
) => {
    const [cancelTxHash, setCancelTxHash] = useState(null)
    const [delisting, setDelisting] = useState(false)

    const { showNftNotification, closeNftNotification } = useNftNotification()

    const confirmCancelListingNotificationId = useRef(null)
    const whileCancelListingNotificationId = useRef(null)

    const [polling, setPolling] = useState(false)

    const checkTransactionStatus = async () => {
        try {
            const receipt = await web3Provider.getTransactionReceipt(cancelTxHash)
            if (receipt) {
                handleTransactionSuccess()
                setPolling(false) // Stop polling
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
        whileCancelListingNotificationId.current = showNftNotification(
            "Delisting",
            "Transaction sent. Awaiting confirmation...",
            "info",
            true
        )
    }, [showNftNotification])

    const handleTransactionSuccess = useCallback(() => {
        setDelisting(false)
        closeNftNotification(whileCancelListingNotificationId.current)
        showNftNotification("Success", "Delisting successful", "success")
        onSuccessCallback?.()
        setPolling(false)
    }, [closeNftNotification, showNftNotification, onSuccessCallback])

    const handleTransactionFailure = useCallback(() => {
        setDelisting(false)
        closeNftNotification(whileCancelListingNotificationId.current)
        showNftNotification("Error", "Failed to delist the NFT.", "error")
        setPolling(false)
    }, [closeNftNotification, showNftNotification])

    const { data: cancelListingData, writeAsync: cancelListing } = useContractWrite({
        address: marketplaceAddress,
        abi: nftMarketplaceAbi,
        functionName: "cancelListing",
        args: [nftAddress, tokenId],
        onSuccess: (data) => {
            setCancelTxHash(data.hash)
            closeNftNotification(confirmCancelListingNotificationId.current)
        },
        onError: (error) => {
            console.error("Cancel listing error", error)
            setDelisting(false)
            handleTransactionError(error)
            closeNftNotification(confirmCancelListingNotificationId.current)
        },
    })

    const {
        data: cancelTxReceipt,
        isLoading: isCancelTxLoading,
        isSuccess: isCancelTxSuccess,
        isError: isCancelTxError,
    } = useWaitForTransaction({
        hash: cancelTxHash,
    })

    const handleCancelListingClick = useCallback(async () => {
        if (!isConnected) {
            showNftNotification("Connect", "Connect your wallet to cancel listing!", "info")
            return
        }
        if (delisting) {
            showNftNotification(
                "Delisting",
                "A delist is already in progress! Check your wallet!",
                "error"
            )
            return
        }
        setDelisting(true)
        confirmCancelListingNotificationId.current = showNftNotification(
            "Delisting",
            "Cancelling listing... Check wallet!",
            "info",
            true
        )

        try {
            await cancelListing()
            setPolling(true)
        } catch (error) {
            console.log("An error occurred during the transaction: ", error)
        }
    }, [isConnected, delisting, cancelListing, showNftNotification])

    useEffect(() => {
        if (isCancelTxLoading) handleTransactionLoading()
        else if (isCancelTxSuccess) handleTransactionSuccess()
        else if (isCancelTxError) handleTransactionFailure()
    }, [
        isCancelTxLoading,
        isCancelTxSuccess,
        isCancelTxError,
        handleTransactionLoading,
        handleTransactionSuccess,
        handleTransactionFailure,
    ])

    useEffect(() => {
        return () => {
            closeNftNotification(confirmCancelListingNotificationId.current)
            closeNftNotification(whileCancelListingNotificationId.current)
        }
    }, [closeNftNotification])

    return { handleCancelListingClick, delisting }
}
