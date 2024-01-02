import { useState, useEffect, useRef, useCallback } from "react"
import { useContractWrite, useWaitForTransaction } from "wagmi"
import { useNftNotification } from "../context/NFTNotificationContext"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"
import { TokenKind } from "graphql"

export const useUpdateListing = (
    marketplaceAddress,
    nftAddress,
    tokenId,
    newPrice,
    newDesiredNftAddress,
    newDesiredTokenId,
    isConnected,
    onSuccessCallback
) => {
    const [updateListingTxHash, setUpdateListingTxHash] = useState(null)
    const [updating, setUpdating] = useState(false)
    const { showNftNotification, closeNftNotification } = useNftNotification()

    const confirmUpdateListingNotificationId = useRef(null)
    const whileUpdatingListingNotificationId = useRef(null)

    // Define the smart contract function to update the listing
    const { data: updateListingData, writeAsync: updateListing } = useContractWrite({
        address: marketplaceAddress,
        abi: nftMarketplaceAbi,
        functionName: "updateListing",
        args: [nftAddress, tokenId, newPrice, newDesiredNftAddress, newDesiredTokenId],
        onSuccess: (data) => {
            console.log("Update listing send: ", data)
            setUpdateListingTxHash(data.hash)
            closeNftNotification(confirmUpdateListingNotificationId.current)
        },
        onError: (error) => {
            console.log("Update Listing send error: ", error)
            setUpdating(false)
            handleTransactionError(error)
            closeNftNotification(confirmUpdateListingNotificationId.current)
        },
    })

    const {
        data: updateListingTxReceipt,
        isLoading: isUpdateListingTxLoading,
        isSuccess: isUpdateListingTxSuccess,
        isError: isUpdateListingTxError,
    } = useWaitForTransaction({
        hash: updateListingTxHash,
    })

    // Update state based on transaction status
    useEffect(() => {
        if (isUpdateListingTxLoading) {
            handleTransactionLoading()
        } else if (isUpdateListingTxSuccess) {
            handleTransactionSuccess()
        } else if (isUpdateListingTxError) {
            handleTransactionFailure()
        }
    }, [isUpdateListingTxLoading, isUpdateListingTxSuccess, isUpdateListingTxError])
}

// Validate the input before updating the listing
const validateAndUpdateListing = async () => {
    const isPriceValid = validateField("price", formState.formData.newPrice)
    const isAddressValid = validateField(
        "desiredNftAddress",
        formState.formData.newDesiredNftAddress
    )
    const isTokenIdValid = validateField("desiredTokenId", formState.formData.newDesiredTokenId)

    if (!isPriceValid || !isAddressValid || !isTokenIdValid) {
        return
    }

    if (updating) {
        showNftNotification(
            "Updating",
            "A update is already in progress! Check your wallet!",
            "error"
        )
        return
    }
    setUpdating(true)
    confirmUpdateListingNotificationId.current = showNftNotification(
        "Check your wallet",
        "Confirm updating...",
        "info",
        true
    )
    try {
        await updateListing()
    } catch (error) {
        // This will handle any errors that are not caught by the onError callback
        console.log("An error occurred during the transaction: ", error)
    }
}
