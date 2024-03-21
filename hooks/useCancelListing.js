// React Imports
import { useState, useEffect, useCallback, useRef } from "react"

// Custom Hooks and Utility Imports
import { useContractWrite, useWaitForTransaction } from "wagmi"
import { useNftNotification } from "@context/NotificationProvider"

// Constants and Configurations
import nftMarketplaceAbi from "@constants/NftMarketplace.json"

/**
 * Custom hook to manage the delisting process of an NFT.
 * Handles the transaction states, notifications, and user interactions.
 *
 * @param {string} marketplaceAddress - The smart contract address of the marketplace.
 * @param {string} nftAddress - The address of the NFT.
 * @param {number} tokenId - The token ID of the NFT.
 * @param {boolean} isConnected - Indicates if the user is connected to a wallet.
 * @param {Function} onSuccessCallback - Callback to execute on successful delisting.
 * @returns {Object} Object containing handleCancelListingClick function and delisting state.
 */
export const useCancelListing = (
    marketplaceAddress,
    nftAddress,
    tokenId,
    isConnected,
    onSuccessCallback
) => {
    // State management for transaction hash and delisting status
    const [cancelTxHash, setCancelTxHash] = useState(null)
    const [delisting, setDelisting] = useState(false)

    // Notification context hooks
    const { showNftNotification, closeNftNotification } = useNftNotification()

    // Refs to manage notification ids
    const confirmCancelListingNotificationId = useRef(null)
    const whileCancelListingNotificationId = useRef(null)

    // Define a state for polling interval
    const [polling, setPolling] = useState(false)

    // Function to check the transaction status
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

    // Start polling when a transaction is initiated
    useEffect(() => {
        let interval
        if (polling) {
            interval = setInterval(checkTransactionStatus, 2500) // Poll every 5 seconds
        }
        return () => clearInterval(interval) // Cleanup
    }, [polling])

    // Callback to handle transaction errors
    const handleTransactionError = useCallback(
        (error) => {
            // Checking if the error is due to user's action
            const userDenied = error.message.includes("User rejected the request")
            showNftNotification(
                userDenied ? "Transaction Rejected" : "Error",
                userDenied
                    ? "You rejected the transaction."
                    : error.message || "Failed to delist the NFT.",
                "error"
            )
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
        showNftNotification("Success", "Delisting successful", "success")
        console.log(
            "Cancel listing data",
            cancelListingData,
            "Cancel listing receipt",
            cancelTxReceipt
        )
        onSuccessCallback?.()
        setPolling(false) // Stop polling on success
    }, [closeNftNotification, showNftNotification, onSuccessCallback])

    // Function to handle transaction failure
    const handleTransactionFailure = useCallback(() => {
        setDelisting(false)
        closeNftNotification(whileCancelListingNotificationId.current)
        showNftNotification("Error", "Failed to delist the NFT.", "error")
        setPolling(false) // Stop polling on failure
    }, [closeNftNotification, showNftNotification])

    // Function to initiate the cancel listing transaction
    const { data: cancelListingData, writeAsync: cancelListing } = useContractWrite({
        address: marketplaceAddress,
        abi: nftMarketplaceAbi,
        functionName: "cancelListing",
        args: [nftAddress, tokenId],
        onSuccess: (data) => {
            console.log("Cancel listing send", data)
            setCancelTxHash(data.hash)
            closeNftNotification(confirmCancelListingNotificationId.current)
        },
        onError: (error) => {
            console.log("Cancel listing error", error)
            setDelisting(false)
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
            setPolling(true) // Start polling after initiating the transaction
        } catch (error) {
            console.log("An error occurred during the transaction: ", error)
        }
    }, [isConnected, delisting, cancelListing, showNftNotification])

    // Update state based on transaction status
    useEffect(() => {
        if (isCancelTxLoading) handleTransactionLoading()
        else if (isCancelTxSuccess) handleTransactionSuccess()
        else if (isCancelTxError) handleTransactionFailure()
    }, [isCancelTxLoading, isCancelTxSuccess, isCancelTxError])

    // Cleanup function to close notifications when the component unmounts or dependencies change
    useEffect(() => {
        return () => {
            closeNftNotification(confirmCancelListingNotificationId.current)
            closeNftNotification(whileCancelListingNotificationId.current)
        }
    }, [closeNftNotification])

    return { handleCancelListingClick, delisting }
}
