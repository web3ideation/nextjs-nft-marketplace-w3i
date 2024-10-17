import { useState, useCallback } from "react"
import { ethers } from "ethers"
import { useContractWrite, useWaitForTransaction } from "wagmi"
import { marketplaceAbi } from "@constants"
import { useTransactionHandlers, useTransactionStatus } from "@hooks"

const useListItem = (
    marketplaceAddress,
    nftAddress,
    tokenId,
    price,
    desiredNftAddress,
    desiredTokenId,
    categories,
    onSuccessCallback
) => {
    const {
        handleTransactionError,
        handleTransactionFailure,
        checkWalletConnection,
        transactionInProgress,
    } = useTransactionHandlers()

    const [listItemTxHash, setListItemTxHash] = useState(null)
    const priceInEther =
        price && !isNaN(price)
            ? ethers.utils.parseEther(price.toString().replace(",", "."))
            : ethers.BigNumber.from("0")

    const {
        writeAsync: listItem,
        status: listItemStatus,
        error: listItemStatusError,
    } = useContractWrite({
        address: marketplaceAddress,
        abi: marketplaceAbi,
        functionName: "listItem",
        args: [
            nftAddress,
            tokenId,
            priceInEther,
            desiredNftAddress || ethers.constants.AddressZero,
            desiredTokenId || "0",
        ],
        onSuccess: (data) => {
            setListItemTxHash(data.hash)
        },
        onError: (error) => {
            console.error("List item error: ", error)
            handleTransactionError(error)
            handleTransactionFailure("listItem")
        },
    })

    const { status: waitListItemStatus, error: waitListItemStatusError } = useWaitForTransaction({
        hash: listItemTxHash,
        onError: (error) => {
            handleTransactionError(error)
            handleTransactionFailure("listItem")
        },
    })

    // Use the custom hook for handling transaction status
    useTransactionStatus({
        status: listItemStatus,
        statusError: listItemStatusError,
        waitStatus: waitListItemStatus,
        waitStatusError: waitListItemStatusError,
        type: "listItem",
        tokenId,
        nftAddress,
        price,
        desiredNftAddress: desiredNftAddress || ethers.constants.AddressZero,
        desiredTokenId: desiredTokenId || "0",
        onSuccessCallback,
    })

    const handleListItem = useCallback(async () => {
        if (!checkWalletConnection("listItem")) return
        if (transactionInProgress("listItem", listItemStatus === "loading")) return

        try {
            await listItem()
        } catch (error) {
            console.error("An error occurred during the transaction: ", error)
        }
    }, [checkWalletConnection, transactionInProgress, listItemStatus, listItem])

    return { handleListItem }
}

export default useListItem
