/**
 * Fetches the current exchange rate from Ethereum (ETH) to Euro (EUR).
 * Utilizes the CryptoCompare API to get the latest conversion rates.
 * Falls back to Coinbase API if the first request fails.
 *
 * @returns {Promise<number|null>} The ETH to EUR exchange rate, or null if an error occurs.
 */
export const fetchEthToEurRate = async () => {
    const apiUrl = "https://min-api.cryptocompare.com/data/pricemulti?fsyms=ETH&tsyms=EUR,USD"
    const fallbackUrl = "https://api.coinbase.com/v2/exchange-rates?currency=ETH"

    try {
        // Fetching data from the primary API (CryptoCompare)
        const response = await fetch(apiUrl)

        // Check if the response is okay (status code 200-299)
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`)
        }

        // Parsing the JSON response
        const data = await response.json()
        console.log("Fetched Data:", data) // Log data

        // Validating the response structure before accessing the ETH to EUR rate
        if (!data || !data.ETH || typeof data.ETH.EUR !== "number") {
            throw new Error("Unexpected API response format or missing ETH to EUR rate")
        }

        // Extracting and returning the ETH to EUR rate
        return data.ETH.EUR
    } catch (error) {
        console.error("Error with CryptoCompare API, attempting Coinbase fallback:", error)

        try {
            // Fallback to Coinbase API
            const fallbackResponse = await fetch(fallbackUrl)

            if (!fallbackResponse.ok) {
                throw new Error(`Network response was not ok: ${fallbackResponse.statusText}`)
            }

            const fallbackData = await fallbackResponse.json()
            console.log("Fetched Fallback Data:", fallbackData)

            // Extracting and returning the ETH to EUR rate from Coinbase data
            const ethToEur = fallbackData?.data?.rates?.EUR
            if (!ethToEur) {
                throw new Error(
                    "Unexpected Coinbase API response format or missing ETH to EUR rate"
                )
            }

            return parseFloat(ethToEur)
        } catch (fallbackError) {
            console.error("Error getting ETH to EUR exchange rate from Coinbase:", fallbackError)
            return null
        }
    }
}
