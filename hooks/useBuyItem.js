// React and Hooks imports
import { useState, useEffect, useRef, useCallback } from "react"

// wagmi (Ethereum React hooks) imports
import { useContractWrite, useWaitForTransaction } from "wagmi"

// Custom hooks and utility imports
import { useNftNotification } from "@context/NotificationProvider"
import nftMarketplaceAbi from "@constants/NftMarketplace.json"

/**
 * Custom hook to handle the buying process of an NFT.
 * @param {string} marketplaceAddress - The marketplace smart contract address.
 * @param {string} price - The price of the NFT.
 * @param {string} nftAddress - The address of the NFT.
 * @param {number} tokenId - The token ID of the NFT.
 * @param {boolean} isConnected - Whether the user is connected to a wallet.
 * @param {Function} onSuccessCallback - Callback function to execute on success.
 * @returns {Object} - Object containing the handleBuyClick function and buying state.
 */
export const useBuyItem = (
    marketplaceAddress,
    price,
    nftAddress,
    tokenId,
    isConnected,
    formattedPrice,
    onSuccessCallback
) => {
    // State to track the transaction hash and buying status
    const [buyTxHash, setBuyTxHash] = useState(null)
    const [buying, setBuying] = useState(false)

    // Custom notification hook to show transaction status
    const { showNftNotification, closeNftNotification } = useNftNotification()

    // Refs to store notification ids
    const confirmPurchaseNotificationId = useRef(null)
    const whilePurchaseNotificationId = useRef(null)

    // Define a state for polling interval
    const [polling, setPolling] = useState(false)

    // Function to check the transaction status
    const checkTransactionStatus = async () => {
        try {
            const receipt = await web3Provider.getTransactionReceipt(buyTxHash)
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
            const userDontOwn = error.message.includes("You don't own the desired NFT for swap")
            const userNFTNotApproved = error.message.includes(
                "NftMarketplace__NotApprovedForMarketplace()"
            )
            showNftNotification(
                userDenied
                    ? "Transaction Rejected"
                    : userDontOwn
                    ? "Transaction Rejected"
                    : userNFTNotApproved
                    ? "NFT Not Approved"
                    : "Error",
                userDenied
                    ? "You rejected the transaction."
                    : userDontOwn
                    ? "You don't own the desired NFT for swap"
                    : userNFTNotApproved
                    ? "You own the NFT to swap but it is not approved for the marketplace. You need to list the NFT."
                    : error.message || "Failed to buy the NFT.",
                userDenied || userDontOwn ? "error" : "error"
            )
        },
        [showNftNotification]
    )

    // Function to handle transaction loading
    const handleTransactionLoading = useCallback(() => {
        whilePurchaseNotificationId.current = showNftNotification(
            "Buying",
            "Transaction sent. Awaiting confirmation...",
            "info",
            true
        )
    }, [showNftNotification])

    // Function to handle transaction success
    const handleTransactionSuccess = useCallback(() => {
        setBuying(false)
        closeNftNotification(whilePurchaseNotificationId.current)
        showNftNotification("Success", "Purchase successful", "success")
        console.log("Buy item data", buyItemData, "Buy item receipt", buyTxReceipt)
        onSuccessCallback?.()
        setPolling(false) // Stop polling on success
    }, [closeNftNotification, showNftNotification, onSuccessCallback])

    // Function to handle transaction failure
    const handleTransactionFailure = useCallback(() => {
        setBuying(false)
        closeNftNotification(whilePurchaseNotificationId.current)
        showNftNotification("Error", "Failed to purchase the NFT.", "error")
        setPolling(false) // Stop polling on failure
    }, [closeNftNotification, showNftNotification])

    // Function to initiate the buy transaction
    const { data: buyItemData, writeAsync: buyItem } = useContractWrite({
        address: marketplaceAddress,
        abi: nftMarketplaceAbi,
        functionName: "buyItem",
        value: price,
        args: [nftAddress, tokenId],
        onSuccess: (data) => {
            console.log("Buy item send", data)
            setBuyTxHash(data.hash)
            closeNftNotification(confirmPurchaseNotificationId.current)
        },
        onError: (error) => {
            console.log("Buy item error", error)
            setBuying(false)
            handleTransactionError(error)
            closeNftNotification(confirmPurchaseNotificationId.current)
        },
    })

    // Wait for transaction confirmation
    const {
        data: buyTxReceipt,
        isLoading: isBuyTxLoading,
        isSuccess: isBuyTxSuccess,
        isError: isBuyTxError,
    } = useWaitForTransaction({
        hash: buyTxHash,
    })

    // Function to handle the buy click
    const handleBuyClick = useCallback(async () => {
        if (!isConnected) {
            showNftNotification("Connect wallet", "Connect your wallet to buy items!", "info")
            return
        }
        if (buying) {
            showNftNotification(
                "Buying",
                "A purchase is already in progress! Check your wallet!",
                "error"
            )
            return
        }
        setBuying(true)
        confirmPurchaseNotificationId.current = showNftNotification(
            "Check your wallet",
            `Confirm purchase for ${formattedPrice} ETH excluding fees...`,
            "info",
            true
        )
        try {
            await buyItem()
            setPolling(true) // Start polling after initiating the transaction
        } catch (error) {
            // This will handle any errors that are not caught by the onError callback
            console.error("An error occurred during the transaction: ", error)
            setBuying(false)
        }
    }, [isConnected, buying, formattedPrice, buyItem, showNftNotification])

    // Update state based on transaction status
    useEffect(() => {
        if (isBuyTxLoading) handleTransactionLoading()
        else if (isBuyTxSuccess) handleTransactionSuccess()
        else if (isBuyTxError) handleTransactionFailure()
    }, [isBuyTxLoading, isBuyTxSuccess, isBuyTxError])

    // Cleanup function to close notifications when the component unmounts or dependencies change
    useEffect(() => {
        return () => {
            closeNftNotification(confirmPurchaseNotificationId.current)
            closeNftNotification(whilePurchaseNotificationId.current)
        }
    }, [closeNftNotification])

    return { handleBuyClick, buying }
}
