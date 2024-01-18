// React Imports
import { useState, useEffect, useRef, useCallback } from "react"

// Ethereum blockchain and smart contract imports
import { useContractWrite, useWaitForTransaction } from "wagmi"

// Custom hooks
import { useNftNotification } from "../context/NotificationProvider"

// Constants Imports
import nftMarketplaceAbi from "../constants/NftMarketplace.json"

/**
 * Custom hook to handle the update listing process of an NFT.
 * @param {string} marketplaceAddress - The marketplace smart contract address.
 * @param {boolean} isConnected - Whether the user is connected to a wallet.
 * @param {Function} onSuccessCallback - Callback function to execute on success.
 * @returns {Object} - Object containing the handleUpdateListing function and updating state.
 */

export const useWithdrawProceeds = (marketplaceAddress, isConnected, onSuccessCallback) => {
    // State to track the transaction hash and update listing status
    const [withdrawTxHash, setWithdrawTxHash] = useState(null)
    const [withdrawl, setWithdrawl] = useState(false)

    // Custom notification hook to show transaction status
    const { showNftNotification, closeNftNotification } = useNftNotification()

    // Refs to store notification ids
    const confirmWithdrawlProceedsNotificationId = useRef(null)
    const whileWithdrawlProceedsNotificationId = useRef(null)

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
                    : error.message || "Failed to withdraw proceeds.",
                "error"
            )
        },
        [showNftNotification]
    )

    // Function to handle transaction loading
    const handleTransactionLoading = useCallback(() => {
        whileWithdrawlProceedsNotificationId.current = showNftNotification(
            "Withdrawl",
            "Transaction sent. Awaiting confirmation...",
            "info",
            true
        )
    }, [showNftNotification])

    // Function to handle transaction success
    const handleTransactionSuccess = useCallback(() => {
        setWithdrawl(false)
        closeNftNotification(whileWithdrawlProceedsNotificationId.current)
        showNftNotification("Withdrawn", "Proceeds successfully withdrawn", "success")
        console.log("Withdrawl data", withdrawData, "Withdraw receipt", withdrawTxReceipt)
        onSuccessCallback?.()
        setPolling(false) // Stop polling on success
    }, [closeNftNotification, showNftNotification, onSuccessCallback])

    // Function to handle transaction failure
    const handleTransactionFailure = useCallback(() => {
        setWithdrawl(false)
        closeNftNotification(whileWithdrawlProceedsNotificationId.current)
        showNftNotification("Error", "Failed to withdraw proceeds.", "error")
        setPolling(false) // Stop polling on failure
    }, [closeNftNotification, showNftNotification])

    // Define the smart contract function to update the listing
    const { data: withdrawData, writeAsync: withdrawProceeds } = useContractWrite({
        address: marketplaceAddress,
        abi: nftMarketplaceAbi,
        functionName: "withdrawProceeds",
        onSuccess: (data) => {
            console.log("Withdrawl send success: ", data)
            setWithdrawTxHash(data.hash)
            closeNftNotification(confirmWithdrawlProceedsNotificationId.current)
        },
        onError: (error) => {
            console.error("Error sending withdrawal:", error)
            setWithdrawl(false)
            handleTransactionError(error)
            closeNftNotification(confirmWithdrawlProceedsNotificationId.current)
        },
        // add args on call
    })

    const {
        data: withdrawTxReceipt,
        isLoading: isWithdrawTxLoading,
        isSuccess: isWithdrawTxSuccess,
        isError: isWithdrawTxError,
    } = useWaitForTransaction({
        hash: withdrawTxHash,
    })

    // Validate the input before updating the listing
    const handleWithdrawProceeds = useCallback(async () => {
        if (!isConnected) {
            showNftNotification(
                "Connect wallet",
                "Connect your wallet to withdraw proceeds!",
                "info"
            )
            return
        }
        if (withdrawl) {
            showNftNotification(
                "Withdrawl",
                "A withdrawl is already in progress! Check your wallet!",
                "error"
            )
            return
        }
        setWithdrawl(true)
        confirmWithdrawlProceedsNotificationId.current = showNftNotification(
            "Check your wallet",
            "Confirm withdrawl...",
            "info",
            true
        )
        try {
            await withdrawProceeds()
            setPolling(true) // Start polling after initiating the transaction
        } catch (error) {
            // This will handle any errors that are not caught by the onError callback
            console.log("An error occurred during the transaction: ", error)
        }
    }, [withdrawProceeds, isConnected, withdrawl, showNftNotification])

    // Update state based on transaction status
    useEffect(() => {
        if (isWithdrawTxLoading) handleTransactionLoading()
        else if (isWithdrawTxSuccess) handleTransactionSuccess()
        else if (isWithdrawTxError) handleTransactionFailure()
    }, [isWithdrawTxLoading, isWithdrawTxSuccess, isWithdrawTxError])

    // Cleanup function to close notifications when the component unmounts or dependencies change
    useEffect(() => {
        return () => {
            closeNftNotification(confirmWithdrawlProceedsNotificationId.current)
            closeNftNotification(whileWithdrawlProceedsNotificationId.current)
        }
    }, [closeNftNotification])

    return { handleWithdrawProceeds, withdrawl, isWithdrawTxSuccess }
}
