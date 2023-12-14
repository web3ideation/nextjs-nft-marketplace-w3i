import { useState, useEffect, useRef, useCallback } from "react"
import { useContractWrite, useWaitForTransaction } from "wagmi"
import { useNftNotification } from "../context/NFTNotificationContext"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"

// !!!N I have to bring the notification back in nftBox, just define transaction status here

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

    // Function to initate the cancel listing transaction
    const { data: cancelListingData, writeAsync: cancelListing } = useContractWrite({
        address: marketplaceAddress,
        abi: nftMarketplaceAbi,
        functionName: "cancelListing",
        args: [nftAddress, tokenId],
        onSuccess: (data) => {
            console.log("Delist send success: ", data)
            setCancelTxHash(data.hash)
            closeNftNotification(confirmCancelListingNotificationId.current)
        },
        onError: (error) => {
            console.log("Delist send error: ", error)
            setDelisting(false)
            if (error.message.includes("User denied transaction signature")) {
                // for user rejected transaction
                showNftNotification(
                    "Transaction Rejected",
                    "You have rejected the transaction.",
                    "error"
                )
            } else {
                // Handle other errors
                showNftNotification("Error", error.message || "Failed to delist the NFT.", "error")
            }
            handleTransactionError(error)
            closeNftNotification(confirmCancelListingNotificationId.current)
        },
    })

    // Wait for transaction confirmation
    const {
        data: cancelTxReceipt,
        isLoading: isCancelTxLoading,
        isSuccess: isCancelTxSuccess,
        isError: isCancelTxError,
    } = useWaitForTransaction({
        hash: cancelTxHash,
    })

    // Update state based on transaction status
    useEffect(() => {
        if (isCancelTxLoading) {
            handleTransactionLoading()
        } else if (isCancelTxSuccess) {
            handleTransactionSuccess()
        } else if (isCancelTxError) {
            handleTransactionFailure()
        }
    }, [isCancelTxLoading, isCancelTxSuccess, isCancelTxError])

    // Function to handle the delist click
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
        } catch (error) {
            // This will handle any errors that are not caught by the onError callback
            console.log("An error occurred during the transaction: ", error)
        }
    }, [isConnected, delisting, cancelListing])

    // Function to handle transaction error
    const handleTransactionError = useCallback(
        (error) => {
            if (error.message.includes("User denied transaction signature")) {
                // for user rejected transaction
                showNftNotification(
                    "Transaction Rejected",
                    "You have rejected the transaction.",
                    "error"
                )
            } else {
                // Handle other errors
                showNftNotification("Error", error.message || "Failed to buy the NFT.", "error")
            }
        },
        [showNftNotification]
    )

    // Function to handle transaction loading
    const handleTransactionLoading = useCallback(() => {
        whileCancelListingNotificationId.current = showNftNotification(
            "Delisting",
            "Transaction sent. Awaiting confirmation...",
            "info",
            true
        )
    }, [showNftNotification])

    // Function to handle transaction success
    const handleTransactionSuccess = useCallback(() => {
        setDelisting(false)
        closeNftNotification(whileCancelListingNotificationId.current)
        showNftNotification("Success", "Item successful delisted", "success")
        console.log("Cancel item data", cancelListingData, "Cancel item receipt", cancelTxReceipt)
        if (onSuccessCallback) {
            onSuccessCallback() // Rufen Sie die Callback-Funktion auf
        }
    }, [closeNftNotification, showNftNotification, onSuccessCallback])

    // Function to handle transaction failure
    const handleTransactionFailure = useCallback(() => {
        setDelisting(false)
        closeNftNotification(whileCancelListingNotificationId.current)
        showNftNotification("Error", error.message || "Failed to delist the NFT.", "error")
    }, [closeNftNotification, showNftNotification])

    // Cleanup function to close notifications when the component unmounts or dependencies change
    useEffect(() => {
        return () => {
            closeNftNotification(confirmCancelListingNotificationId.current)
            closeNftNotification(whileCancelListingNotificationId.current)
        }
    }, [closeNftNotification])

    return { handleCancelListingClick, delisting }
}
