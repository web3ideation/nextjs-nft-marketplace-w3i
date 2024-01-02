import { useState, useEffect, useRef, useCallback } from "react"
import { useContractWrite, useWaitForTransaction } from "wagmi"
import { useNftNotification } from "../context/NFTNotificationContext"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"

/**
 * Custom hook to handle the delisting process of an NFT.
 * @param {string} marketplaceAddress - The marketplace smart contract address.
 * @param {string} nftAddress - The address of the NFT.
 * @param {number} tokenId - The token ID of the NFT.
 * @param {boolean} isConnected - Whether the user is connected to a wallet.
 * @param {Function} onSuccessCallback - Callback function to execute on success.
 * @returns {Object} - Object containing the handleCancelListingClick function and delisting state.
 */
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

    // Function to handle transaction error
    const handleTransactionError = useCallback(
        (error) => {
            const userDenied = error.message.includes("User denied transaction signature")
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
    }, [closeNftNotification, showNftNotification, onSuccessCallback])

    // Function to handle transaction failure
    const handleTransactionFailure = useCallback(() => {
        setDelisting(false)
        closeNftNotification(whileCancelListingNotificationId.current)
        showNftNotification("Error", "Failed to delist the NFT.", "error")
    }, [closeNftNotification, showNftNotification])

    // Cleanup function to close notifications when the component unmounts or dependencies change
    useEffect(() => {
        return () => {
            closeNftNotification(confirmCancelListingNotificationId.current)
            closeNftNotification(whileCancelListingNotificationId.current)
        }
    }, [closeNftNotification])

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
            console.log("An error occurred during the transaction: ", error)
        }
    }, [isConnected, delisting, cancelListing, showNftNotification])

    // Update state based on transaction status
    useEffect(() => {
        if (isCancelTxLoading) handleTransactionLoading()
        else if (isCancelTxSuccess) handleTransactionSuccess()
        else if (isCancelTxError) handleTransactionFailure()
    }, [isCancelTxLoading, isCancelTxSuccess, isCancelTxError])

    useEffect(() => {
        // Cleanup function to close notifications when the component unmounts or dependencies change
    }, [closeNftNotification])

    return { handleCancelListingClick, delisting }
}
