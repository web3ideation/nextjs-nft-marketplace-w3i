import { useState, useEffect, useRef, useCallback } from "react"

import { erc721ABI, useContractWrite, useWaitForTransaction } from "wagmi"

import { useTransactionErrorHandler } from "./transactionErrorHandling/useTransactionErrorHandler"
import { useNftNotification } from "@context/NotificationProvider"

export const useRawApprove = (
    nftAddress,
    marketplaceAddress,
    tokenId,
    isConnected,
    onSuccessCallback
) => {
    const [approvingTxHash, setApprovingTxHash] = useState(null)
    const [approving, setApproving] = useState(false)

    const { showNftNotification, closeNftNotification } = useNftNotification()

    const confirmApprovingNotificationId = useRef(null)
    const whileApprovingNotificationId = useRef(null)

    const [polling, setPolling] = useState(false)

    const checkTransactionStatus = async () => {
        try {
            const receipt = await web3Provider.getTransactionReceipt(updateListingTxHash)
            if (receipt) {
                handleTransactionSuccess()
                setPolling(false)
            }
        } catch (error) {
            console.error("Error fetching transaction receipt: ", error)
        }
    }

    useEffect(() => {
        let interval
        if (polling) {
            interval = setInterval(checkTransactionStatus, 2500) // Poll every 5 seconds
        }
        return () => clearInterval(interval) // Cleanup
    }, [polling])

    const { handleTransactionError } = useTransactionErrorHandler()

    const handleTransactionLoading = useCallback(() => {
        whileApprovingNotificationId.current = showNftNotification(
            "Approving",
            "Approval sent. Awaiting confirmation...",
            "info",
            true
        )
    }, [showNftNotification])

    const handleTransactionSuccess = useCallback(() => {
        setApproving(false)
        closeNftNotification(whileApprovingNotificationId.current)
        showNftNotification("Success", "Approving successful", "success")
        onSuccessCallback?.()
        setPolling(false)
    }, [closeNftNotification, showNftNotification, onSuccessCallback])

    const handleTransactionFailure = useCallback(() => {
        setApproving(false)
        closeNftNotification(whileApprovingNotificationId.current)
        showNftNotification("Error", "Failed to approve the NFT.", "error")
        setPolling(false)
    }, [closeNftNotification, showNftNotification])

    const { data: approvingItemData, writeAsync: approveItem } = useContractWrite({
        address: nftAddress,
        abi: erc721ABI,
        functionName: "approve",
        args: [marketplaceAddress, tokenId],
        onSuccess: (data) => {
            setApprovingTxHash(data.hash)
            closeNftNotification(confirmApprovingNotificationId.current)
        },
        onError: (error) => {
            console.error("Approve item error", error)
            setApproving(false)
            handleTransactionError(error)
            closeNftNotification(confirmApprovingNotificationId.current)
        },
    })

    const {
        data: approvingTxReceipt,
        isLoading: isApprovingTxLoading,
        isSuccess: isApprovingTxSuccess,
        isError: isApprovingTxError,
    } = useWaitForTransaction({
        hash: approvingTxHash,
    })

    const handleApproveItem = useCallback(async () => {
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
            setPolling(true)
        } catch (error) {
            console.error("An error occurred during the transaction: ", error)
        }
    }, [approveItem, nftAddress, marketplaceAddress, tokenId, isConnected])

    useEffect(() => {
        if (isApprovingTxLoading) handleTransactionLoading()
        else if (isApprovingTxSuccess) handleTransactionSuccess()
        else if (isApprovingTxError) handleTransactionFailure()
    }, [isApprovingTxLoading, isApprovingTxSuccess, isApprovingTxError])

    useEffect(() => {
        return () => {
            closeNftNotification(confirmApprovingNotificationId.current)
            closeNftNotification(whileApprovingNotificationId.current)
        }
    }, [closeNftNotification])

    return { handleApproveItem, isApprovingTxSuccess, approving }
}
