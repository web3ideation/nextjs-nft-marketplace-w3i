import { useState, useCallback } from "react"
import { ethers } from "ethers"
import { useContractWrite, useWaitForTransaction } from "wagmi"
import { marketplaceAbi } from "@constants"
import { useTransactionHandlers, useTransactionStatus } from "@hooks"

export const useUpdateListing = (
    marketplaceAddress,
    nftAddress,
    tokenId,
    price,
    newPrice,
    newDesiredNftAddress,
    newDesiredTokenId,
    onSuccessCallback
) => {
    const {
        handleTransactionError,
        handleTransactionFailure,
        checkWalletConnection,
        transactionInProgress,
    } = useTransactionHandlers()

    const [updateListingTxHash, setUpdateListingTxHash] = useState(null)
    const newPriceInEther =
        newPrice && !isNaN(newPrice)
            ? ethers.utils.parseEther(
                  Number(newPrice).toFixed(18).replace(",", ".") // Stelle sicher, dass max. 18 Dezimalstellen und Punkt als Trennzeichen genutzt werden
              )
            : ethers.BigNumber.from("0")
    const {
        writeAsync: updateListing,
        status: updateListingStatus,
        error: updateListingStatusError,
    } = useContractWrite({
        address: marketplaceAddress,
        abi: marketplaceAbi,
        functionName: "updateListing",
        args: [nftAddress, tokenId, newPriceInEther, newDesiredNftAddress, newDesiredTokenId],
        onSuccess: (data) => {
            setUpdateListingTxHash(data.hash)
        },
        onError: (error) => {
            console.error("Update listing send error: ", error)
            handleTransactionError(error)
            handleTransactionFailure("updateListing")
        },
    })

    const { status: waitUpdateListingStatus, error: waitUpdateListingStatusError } =
        useWaitForTransaction({
            hash: updateListingTxHash,
            onError: (error) => {
                handleTransactionError(error)
                handleTransactionFailure("updateListing")
            },
        })

    useTransactionStatus({
        status: updateListingStatus,
        statusError: updateListingStatusError,
        waitStatus: waitUpdateListingStatus,
        waitStatusError: waitUpdateListingStatusError,
        type: "updateListing",
        tokenId,
        nftAddress,
        price,
        newPrice,
        newDesiredNftAddress,
        newDesiredTokenId,
        onSuccessCallback,
    })

    const handleUpdateListing = useCallback(async () => {
        if (!checkWalletConnection("updateListing")) return
        if (transactionInProgress("updateListing", updateListingStatus === "loading")) return

        try {
            await updateListing()
        } catch (error) {
            console.error("An error occurred during the transaction: ", error)
        }
    }, [checkWalletConnection, transactionInProgress, updateListingStatus, updateListing])

    return { handleUpdateListing }
}
export default useUpdateListing
