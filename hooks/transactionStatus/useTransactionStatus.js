import { useEffect, useRef } from "react"
import useTransactionHandlers from "../transactionHandlers/useTransactionHandlers"
import { truncateStr } from "@utils/formatting"

const useTransactionStatus = ({
    status,
    statusError,
    waitStatus,
    waitStatusError,
    type,
    tokenId,
    nftAddress,
    price,
    formattedPrice,
    newPrice,
    proceeds,
    desiredNftAddress,
    desiredTokenId,
    newDesiredNftAddress,
    newDesiredTokenId,
    onSuccessCallback,
}) => {
    const {
        handleTransactionConfirm,
        clearConfirmTransactionNotification,
        handleTransactionLoading,
        clearTransactionLoadingNotification,
        handleTransactionSuccess,
    } = useTransactionHandlers()

    const statusRef = useRef(false)
    const waitStatusRef = useRef(false)

    useEffect(() => {
        const transactionDetails = {
            tokenId: tokenId?.toString() ?? undefined,
            nftAddress: nftAddress ? truncateStr(nftAddress, 4, 4) : undefined,
            price: price ?? undefined,
            formattedPrice: formattedPrice ?? undefined,
            newPrice: newPrice ?? undefined,
            proceeds: proceeds ?? undefined,
            desiredNftAddress: desiredNftAddress
                ? truncateStr(desiredNftAddress, 4, 4)
                : undefined,
            desiredTokenId: desiredTokenId?.toString() ?? "0",
            newDesiredNftAddress: newDesiredNftAddress
                ? truncateStr(newDesiredNftAddress, 4, 4)
                : undefined,
            newDesiredTokenId: newDesiredTokenId?.toString() ?? "0",
        }

        if (status !== statusRef.current) {
            statusRef.current = status

            if (status === "loading") {
                console.log(`Transaction write is loading`, status)
                handleTransactionConfirm(type, transactionDetails)
            } else if (status === "success") {
                console.log(`Transaction write is success`, status)
                clearConfirmTransactionNotification()
            } else if (status === "error") {
                console.log(`Transaction write is error`, statusError)
                clearConfirmTransactionNotification()
            }
        }

        if (waitStatus !== waitStatusRef.current) {
            waitStatusRef.current = waitStatus

            if (waitStatus === "loading") {
                console.log(`Transaction is loading`, waitStatus)
                handleTransactionLoading(type)
            } else if (waitStatus === "success") {
                console.log(`Transaction is success`, waitStatus)
                handleTransactionSuccess(type, onSuccessCallback)
                clearTransactionLoadingNotification()
            } else if (waitStatus === "error") {
                console.log(`Transaction is error`, waitStatusError)
                clearTransactionLoadingNotification()
                clearConfirmTransactionNotification()
            }
        }
    }, [
        status,
        statusError,
        waitStatus,
        waitStatusError,
        tokenId,
        nftAddress,
        price,
        formattedPrice,
        newPrice,
        proceeds,
        desiredNftAddress,
        desiredTokenId,
        newDesiredNftAddress,
        newDesiredTokenId,
        type,
    ])
}

export default useTransactionStatus
