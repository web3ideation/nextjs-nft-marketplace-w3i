import { useState, useEffect, useCallback } from "react"
import { fetchEthToCurrencyRates } from "@api/fetchEthToCurrencyRates"

const useEthToCurrencyRates = (pollingInterval = 60000) => {
    const [ethToCurrencyRates, setEthToCurrencyRates] = useState({
        eur: null,
        usd: null,
        gbp: null,
        btc: null,
    })
    const [fetching, setFetching] = useState(false)
    const [errorFetching, setErrorFetching] = useState(false)
    const [fetchingSuccess, setFetchingSuccess] = useState(false)

    // Function to fetch and update the ETH to Currency rates
    const updateEthToCurrencyRates = useCallback(async () => {
        setFetching(true)
        setErrorFetching(false)
        try {
            const rates = await fetchEthToCurrencyRates()
            setEthToCurrencyRates(rates)
            setFetchingSuccess(true)
        } catch (error) {
            console.error("Failed to fetch ETH to Currency rates:", error)
            setErrorFetching(true)
            setFetchingSuccess(false)
        } finally {
            setFetching(false)
        }
    }, [])

    // Polling to update the exchange rates at the given interval
    useEffect(() => {
        updateEthToCurrencyRates() // Initial fetch
        const intervalId = setInterval(updateEthToCurrencyRates, pollingInterval)
        return () => clearInterval(intervalId) // Cleanup interval on unmount
    }, [updateEthToCurrencyRates, pollingInterval])

    return {
        ethToCurrencyRates, // Returns the object containing eur, usd, gbp
        fetching,
        errorFetching,
        fetchingSuccess,
    }
}

export default useEthToCurrencyRates
