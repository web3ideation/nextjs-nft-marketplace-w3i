import { useState, useEffect, useRef, useCallback } from "react"

import { useContractWrite, useWaitForTransaction } from "wagmi"

import { useModal } from "@context/ModalProvider"
import { useTransactionErrorHandler } from "./transactionErrorHandling/useTransactionErrorHandler"
import { useNftNotification } from "@context/NotificationProvider"
import nftMarketplaceAbi from "@constants/NftMarketplace.json"

export const useBuyItem = (
    marketplaceAddress,
    price,
    nftAddress,
    tokenId,
    isConnected,
    formattedPrice,
    onSuccessCallback
) => {
    const [buyTxHash, setBuyTxHash] = useState(null)
    const [buying, setBuying] = useState(false)

    const { showNftNotification, closeNftNotification } = useNftNotification()
    const { openModal, modalContent, modalType, closeModal, currentModalId } = useModal()

    const confirmPurchaseNotificationId = useRef(null)
    const whilePurchaseNotificationId = useRef(null)

    const [polling, setPolling] = useState(false)

    const checkTransactionStatus = async () => {
        try {
            const receipt = await web3Provider.getTransactionReceipt(buyTxHash)
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
            interval = setInterval(checkTransactionStatus, 2500)
        }
        return () => clearInterval(interval)
    }, [polling])

    const { handleTransactionError } = useTransactionErrorHandler()

    const handleTransactionLoading = useCallback(() => {
        whilePurchaseNotificationId.current = showNftNotification(
            "Buying",
            "Transaction sent. Awaiting confirmation...",
            "info",
            true
        )
    }, [showNftNotification])

    const handleTransactionSuccess = useCallback(() => {
        const modalId = "nftBoughtModal-" + `${modalContent.nftAddress}${modalContent.tokenId}`
        const nftKey = {
            nftAddress: modalContent.nftAddress,
            tokenId: modalContent.tokenId,
        }

        console.log("NFT key", nftKey)
        setBuying(false)
        closeNftNotification(whilePurchaseNotificationId.current)
        showNftNotification("Success", "Purchase successful", "success")
        onSuccessCallback?.()
        setPolling(false)
        openModal("bought", modalId, nftKey)
    }, [closeNftNotification, showNftNotification, onSuccessCallback])

    const handleTransactionFailure = useCallback(() => {
        setBuying(false)
        closeNftNotification(whilePurchaseNotificationId.current)
        showNftNotification("Error", "Failed to purchase the NFT.", "error")
        setPolling(false) // Stop polling on failure
    }, [closeNftNotification, showNftNotification])

    const { data: buyItemData, writeAsync: buyItem } = useContractWrite({
        address: marketplaceAddress,
        abi: nftMarketplaceAbi,
        functionName: "buyItem",
        value: price,
        args: [nftAddress, tokenId],
        onSuccess: (data) => {
            setBuyTxHash(data.hash)
            closeNftNotification(confirmPurchaseNotificationId.current)
        },
        onError: (error) => {
            console.error("Buy item error", error)
            setBuying(false)
            handleTransactionError(error)
            closeNftNotification(confirmPurchaseNotificationId.current)
        },
    })

    const {
        data: buyTxReceipt,
        isLoading: isBuyTxLoading,
        isSuccess: isBuyTxSuccess,
        isError: isBuyTxError,
    } = useWaitForTransaction({
        hash: buyTxHash,
    })

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
            setPolling(true)
        } catch (error) {
            console.error("An error occurred during the transaction: ", error)
            setBuying(false)
        }
    }, [isConnected, buying, formattedPrice, buyItem, showNftNotification])

    useEffect(() => {
        if (isBuyTxLoading) handleTransactionLoading()
        else if (isBuyTxSuccess) handleTransactionSuccess()
        else if (isBuyTxError) handleTransactionFailure()
    }, [
        isBuyTxLoading,
        isBuyTxSuccess,
        isBuyTxError,
        handleTransactionLoading,
        handleTransactionSuccess,
        handleTransactionFailure,
    ])

    useEffect(() => {
        return () => {
            closeNftNotification(confirmPurchaseNotificationId.current)
            closeNftNotification(whilePurchaseNotificationId.current)
        }
    }, [closeNftNotification])

    return { handleBuyClick, buying }
}
