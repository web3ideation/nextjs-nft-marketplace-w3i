import { useState, useCallback } from "react"
import { useContractWrite, useWaitForTransaction } from "wagmi"
import nftMarketplaceAbi from "@constants/NftMarketplace.json"
import useTransactionHandlers from "../transactionHandlers/useTransactionHandlers"
import useTransactionStatus from "../transactionStatus/useTransactionStatus"

export const useWithdrawProceeds = (marketplaceAddress, proceeds, onSuccessCallback) => {
    const {
        handleTransactionError,
        handleTransactionFailure,
        checkWalletConnection,
        transactionInProgress,
    } = useTransactionHandlers()

    const [withdrawProceedsTxHash, setWithdrawProceedsTxHash] = useState(null)

    const {
        writeAsync: withdrawProceeds,
        status: withdrawProceedsStatus,
        error: withdrawProceedsStatusError,
    } = useContractWrite({
        address: marketplaceAddress,
        abi: nftMarketplaceAbi,
        functionName: "withdrawProceeds",
        onSuccess: (data) => {
            setWithdrawProceedsTxHash(data.hash)
        },
        onError: (error) => {
            console.error("Error sending withdrawal:", error)
            handleTransactionError(error)
            handleTransactionFailure("withdrawProceeds")
        },
    })

    const { status: waitWithdrawProceedsStatus, error: waitWithdrawProceedsStatusError } =
        useWaitForTransaction({
            hash: withdrawProceedsTxHash,
            onError: (error) => {
                handleTransactionError(error)
                handleTransactionFailure("withdrawProceeds")
            },
        })

    useTransactionStatus({
        status: withdrawProceedsStatus,
        statusError: withdrawProceedsStatusError,
        waitStatus: waitWithdrawProceedsStatus,
        waitStatusError: waitWithdrawProceedsStatusError,
        type: "withdrawProceeds",
        proceeds,
        onSuccessCallback,
    })

    const handleWithdrawProceeds = useCallback(async () => {
        if (!checkWalletConnection("withdrawProceeds")) return
        if (transactionInProgress("withdrawProceeds", withdrawProceedsStatus === "loading")) return

        try {
            await withdrawProceeds()
        } catch (error) {
            console.error("An error occurred during the transaction: ", error)
        }
    }, [checkWalletConnection, transactionInProgress, withdrawProceedsStatus, withdrawProceeds])

    return { handleWithdrawProceeds }
}
export default useWithdrawProceeds
