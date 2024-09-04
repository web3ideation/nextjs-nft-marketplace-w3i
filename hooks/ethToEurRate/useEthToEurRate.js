import { useState, useEffect, useCallback } from "react"
import { fetchEthToEurRate } from "@utils/fetchEthToEurRate"

const useEthToEurRate = (pollingInterval = 60000) => {
    const [ethToEurRate, setEthToEurRate] = useState(null)

    // Function to fetch and update the ETH to EUR rate
    const updateEthToEurRate = useCallback(async () => {
        const rate = await fetchEthToEurRate()
        setEthToEurRate(rate)
    }, [])

    // Polling to update the exchange rate at the given interval
    useEffect(() => {
        updateEthToEurRate() // Initial fetch
        const intervalId = setInterval(updateEthToEurRate, pollingInterval)
        return () => clearInterval(intervalId) // Cleanup interval on unmount
    }, [updateEthToEurRate, pollingInterval])

    return ethToEurRate
}

export default useEthToEurRate
