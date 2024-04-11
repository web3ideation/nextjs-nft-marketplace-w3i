import { useState, useEffect, useRef, useCallback } from "react"

import { useContractWrite, useWaitForTransaction } from "wagmi"

import { useTransactionErrorHandler } from "./transactionErrorHandling/useTransactionErrorHandler"

import { useNftNotification } from "@context/NotificationProvider"
import nftMarketplaceAbi from "@constants/NftMarketplace.json"

export const useListItem = (
    marketplaceAddress,
    nftAddress,
    tokenId,
    price,
    desiredNftAddress,
    desiredTokenId,
    categories,
    onSuccessCallback
) => {
    const [listItemTxHash, setListItemTxHash] = useState(null)
    const [listing, setListing] = useState(false)
    const { showNftNotification, closeNftNotification } = useNftNotification()

    const confirmListingNotificationId = useRef(null)
    const whileListingNotificationId = useRef(null)

    const [polling, setPolling] = useState(false)

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

    useEffect(() => {
        let interval
        if (polling) {
            interval = setInterval(checkTransactionStatus, 2500)
        }
        return () => clearInterval(interval)
    }, [polling])

    const { handleTransactionError } = useTransactionErrorHandler()

    const handleTransactionLoading = useCallback(() => {
        whileListingNotificationId.current = showNftNotification(
            "Listing",
            "Transaction sent. Awaiting confirmation...",
            "info",
            true
        )
    }, [showNftNotification])

    const handleTransactionSuccess = useCallback(() => {
        setListing(false)
        closeNftNotification(whileListingNotificationId.current)
        showNftNotification("Success", "Listing successful", "success")
        onSuccessCallback?.()
        setPolling(false)
    }, [closeNftNotification, showNftNotification, onSuccessCallback])

    const handleTransactionFailure = useCallback(() => {
        setListing(false)
        closeNftNotification(whileListingNotificationId.current)
        showNftNotification("Error", "Failed to list the NFT.", "error")
        setPolling(false)
    }, [closeNftNotification, showNftNotification])

    const { data: listItemData, writeAsync: listItem } = useContractWrite({
        address: marketplaceAddress,
        abi: nftMarketplaceAbi,
        functionName: "listItem",
        args: [nftAddress, tokenId, price, desiredNftAddress, desiredTokenId],
        onSuccess: (data) => {
            closeNftNotification(confirmListingNotificationId.current)
            setListItemTxHash(data.hash)
        },
        onError: (error) => {
            console.error("List item error: ", error)
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
            setPolling(true)
        } catch (error) {
            console.error("An error occurred during the transaction: ", error)
        }
    }, [listItem, nftAddress, tokenId, price, desiredNftAddress, desiredTokenId])

    useEffect(() => {
        if (isListItemTxLoading) handleTransactionLoading()
        else if (isListItemTxSuccess) handleTransactionSuccess()
        else if (isListItemTxError) handleTransactionFailure()
    }, [isListItemTxLoading, isListItemTxSuccess, isListItemTxError])

    useEffect(() => {
        return () => {
            closeNftNotification(confirmListingNotificationId.current)
            closeNftNotification(whileListingNotificationId.current)
        }
    }, [closeNftNotification])

    return { handleListItem, listing }
}
