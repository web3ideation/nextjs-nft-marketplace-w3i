import { useState, useEffect, useRef, useCallback } from "react"

import { useContractWrite, useWaitForTransaction } from "wagmi"

import { useTransactionErrorHandler } from "./transactionErrorHandling/useTransactionErrorHandler"
import { useNotification } from "@context/NotificationProvider"

import nftMarketplaceAbi from "@constants/NftMarketplace.json"

export const useWithdrawProceeds = (marketplaceAddress, isConnected, onSuccessCallback) => {
    const [withdrawTxHash, setWithdrawTxHash] = useState(null)
    const [withdrawl, setWithdrawl] = useState(false)

    const { showNotification, closeNotification } = useNotification()

    const confirmWithdrawlProceedsNotificationId = useRef(null)
    const whileWithdrawlProceedsNotificationId = useRef(null)

    const [polling, setPolling] = useState(false)

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

    useEffect(() => {
        let interval
        if (polling) {
            interval = setInterval(checkTransactionStatus, 2500) // Poll every 5 seconds
        }
        return () => clearInterval(interval) // Cleanup
    }, [polling])

    const { handleTransactionError } = useTransactionErrorHandler()

    const handleTransactionLoading = useCallback(() => {
        whileWithdrawlProceedsNotificationId.current = showNotification(
            "Withdrawl",
            "Transaction sent. Awaiting confirmation...",
            "info",
            true
        )
    }, [showNotification])

    const handleTransactionSuccess = useCallback(() => {
        setWithdrawl(false)
        closeNotification(whileWithdrawlProceedsNotificationId.current)
        showNotification("Withdrawn", "Proceeds successfully withdrawn", "success")
        onSuccessCallback?.()
        setPolling(false)
    }, [closeNotification, showNotification, onSuccessCallback])

    const handleTransactionFailure = useCallback(() => {
        setWithdrawl(false)
        closeNotification(whileWithdrawlProceedsNotificationId.current)
        showNotification("Error", "Failed to withdraw proceeds.", "error")
        setPolling(false)
    }, [closeNotification, showNotification])

    const { data: withdrawData, writeAsync: withdrawProceeds } = useContractWrite({
        address: marketplaceAddress,
        abi: nftMarketplaceAbi,
        functionName: "withdrawProceeds",
        onSuccess: (data) => {
            setWithdrawTxHash(data.hash)
            closeNotification(confirmWithdrawlProceedsNotificationId.current)
        },
        onError: (error) => {
            console.error("Error sending withdrawal:", error)
            setWithdrawl(false)
            handleTransactionError(error)
            closeNotification(confirmWithdrawlProceedsNotificationId.current)
        },
    })

    const {
        data: withdrawTxReceipt,
        isLoading: isWithdrawTxLoading,
        isSuccess: isWithdrawTxSuccess,
        isError: isWithdrawTxError,
    } = useWaitForTransaction({
        hash: withdrawTxHash,
    })

    const handleWithdrawProceeds = useCallback(async () => {
        if (!isConnected) {
            showNotification("Connect wallet", "Connect your wallet to withdraw proceeds!", "info")
            return
        }
        if (withdrawl) {
            showNotification(
                "Withdrawl",
                "A withdrawl is already in progress! Check your wallet!",
                "error"
            )
            return
        }
        setWithdrawl(true)
        confirmWithdrawlProceedsNotificationId.current = showNotification(
            "Check your wallet",
            "Confirm withdrawl...",
            "info",
            true
        )
        try {
            await withdrawProceeds()
            setPolling(true)
        } catch (error) {
            console.error("An error occurred during the transaction: ", error)
        }
    }, [withdrawProceeds, isConnected, withdrawl, showNotification])

    useEffect(() => {
        if (isWithdrawTxLoading) handleTransactionLoading()
        else if (isWithdrawTxSuccess) handleTransactionSuccess()
        else if (isWithdrawTxError) handleTransactionFailure()
    }, [isWithdrawTxLoading, isWithdrawTxSuccess, isWithdrawTxError])

    useEffect(() => {
        return () => {
            closeNotification(confirmWithdrawlProceedsNotificationId.current)
            closeNotification(whileWithdrawlProceedsNotificationId.current)
        }
    }, [closeNotification])

    return { handleWithdrawProceeds, withdrawl, isWithdrawTxSuccess }
}
