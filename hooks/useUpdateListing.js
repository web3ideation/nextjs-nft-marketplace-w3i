import { useState, useEffect, useRef, useCallback } from "react"
import { useContractWrite, useWaitForTransaction } from "wagmi"
import { useNftNotification } from "../context/NotificationProvider"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"

/**
 * Custom hook to handle the update listing process of an NFT.
 * @param {string} marketplaceAddress - The marketplace smart contract address.
 * @param {string} price - The price of the NFT.
 * @param {string} nftAddress - The address of the NFT.
 * @param {number} tokenId - The token ID of the NFT.
 * @param {string} newDesiredNftAddress - The new nftAddress for swap.
 * @param {number} newDesiredTokenId - The new tokenId for swap.
 * @param {boolean} isConnected - Whether the user is connected to a wallet.
 * @param {Function} onSuccessCallback - Callback function to execute on success.
 * @returns {Object} - Object containing the handleUpdateListing function and updating state.
 */

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
    // State to track the transaction hash and update listing status
    const [updateListingTxHash, setUpdateListingTxHash] = useState(null)
    const [updating, setUpdating] = useState(false)

    // Custom notification hook to show transaction status
    const { showNftNotification, closeNftNotification } = useNftNotification()

    // Refs to store notification ids
    const confirmUpdateListingNotificationId = useRef(null)
    const whileUpdatingListingNotificationId = useRef(null)

    // Define a state for polling interval
    const [polling, setPolling] = useState(false)

    // Function to check the transaction status
    const checkTransactionStatus = async () => {
        try {
            const receipt = await web3Provider.getTransactionReceipt(updateListingTxHash)
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

    // Callback to handle transaction error
    const handleTransactionError = useCallback(
        (error) => {
            const userDenied = error.message.includes("User denied transaction signature")
            showNftNotification(
                userDenied ? "Transaction Rejected" : "Error",
                userDenied
                    ? "You rejected the transaction."
                    : error.message || "Failed to update the NFT.",
                "error"
            )
        },
        [showNftNotification]
    )

    // Function to handle transaction loading
    const handleTransactionLoading = useCallback(() => {
        whileUpdatingListingNotificationId.current = showNftNotification(
            "Updating",
            "Transaction sent. Awaiting confirmation...",
            "info",
            true
        )
    }, [showNftNotification])

    // Function to handle transaction success
    const handleTransactionSuccess = useCallback(() => {
        setUpdating(false)
        closeNftNotification(whileUpdatingListingNotificationId.current)
        showNftNotification("Listing updated", "New price approved", "success")
        console.log(
            "Update listing data",
            updateListingData,
            "Update listing receipt",
            updateListingTxReceipt
        )
        onSuccessCallback?.()
        setPolling(false) // Stop polling on success
    }, [closeNftNotification, showNftNotification, onSuccessCallback])

    // Function to handle transaction failure
    const handleTransactionFailure = useCallback(() => {
        setUpdating(false)
        closeNftNotification(whileUpdatingListingNotificationId.current)
        showNftNotification("Error", "Failed to update the NFT.", "error")
        setPolling(false) // Stop polling on failure
    }, [closeNftNotification, showNftNotification])

    // Define the smart contract function to update the listing
    const { data: updateListingData, writeAsync: updateListing } = useContractWrite({
        address: marketplaceAddress,
        abi: nftMarketplaceAbi,
        functionName: "updateListing",
        args: [nftAddress, tokenId, newPrice, newDesiredNftAddress, newDesiredTokenId],
        onSuccess: (data) => {
            console.log("Update listing send: ", data)
            setUpdateListingTxHash(data.hash)
            closeNftNotification(confirmUpdateListingNotificationId.current)
        },
        onError: (error) => {
            console.log("Update listing send error: ", error)
            setUpdating(false)
            handleTransactionError(error)
            closeNftNotification(confirmUpdateListingNotificationId.current)
        },
    })

    // Wait for transaction confirmation
    const {
        data: updateListingTxReceipt,
        isLoading: isUpdateListingTxLoading,
        isSuccess: isUpdateListingTxSuccess,
        isError: isUpdateListingTxError,
    } = useWaitForTransaction({
        hash: updateListingTxHash,
    })

    // Validate the input before updating the listing
    const handleUpdateListing = useCallback(async () => {
        if (updating) {
            showNftNotification(
                "Updating",
                "A update is already in progress! Check your wallet!",
                "error"
            )
            return
        }
        setUpdating(true)
        confirmUpdateListingNotificationId.current = showNftNotification(
            "Check your wallet",
            "Confirm updating...",
            "info",
            true
        )
        try {
            await updateListing()
            setPolling(true) // Start polling after initiating the transaction
        } catch (error) {
            // This will handle any errors that are not caught by the onError callback
            console.log("An error occurred during the transaction: ", error)
        }
    }, [isConnected, updating, updateListing, showNftNotification])

    // Update state based on transaction status
    useEffect(() => {
        if (isUpdateListingTxLoading) {
            handleTransactionLoading()
        } else if (isUpdateListingTxSuccess) {
            handleTransactionSuccess()
        } else if (isUpdateListingTxError) {
            handleTransactionFailure()
        }
    }, [isUpdateListingTxLoading, isUpdateListingTxSuccess, isUpdateListingTxError])

    // Cleanup function to close notifications when the component unmounts or dependencies change
    useEffect(() => {
        return () => {
            closeNftNotification(confirmUpdateListingNotificationId.current)
            closeNftNotification(whileUpdatingListingNotificationId.current)
        }
    }, [closeNftNotification])

    return { handleUpdateListing, updating }
}
