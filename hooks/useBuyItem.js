import { useState, useEffect, useRef, useCallback } from "react"

import { useContractWrite, useWaitForTransaction } from "wagmi"

import { useModal } from "@context/ModalProvider"
import { useTransactionErrorHandler } from "./transactionErrorHandling/useTransactionErrorHandler"
import { useNotification } from "@context/NotificationProvider"
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

    const { showNotification, closeNotification } = useNotification()
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
        whilePurchaseNotificationId.current = showNotification(
            "Buying",
            "Transaction sent. Awaiting confirmation...",
            "info",
            true
        )
    }, [showNotification])

    const handleTransactionSuccess = useCallback(() => {
        const modalId = "nftBoughtModal-" + `${modalContent.nftAddress}${modalContent.tokenId}`
        const nftKey = {
            nftAddress: modalContent.nftAddress,
            tokenId: modalContent.tokenId,
        }

        console.log("NFT key", nftKey)
        setBuying(false)
        closeNotification(whilePurchaseNotificationId.current)
        showNotification("Success", "Purchase successful", "success")
        onSuccessCallback?.()
        setPolling(false)
        openModal("bought", modalId, nftKey)
    }, [closeNotification, showNotification, onSuccessCallback])

    const handleTransactionFailure = useCallback(() => {
        setBuying(false)
        closeNotification(whilePurchaseNotificationId.current)
        showNotification("Error", "Failed to purchase the NFT.", "error")
        setPolling(false) // Stop polling on failure
    }, [closeNotification, showNotification])

    const { data: buyItemData, writeAsync: buyItem } = useContractWrite({
        address: marketplaceAddress,
        abi: nftMarketplaceAbi,
        functionName: "buyItem",
        value: price,
        args: [nftAddress, tokenId],
        onSuccess: (data) => {
            setBuyTxHash(data.hash)
            closeNotification(confirmPurchaseNotificationId.current)
        },
        onError: (error) => {
            console.error("Buy item error", error)
            setBuying(false)
            handleTransactionError(error)
            closeNotification(confirmPurchaseNotificationId.current)
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
            showNotification("Connect wallet", "Connect your wallet to buy items!", "info")
            return
        }
        if (buying) {
            showNotification(
                "Buying",
                "A purchase is already in progress! Check your wallet!",
                "error"
            )
            return
        }
        setBuying(true)
        confirmPurchaseNotificationId.current = showNotification(
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
    }, [isConnected, buying, formattedPrice, buyItem, showNotification])

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
            closeNotification(confirmPurchaseNotificationId.current)
            closeNotification(whilePurchaseNotificationId.current)
        }
    }, [closeNotification])

    return { handleBuyClick, buying }
}
