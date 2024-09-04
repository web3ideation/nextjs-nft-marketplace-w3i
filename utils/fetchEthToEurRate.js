/**
 * Fetches the current exchange rate from Ethereum (ETH) to Euro (EUR).
 * Utilizes the CryptoCompare API to get the latest conversion rates.
 *
 * @returns {Promise<number|null>} The ETH to EUR exchange rate, or null if an error occurs.
 */
export const fetchEthToEurRate = async () => {
    const apiUrl = "https://min-api.cryptocompare.com/data/pricemulti?fsyms=ETH&tsyms=EUR,USD"

    try {
        // Fetching data from the API
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
        // Logging the error to the console and returning null in case of an error
        console.error("Error getting ETH to EUR exchange rate:", error)
        return null
    }
}
