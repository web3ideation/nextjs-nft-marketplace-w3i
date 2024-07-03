import { useState, useEffect, useCallback } from "react"
import { useContractWrite, useWaitForTransaction } from "wagmi"
import useTransactionHandlers from "../transactionHandlers/useTransactionHandlers"
import nftMarketplaceAbi from "@constants/NftMarketplace.json"

export const useWithdrawProceeds = (marketplaceAddress, proceeds, onSuccessCallback) => {
    const [withdrawl, setWithdrawl] = useState(false)
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

    const { data: withdrawData, writeAsync: withdrawProceeds } = useContractWrite({
        address: marketplaceAddress,
        abi: nftMarketplaceAbi,
        functionName: "withdrawProceeds",
        onSuccess: (data) => {
            setTxHash(data.hash)
            console.log("TXHASH", data.hash)
            clearConfirmTransactionNotification()
        },
        onError: (error) => {
            console.error("Error sending withdrawal:", error)
            setWithdrawl(false)
            handleTransactionError(error)
            handleTransactionFailure("withdrawProceeds", setWithdrawl)
            clearTransactionLoadingNotification()
            clearConfirmTransactionNotification()
        },
    })

    const {
        data: withdrawTxReceipt,
        isLoading: isTxLoading,
        isSuccess: isTxSuccess,
        isError: isTxError,
    } = useWaitForTransaction({
        hash: txHash,
    })

    const handleWithdrawProceeds = useCallback(async () => {
        if (!checkWalletConnection("withdrawProceeds")) return
        if (transactionInProgress("withdrawProceeds", withdrawl)) return
        setWithdrawl(true)
        handleTransactionConfirm("withdrawProceeds", { proceeds })
        try {
            await withdrawProceeds()
        } catch (error) {
            console.error("An error occurred during the transaction: ", error)
            setWithdrawl(false)
            clearTransactionLoadingNotification()
            clearConfirmTransactionNotification()
        }
    }, [
        checkWalletConnection,
        transactionInProgress,
        withdrawl,
        handleTransactionConfirm,
        proceeds,
        withdrawProceeds,
        clearTransactionLoadingNotification,
        clearConfirmTransactionNotification,
    ])

    useEffect(() => {
        if (isTxLoading) handleTransactionLoading("withdrawProceeds")
        else if (isTxSuccess) {
            handleTransactionSuccess("withdrawProceeds", onSuccessCallback, setWithdrawl)
            clearTransactionLoadingNotification()
        } else if (isTxError) {
            clearTransactionLoadingNotification()
            handleTransactionFailure("withdrawProceeds", setWithdrawl)
        }
    }, [
        isTxLoading,
        isTxSuccess,
        isTxError,
        setWithdrawl,
        handleTransactionLoading,
        handleTransactionSuccess,
        handleTransactionFailure,
        clearTransactionLoadingNotification,
        onSuccessCallback,
    ])

    return { handleWithdrawProceeds, withdrawl, isTxSuccess }
}
export default useWithdrawProceeds
