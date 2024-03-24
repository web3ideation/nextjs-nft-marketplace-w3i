// React and Hooks imports
import { useState, useEffect, useRef, useCallback } from "react"

// Ethereum blockchain and smart contract imports
import { erc721ABI, useContractWrite, useWaitForTransaction } from "wagmi"

// Custom hooks and utility imports
import { useTransactionErrorHandler } from "./transactionErrorHandling/useTransactionErrorHandler"
import { useNftNotification } from "@context/NotificationProvider"

/**
 * Custom hook for managing the NFT approval process.
 * @param {string} nftAddress - The address of the NFT.
 * @param {string} marketplaceAddress - The marketplace's address for approval.
 * @param {string} tokenId - The specific NFT's token ID.
 * @param {boolean} isConnected - Flag indicating if the user's wallet is connected.
 * @param {function} onSuccessCallback - Callback to execute on successful approval.
 * @returns {object} An object containing the handleApprove function and the transaction receipt.
 */

export const useRawApprove = (
    nftAddress,
    marketplaceAddress,
    tokenId,
    isConnected,
    onSuccessCallback
) => {
    // State to track the transaction hash and approving status
    const [approvingTxHash, setApprovingTxHash] = useState(null)
    const [approving, setApproving] = useState(false)

    // Custom notification hook to show transaction status
    const { showNftNotification, closeNftNotification } = useNftNotification()

    // Refs to store notification ids
    const confirmApprovingNotificationId = useRef(null)
    const whileApprovingNotificationId = useRef(null)

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

    const { handleTransactionError } = useTransactionErrorHandler()

    // Callback to handle transaction error
    //const handleTransactionError = useCallback(
    //    (error) => {
    //        const userDenied = error.message.includes("User denied transaction signature")
    //        const userDontOwn = error.message.includes("You don't own the desired NFT for swap")
    //        showNftNotification(
    //            userDenied
    //                ? "Transaction Rejected"
    //                : userDontOwn
    //                ? "Transaction Rejected"
    //                : "Error",
    //            userDenied
    //                ? "You rejected the transaction."
    //                : userDontOwn
    //                ? "You don't own the desired NFT for swap"
    //                : error.message || "Failed to buy the NFT.",
    //            userDenied || userDontOwn ? "error" : "error"
    //        )
    //    },
    //    [showNftNotification]
    //)

    // Function to handle transaction loading
    const handleTransactionLoading = useCallback(() => {
        whileApprovingNotificationId.current = showNftNotification(
            "Approving",
            "Approval sent. Awaiting confirmation...",
            "info",
            true
        )
    }, [showNftNotification])

    // Function to handle transaction success
    const handleTransactionSuccess = useCallback(() => {
        setApproving(false)
        closeNftNotification(whileApprovingNotificationId.current)
        showNftNotification("Success", "Approving successful", "success")
        console.log(
            "Approving item data",
            approvingItemData,
            "Approving item receipt",
            approvingTxReceipt
        )
        onSuccessCallback?.()
        setPolling(false) // Stop polling on success
    }, [closeNftNotification, showNftNotification, onSuccessCallback])

    // Function to handle transaction failure
    const handleTransactionFailure = useCallback(() => {
        setApproving(false)
        closeNftNotification(whileApprovingNotificationId.current)
        showNftNotification("Error", "Failed to approve the NFT.", "error")
        setPolling(false) // Stop polling on failure
    }, [closeNftNotification, showNftNotification])

    const { data: approvingItemData, writeAsync: approveItem } = useContractWrite({
        address: nftAddress,
        abi: erc721ABI,
        functionName: "approve",
        args: [marketplaceAddress, tokenId],
        onSuccess: (data) => {
            console.log("Approve item send", data)
            setApprovingTxHash(data.hash)
            closeNftNotification(confirmApprovingNotificationId.current)
        },
        onError: (error) => {
            console.log("Approve item error", error)
            setApproving(false)
            handleTransactionError(error)
            closeNftNotification(confirmApprovingNotificationId.current)
        },
    })

    // Wait for transaction confirmation
    const {
        data: approvingTxReceipt,
        isLoading: isApprovingTxLoading,
        isSuccess: isApprovingTxSuccess,
        isError: isApprovingTxError,
    } = useWaitForTransaction({
        hash: approvingTxHash,
    })

    const handleApproveItem = useCallback(async () => {
        console.log(
            "Starting approval process for tokenId:",
            tokenId,
            "to address:",
            marketplaceAddress
        )
        console.log("IS cOnnected", isConnected)
        if (!isConnected) {
            showNftNotification(
                "Connect wallet",
                "Connect your wallet to approve and list!",
                "info"
            )
            return
        }
        if (approving) {
            showNftNotification(
                "Approving",
                "An approval is already in progress! Check your wallet!",
                "error"
            )
            return
        }
        setApproving(true)
        confirmApprovingNotificationId.current = showNftNotification(
            "Check your wallet",
            "Confirm approving...",
            "info",
            true
        )
        try {
            await approveItem()
            setPolling(true) // Start polling after initiating the transaction
        } catch (error) {
            // This will handle any errors that are not caught by the onError callback
            console.log("An error occurred during the transaction: ", error)
            console.log("Current values:", { nftAddress, marketplaceAddress, tokenId })
        }
    }, [approveItem, nftAddress, marketplaceAddress, tokenId, isConnected])

    // Update state based on transaction status
    useEffect(() => {
        if (isApprovingTxLoading) handleTransactionLoading()
        else if (isApprovingTxSuccess) handleTransactionSuccess()
        else if (isApprovingTxError) handleTransactionFailure()
    }, [isApprovingTxLoading, isApprovingTxSuccess, isApprovingTxError])

    // Cleanup function to close notifications when the component unmounts or dependencies change
    useEffect(() => {
        return () => {
            closeNftNotification(confirmApprovingNotificationId.current)
            closeNftNotification(whileApprovingNotificationId.current)
        }
    }, [closeNftNotification])

    return { handleApproveItem, isApprovingTxSuccess, approving }
}
