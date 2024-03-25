// React and Hooks imports
import { useState, useEffect, useRef, useCallback } from "react"

// wagmi (Ethereum React hooks) imports
import { useContractWrite, useWaitForTransaction } from "wagmi"

// Custom hooks and utility imports
import { useTransactionErrorHandler } from "./transactionErrorHandling/useTransactionErrorHandler"

import { useNftNotification } from "@context/NotificationProvider"
import nftMarketplaceAbi from "@constants/NftMarketplace.json"

/**
 * Custom hook for handling NFT listing on a marketplace.
 * Organizes the process of listing an NFT, handling UI notifications and transaction states.
 *
 * @param {string} marketplaceAddress - Address of the marketplace contract.
 * @param {string} nftAddress - Address of the NFT contract.
 * @param {string} tokenId - Token ID of the NFT.
 * @param {number} price - Listing price.
 * @param {string} desiredNftAddress - Address of the desired NFT contract for swap.
 * @param {string} desiredTokenId - Token ID of the desired NFT for swap.
 * @param {Function} onSuccessCallback - Callback function on successful listing.
 * @returns {Function} A function to initiate listing an NFT.
 */
export const useListItem = (
    marketplaceAddress,
    nftAddress,
    tokenId,
    price,
    desiredNftAddress,
    desiredTokenId,
    checkboxData,
    onSuccessCallback
) => {
    // State for transaction hash and listing status
    const [listItemTxHash, setListItemTxHash] = useState(null)
    const [listing, setListing] = useState(false)
    console.log("Checkbox Data", checkboxData)
    // Custom notification hook to show transaction status
    const { showNftNotification, closeNftNotification } = useNftNotification()

    // Refs to store notification ids
    const confirmListingNotificationId = useRef(null)
    const whileListingNotificationId = useRef(null)

    // Define a state for polling interval
    const [polling, setPolling] = useState(false)

    // Function to check the transaction status
    const checkTransactionStatus = async () => {
        try {
            const receipt = await web3Provider.getTransactionReceipt(listItemTxHash)
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
    //        const nftNotApproved = error.message.includes("not approved")
    //        showNftNotification(
    //            userDenied
    //                ? "Transaction Rejected"
    //                : userDontOwn
    //                ? "Transaction Rejected"
    //                : nftNotApproved
    //                ? "Transaction Rejected"
    //                : "Error",
    //            userDenied
    //                ? "You rejected the transaction."
    //                : userDontOwn
    //                ? "You don't own the desired NFT for swap"
    //                : nftNotApproved
    //                ? "The NFT was not succesfully approved"
    //                : error.message || "Failed to buy the NFT.",
    //            userDenied || userDontOwn || nftNotApproved ? "error" : "error"
    //        )
    //    },
    //    [showNftNotification]
    //)

    // Function to handle transaction loading
    const handleTransactionLoading = useCallback(() => {
        whileListingNotificationId.current = showNftNotification(
            "Listing",
            "Transaction sent. Awaiting confirmation...",
            "info",
            true
        )
    }, [showNftNotification])

    // Function to handle transaction success
    const handleTransactionSuccess = useCallback(() => {
        setListing(false)
        closeNftNotification(whileListingNotificationId.current)
        showNftNotification("Success", "Listing successful", "success")
        console.log("List item data", listItemData, "List item receipt", listItemTxReceipt)
        onSuccessCallback?.()
        setPolling(false) // Stop polling on success
    }, [closeNftNotification, showNftNotification, onSuccessCallback])

    // Function to handle transaction failure
    const handleTransactionFailure = useCallback(() => {
        setListing(false)
        closeNftNotification(whileListingNotificationId.current)
        showNftNotification("Error", "Failed to list the NFT.", "error")
        setPolling(false) // Stop polling on failure
    }, [closeNftNotification, showNftNotification])

    // Write contract function to list item
    const { data: listItemData, writeAsync: listItem } = useContractWrite({
        address: marketplaceAddress,
        abi: nftMarketplaceAbi,
        functionName: "listItem",
        args: [nftAddress, tokenId, price, desiredNftAddress, desiredTokenId],
        onSuccess: (data) => {
            console.log("List Item send: ", data)
            closeNftNotification(confirmListingNotificationId.current)
            setListItemTxHash(data.hash)
        },
        onError: (error) => {
            console.log("List item error: ", error)
            setListing(false)
            handleTransactionError(error)
            closeNftNotification(confirmListingNotificationId.current)
        },
    })

    const {
        data: listItemTxReceipt,
        isLoading: isListItemTxLoading,
        isSuccess: isListItemTxSuccess,
        isError: isListItemTxError,
    } = useWaitForTransaction({
        hash: listItemTxHash,
    })

    const handleListItem = useCallback(async () => {
        try {
            setListing(true)
            confirmListingNotificationId.current = showNftNotification(
                "Check your wallet",
                "Confirm listing...",
                "info",
                true
            )
            await listItem()
            setPolling(true) // Start polling after initiating the transaction
        } catch (error) {
            // This will handle any errors that are not caught by the onError callback
            console.error("An error occurred during the transaction: ", error)
        }
    }, [listItem, nftAddress, tokenId, price, desiredNftAddress, desiredTokenId])

    // Update state based on transaction status
    useEffect(() => {
        if (isListItemTxLoading) handleTransactionLoading()
        else if (isListItemTxSuccess) handleTransactionSuccess()
        else if (isListItemTxError) handleTransactionFailure()
    }, [isListItemTxLoading, isListItemTxSuccess, isListItemTxError])

    // Cleanup function to close notifications when the component unmounts or dependencies change
    useEffect(() => {
        return () => {
            closeNftNotification(confirmListingNotificationId.current)
            closeNftNotification(whileListingNotificationId.current)
        }
    }, [closeNftNotification])

    return { handleListItem, listing }
}
