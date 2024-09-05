import { useState, useEffect, useCallback } from "react"
import { fetchEthToEurRate } from "@utils/fetchEthToEurRate"

const useEthToEurRate = (pollingInterval = 60000) => {
    const [ethToEurRate, setEthToEurRate] = useState(null)
    const [fetching, setFetching] = useState(false)
    const [errorFetching, setErrorFetching] = useState(false)
    const [fetchingSuccess, setFetchingSuccess] = useState(false)

    // Function to fetch and update the ETH to EUR rate
    const updateEthToEurRate = useCallback(async () => {
        setFetching(true)
        setErrorFetching(false)
        try {
            const rate = await fetchEthToEurRate()
            setEthToEurRate(rate)
            setFetchingSuccess(true)
        } catch (error) {
            console.error("Failed to fetch ETH to EUR rate:", error)
            setErrorFetching(true)
            setFetchingSuccess(false)
        } finally {
            setFetching(false)
        }
    }, [])

    // Polling to update the exchange rate at the given interval
    useEffect(() => {
        updateEthToEurRate() // Initial fetch
        const intervalId = setInterval(updateEthToEurRate, pollingInterval)
        return () => clearInterval(intervalId) // Cleanup interval on unmount
    }, [updateEthToEurRate, pollingInterval])

    return { ethToEurRate, fetching, errorFetching, fetchingSuccess }
}

export default useEthToEurRate
