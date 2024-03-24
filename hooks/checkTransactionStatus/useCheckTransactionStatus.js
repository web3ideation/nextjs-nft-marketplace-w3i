import { useState, useEffect } from "react"

export const useCheckTransactionStatus = (
    web3Provider,
    buyTxHash,
    handleTransactionSuccess,
    handleTransactionError
) => {
    // Define a state for polling
    const [polling, setPolling] = useState(false)

    // Function to check the transaction status
    const checkTransactionStatus = async () => {
        try {
            const receipt = await web3Provider.getTransactionReceipt(buyTxHash)
            if (receipt) {
                handleTransactionSuccess()
                setPolling(false) // Stop polling
            }
        } catch (error) {
            console.error("Error fetching transaction receipt: ", error)
            handleTransactionError(error)
            setPolling(false) // Stop polling
        }
    }

    // Start polling when a transaction hash is available and stop when the component unmounts
    useEffect(() => {
        let interval
        if (polling && buyTxHash) {
            interval = setInterval(checkTransactionStatus, 2500) // Poll every 2.5 seconds
        }
        return () => clearInterval(interval) // Cleanup
    }, [polling, buyTxHash])

    // Expose the function to start polling
    const startPolling = () => setPolling(true)

    return { startPolling }
}
