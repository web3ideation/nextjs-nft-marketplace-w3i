import { useCallback, useEffect, useState } from "react"
import { ethers } from "ethers" // Verwende ethers.js
import pollingMessages from "./pollingMessages.json"
import { useNotification } from "@context/NotificationProvider"

export const useTransactionPolling = (txHash) => {
    const { showNotification, closeNotification } = useNotification()
    const [polling, setPolling] = useState(false)
    const [notificationShown, setNotificationShown] = useState(false)

    const handleTransactionPolling = useCallback(
        (transactionType, persist = true) => {
            if (!notificationShown) {
                setPolling(true)
                setTimeout(() => {
                    const messageConfig = pollingMessages[transactionType]
                    if (messageConfig) {
                        showNotification(messageConfig.title, messageConfig.message, messageConfig.type, persist)
                    } else {
                        showNotification(
                            "Checking Transaction",
                            "Checking the status of your transaction...",
                            "info",
                            persist
                        )
                    }
                    setNotificationShown(true)
                }, 5000)
            }
        },
        [showNotification, notificationShown]
    )

    useEffect(() => {
        // Initialisiere den Provider
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        let interval
        let timeout

        const pollTransaction = async () => {
            try {
                const receipt = await provider.getTransactionReceipt(txHash)
                if (receipt) {
                    closeNotification()
                    setPolling(false)
                    setNotificationShown(false) // Reset notification flag
                    showNotification(
                        "Transaction successful",
                        "Your transaction is successfully processed. Reload if not happened automatically",
                        "success"
                    )
                    return receipt
                }
            } catch (error) {
                console.error("Error fetching transaction receipt: ", error)
            }
        }

        if (polling) {
            timeout = setTimeout(() => {
                interval = setInterval(pollTransaction, 5000)
            }, 5000)
        }

        return () => {
            clearInterval(interval)
            clearTimeout(timeout)
        }
    }, [polling, txHash, closeNotification, showNotification, notificationShown])

    return { handleTransactionPolling, polling, setPolling }
}

export default useTransactionPolling
