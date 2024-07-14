import { useState, useCallback } from "react"
import { useContractWrite, useWaitForTransaction } from "wagmi"
import nftMarketplaceAbi from "@constants/NftMarketplace.json"
import useTransactionHandlers from "../transactionHandlers/useTransactionHandlers"
import useTransactionStatus from "../transactionStatus/useTransactionStatus"

export const useBuyItem = (
    marketplaceAddress,
    price,
    nftAddress,
    tokenId,
    formattedPrice,
    onSuccessCallback
) => {
    const {
        handleTransactionError,
        handleTransactionFailure,
        checkWalletConnection,
        transactionInProgress,
    } = useTransactionHandlers()

    const [buyItemTxHash, setBuyItemTxHash] = useState(null)

    const {
        writeAsync: buyItem,
        status: buyItemStatus,
        error: buyItemStatusError,
    } = useContractWrite({
        address: marketplaceAddress,
        abi: nftMarketplaceAbi,
        functionName: "buyItem",
        value: price,
        args: [nftAddress, tokenId],
        onSuccess: (data) => {
            setBuyItemTxHash(data.hash)
        },
        onError: (error) => {
            console.error("Buy item error", error.message)
            handleTransactionError(error)
            handleTransactionFailure("buyItem")
        },
    })

    const { status: waitBuyItemStatus, error: waitBuyItemStatusError } = useWaitForTransaction({
        hash: buyItemTxHash,
        onError: (error) => {
            handleTransactionError(error)
            handleTransactionFailure("buyItem")
        },
    })

    useTransactionStatus({
        status: buyItemStatus,
        statusError: buyItemStatusError,
        waitStatus: waitBuyItemStatus,
        waitStatusError: waitBuyItemStatusError,
        type: "buyItem",
        tokenId,
        nftAddress,
        formattedPrice,
        onSuccessCallback,
    })

    const handleBuyItem = useCallback(async () => {
        if (!checkWalletConnection("buyItem")) return
        if (transactionInProgress("buyItem", buyItemStatus === "loading")) return

        try {
            await buyItem()
        } catch (error) {
            console.error("An error occurred during the transaction: ", error)
        }
    }, [checkWalletConnection, transactionInProgress, buyItemStatus, buyItem])

    return { handleBuyItem }
}
export default useBuyItem
