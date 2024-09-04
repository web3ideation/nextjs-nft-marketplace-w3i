import { useState, useCallback } from "react"
import { ethers } from "ethers"
import { useContractWrite, useWaitForTransaction } from "wagmi"
import nftMarketplaceAbi from "@constants/NftMarketplace.json"
import useTransactionHandlers from "../transactionHandlers/useTransactionHandlers"
import useTransactionStatus from "../transactionStatus/useTransactionStatus"

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
        price.trim() !== "" ? ethers.utils.parseEther(price) : ethers.BigNumber.from("0")

    const {
        writeAsync: listItem,
        status: listItemStatus,
        error: listItemStatusError,
    } = useContractWrite({
        address: marketplaceAddress,
        abi: nftMarketplaceAbi,
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
