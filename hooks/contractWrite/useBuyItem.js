import { useState, useEffect, useCallback } from "react"
import { useContractWrite, useWaitForTransaction } from "wagmi"
import useTransactionHandlers from "../transactionHandlers/useTransactionHandlers"
import nftMarketplaceAbi from "@constants/NftMarketplace.json"
import { truncateStr } from "@utils/formatting"

export const useBuyItem = (marketplaceAddress, price, nftAddress, tokenId, formattedPrice, onSuccessCallback) => {
    const [buying, setBuying] = useState(false)
    const [txHash, setTxHash] = useState(null)

    const {
        checkWalletConnection,
        handleTransactionConfirm,
        clearConfirmTransactionNotification,
        handleTransactionError,
        handleTransactionFailure,
        transactionInProgress,
        handleTransactionLoading,
        clearTransactionLoadingNotification,
        handleTransactionSuccess,
    } = useTransactionHandlers()

    const { data: buyItemData, writeAsync: buyItem } = useContractWrite({
        address: marketplaceAddress,
        abi: nftMarketplaceAbi,
        functionName: "buyItem",
        value: price,
        args: [nftAddress, tokenId],
        onSuccess: (data) => {
            setTxHash(data.hash)
            clearConfirmTransactionNotification()
        },
        onError: (error) => {
            console.error("Buy item error", error.message)
            setBuying(false)
            handleTransactionError(error)
            handleTransactionFailure("buyItem", setBuying)
            clearTransactionLoadingNotification()
            clearConfirmTransactionNotification()
        },
    })

    const {
        data: buyTxReceipt,
        isLoading: isTxLoading,
        isSuccess: isTxSuccess,
        isError: isTxError,
    } = useWaitForTransaction({ hash: txHash })

    const handleBuyClick = useCallback(async () => {
        if (!checkWalletConnection("buyItem")) return
        if (transactionInProgress("buyItem", buying)) return
        setBuying(true)
        handleTransactionConfirm("buyItem", {
            tokenId: tokenId.toString(),
            nftAddress: truncateStr(nftAddress, 4, 4),
            formattedPrice: formattedPrice.toString(),
        })
        try {
            await buyItem()
        } catch (error) {
            console.error("An error occurred during the transaction: ", error)
            setBuying(false)
            clearTransactionLoadingNotification()
            clearConfirmTransactionNotification()
        }
    }, [
        checkWalletConnection,
        transactionInProgress,
        buying,
        handleTransactionConfirm,
        tokenId,
        nftAddress,
        formattedPrice,
        buyItem,
        clearTransactionLoadingNotification,
        clearConfirmTransactionNotification,
    ])

    useEffect(() => {
        console.log(`Transaction Loading: ${isTxLoading}, Success: ${isTxSuccess}, Error: ${isTxError}`)
        if (isTxLoading) {
            handleTransactionLoading("buyItem")
            console.log("Transaction is loading")
        } else if (isTxSuccess) {
            handleTransactionSuccess("buyItem", onSuccessCallback, setBuying)
            clearTransactionLoadingNotification()
        } else if (isTxError) {
            clearTransactionLoadingNotification()
            handleTransactionFailure("buyItem", setBuying)
        }
    }, [
        isTxLoading,
        isTxSuccess,
        isTxError,
        setBuying,
        handleTransactionLoading,
        handleTransactionSuccess,
        handleTransactionFailure,
        clearTransactionLoadingNotification,
        onSuccessCallback,
    ])

    return { handleBuyClick, buying }
}
export default useBuyItem
