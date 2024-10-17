import { useCallback, useRef } from "react"
import { useAccount } from "wagmi"
import { useNotification } from "@context"
import { replacePlaceholders } from "@utils"

import {
    errorMessages,
    failureMessages,
    notConnectedMessages,
    inProgressMessages,
    confirmMessages,
    loadingMessages,
    successMessages,
} from "./transactionMessages"

export const useTransactionHandlers = () => {
    const { showNotification, closeNotification } = useNotification()
    const { isConnected } = useAccount()
    const whilePurchaseNotificationId = useRef(null)
    // const notificationIdRef = useRef(null)
    const confirmNotificationId = useRef(null)

    const handleTransactionError = useCallback(
        (error) => {
            const foundError = Object.entries(errorMessages).find(([key]) =>
                error.message.includes(key)
            )
            const {
                title,
                description,
                type = "error",
                persist = true,
            } = foundError
                ? errorMessages[foundError[0]]
                : {
                      title: "Error",
                      description: error.message || "Failed to process the transaction.",
                      type: "error",
                  }

            showNotification(title, description, type, persist)
        },
        [showNotification]
    )

    const handleTransactionFailure = useCallback(
        (transactionType) => {
            if (confirmNotificationId.current) {
                closeNotification(confirmNotificationId.current)
            }
            const messageConfig = failureMessages[transactionType] || {
                title: "Error",
                message: "An unknown error occurred.",
                type: "error",
            }

            showNotification(messageConfig.title, messageConfig.message, messageConfig.type, true)
        },
        [closeNotification, showNotification]
    )

    const checkWalletConnection = useCallback(
        (transactionType) => {
            if (!isConnected) {
                const messageConfig = notConnectedMessages[transactionType] || {
                    title: "Connect wallet",
                    message: "Connect your wallet to proceed!",
                    type: "info",
                }

                showNotification(messageConfig.title, messageConfig.message, messageConfig.type)
                return false
            }
            return true
        },
        [isConnected, showNotification]
    )

    const transactionInProgress = useCallback(
        (transactionType, isInProgress) => {
            if (isInProgress) {
                const messageConfig = inProgressMessages[transactionType] || {
                    title: "Error",
                    message: "A transaction is already in progress! Check your wallet!",
                    type: "error",
                }

                showNotification(messageConfig.title, messageConfig.message, messageConfig.type)
                return true
            }
            return false
        },
        [showNotification]
    )

    const handleTransactionConfirm = useCallback(
        (transactionType, values) => {
            const messageConfig = confirmMessages[transactionType]
            if (messageConfig) {
                const messageArray = replacePlaceholders(messageConfig.message, values)
                const message = Array.isArray(messageArray) ? messageArray.join("") : messageArray
                confirmNotificationId.current = showNotification(
                    messageConfig.title,
                    message,
                    messageConfig.type,
                    true
                )
            } else {
                console.error(`Unknown transaction type: ${transactionType}`)
            }
        },
        [showNotification]
    )

    const clearConfirmTransactionNotification = useCallback(() => {
        if (confirmNotificationId.current !== null) {
            closeNotification(confirmNotificationId.current)
            confirmNotificationId.current = null
        }
    }, [closeNotification])

    // Handler for transaction loading
    const handleTransactionLoading = useCallback(
        (transactionType, persist = true) => {
            const messageConfig = loadingMessages[transactionType]

            if (messageConfig) {
                whilePurchaseNotificationId.current = showNotification(
                    messageConfig.title,
                    messageConfig.message,
                    messageConfig.type,
                    persist
                )
            } else {
                console.error(`Unknown transaction type: ${transactionType}`)
            }
        },
        [showNotification]
    )

    const clearTransactionLoadingNotification = useCallback(() => {
        if (whilePurchaseNotificationId.current) {
            closeNotification(whilePurchaseNotificationId.current)
            whilePurchaseNotificationId.current = null
        }
    }, [closeNotification])

    // Handler for successful transactions
    const handleTransactionSuccess = useCallback(
        (transactionType, onSuccessCallback) => {
            const messageConfig = successMessages[transactionType] || {
                title: "Success",
                message: "Transaction completed successfully.",
                type: "success",
            }

            showNotification(messageConfig.title, messageConfig.message, messageConfig.type)

            if (typeof onSuccessCallback === "function") {
                onSuccessCallback()
            }
        },
        [showNotification]
    )

    return {
        handleTransactionError,
        handleTransactionFailure,
        checkWalletConnection,
        transactionInProgress,
        handleTransactionConfirm,
        clearConfirmTransactionNotification,
        handleTransactionLoading,
        clearTransactionLoadingNotification,
        handleTransactionSuccess,
    }
}

export default useTransactionHandlers
