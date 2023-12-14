import { useState, useEffect, useRef, useCallback } from "react"
import { useContractWrite, useWaitForTransaction } from "wagmi"
import { useNftNotification } from "../context/NFTNotificationContext"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"

// !!!N I have to bring the notification back in nftBox, just define transaction status here

export const useBuyItem = (
    marketplaceAddress,
    price,
    nftAddress,
    tokenId,
    isConnected,
    onSuccessCallback
) => {
    const [buyTxHash, setBuyTxHash] = useState(null)
    const [buying, setBuying] = useState(false)
    const { showNftNotification, closeNftNotification } = useNftNotification()

    const confirmPurchaseNotificationId = useRef(null)
    const whilePurchaseNotificationId = useRef(null)

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

    // Update state based on transaction status
    useEffect(() => {
        if (isBuyTxLoading) {
            handleTransactionLoading()
        } else if (isBuyTxSuccess) {
            handleTransactionSuccess()
        } else if (isBuyTxError) {
            handleTransactionFailure()
        }
    }, [isBuyTxLoading, isBuyTxSuccess, isBuyTxError])

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
            "Confirm purchase...",
            "info",
            true
        )
        try {
            await buyItem()
        } catch (error) {
            console.error("An error occurred during the transaction: ", error)
        }
    }, [isConnected, buying, buyItem])

    // Function to handle transaction error
    const handleTransactionError = useCallback(
        (error) => {
            if (error.message.includes("User denied transaction signature")) {
                // for user rejected transaction
                showNftNotification(
                    "Transaction Rejected",
                    "You rejected the transaction.",
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
    }, [closeNftNotification, showNftNotification, onSuccessCallback])

    // Function to handle transaction failure
    const handleTransactionFailure = useCallback(() => {
        setBuying(false)
        closeNftNotification(whilePurchaseNotificationId.current)
        showNftNotification("Error", "Failed to purchase the NFT.", "error")
    }, [closeNftNotification, showNftNotification])

    // Cleanup function to close notifications when the component unmounts or dependencies change
    useEffect(() => {
        return () => {
            closeNftNotification(confirmPurchaseNotificationId.current)
            closeNftNotification(whilePurchaseNotificationId.current)
        }
    }, [closeNftNotification])

    return { handleBuyClick, buying }
}
