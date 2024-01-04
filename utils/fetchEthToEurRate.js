/**
 * Fetches the current exchange rate from Ethereum (ETH) to Euro (EUR).
 * Utilizes the CryptoCompare API to get the latest conversion rates.
 *
 * @returns {Promise<number|null>} The ETH to EUR exchange rate, or null if an error occurs.
 */
export const fetchEthToEurRate = async () => {
    try {
        // Constructing the API URL for fetching ETH to EUR rate
        const apiUrl = "https://min-api.cryptocompare.com/data/pricemulti?fsyms=ETH&tsyms=EUR"

        // Fetching data from the API
        const response = await fetch(apiUrl)

        // Parsing the JSON response
        const data = await response.json()

        // Extracting the ETH to EUR rate from the response
        const ethToEurRate = data.ETH.EUR

        return ethToEurRate
    } catch (error) {
        // Logging the error to the console and returning null in case of an error
        console.error("Error getting ETH to EUR exchange rate:", error)
        return null
    }
}
