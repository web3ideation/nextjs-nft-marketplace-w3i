import { useState, useCallback } from "react"
import { erc721ABI, useContractWrite, useWaitForTransaction } from "wagmi"
import useTransactionHandlers from "../transactionHandlers/useTransactionHandlers"
import useTransactionStatus from "../transactionStatus/useTransactionStatus"

const useApprove = (marketplaceAddress, nftAddress, tokenId, onSuccessCallback) => {
    const {
        handleTransactionError,
        handleTransactionFailure,
        checkWalletConnection,
        transactionInProgress,
    } = useTransactionHandlers()

    const [approveTxHash, setApproveTxHash] = useState(null)

    const {
        writeAsync: approveItem,
        status: approveStatus,
        error: approveStatusError,
    } = useContractWrite({
        address: nftAddress,
        abi: erc721ABI,
        functionName: "approve",
        args: [marketplaceAddress, tokenId],
        onSuccess: (data) => {
            setApproveTxHash(data.hash)
        },
        onError: (error) => {
            console.error("An error occurred during the transaction: ", error.message)
            handleTransactionError(error)
            handleTransactionFailure("approve")
        },
    })

    const { status: waitApproveStatus, error: waitApproveStatusError } = useWaitForTransaction({
        hash: approveTxHash,
        onError: (error) => {
            handleTransactionError(error)
            handleTransactionFailure("approve")
        },
    })

    useTransactionStatus({
        status: approveStatus,
        statusError: approveStatusError,
        waitStatus: waitApproveStatus,
        waitStatusError: waitApproveStatusError,
        type: "approve",
        nftAddress,
        tokenId,
        onSuccessCallback,
    })

    const handleApprove = useCallback(async () => {
        if (!checkWalletConnection("approve")) return
        if (transactionInProgress("approve", approveStatus === "loading")) return

        try {
            await approveItem()
        } catch (error) {
            console.error("An error occurred during the transaction: ", error)
        }
    }, [checkWalletConnection, transactionInProgress, approveStatus, approveItem])

    return { handleApprove }
}

export default useApprove
