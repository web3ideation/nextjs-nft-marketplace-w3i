/**
 * Fetches the current exchange rate from Ethereum (ETH) to Euro (EUR), US Dollar (USD),
 * British Pound (GBP), and Bitcoin (BTC).
 * Utilizes the Coinbase API to get the latest conversion rates.
 * Falls back to CryptoCompare API if the first request fails.
 *
 * @returns {Promise<{ eur: number|null, usd: number|null, gbp: number|null, btc: number|null }>} The ETH to EUR, USD, GBP, and BTC exchange rates, or null if an error occurs.
 */
export const fetchEthToCurrencyRates = async () => {
    const coinbaseApiUrl = "https://api.coinbase.com/v2/exchange-rates?currency=ETH"
    const cryptoCompareFallbackUrl =
        "https://min-api.cryptocompare.com/data/pricemulti?fsyms=ETH&tsyms=EUR,USD,GBP,BTC"

    try {
        // Attempt to fetch from the Coinbase API
        const response = await fetch(coinbaseApiUrl)

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`)
        }

        // Parse the JSON response
        const data = await response.json()
        console.log("Fetched Data from Coinbase:", data)

        // Extract rates from the Coinbase response
        const ethToEur = data?.data?.rates?.EUR
        const ethToUsd = data?.data?.rates?.USD
        const ethToGbp = data?.data?.rates?.GBP
        const ethToBtc = data?.data?.rates?.BTC

        if (!ethToEur || !ethToUsd || !ethToGbp || !ethToBtc) {
            throw new Error("Missing ETH to EUR/USD/GBP/BTC rate in Coinbase API response")
        }

        // Return the parsed rates
        return {
            eur: parseFloat(ethToEur),
            usd: parseFloat(ethToUsd),
            gbp: parseFloat(ethToGbp),
            btc: parseFloat(ethToBtc),
        }
    } catch (error) {
        console.error("Error with Coinbase API, falling back to CryptoCompare:", error)

        // Fallback to CryptoCompare API
        try {
            const fallbackResponse = await fetch(cryptoCompareFallbackUrl)

            if (!fallbackResponse.ok) {
                throw new Error(`Network response was not ok: ${fallbackResponse.statusText}`)
            }

            const fallbackData = await fallbackResponse.json()
            console.log("Fetched Fallback Data from CryptoCompare:", fallbackData)

            // Validate the CryptoCompare response
            if (
                !fallbackData ||
                !fallbackData.ETH ||
                typeof fallbackData.ETH.EUR !== "number" ||
                typeof fallbackData.ETH.USD !== "number" ||
                typeof fallbackData.ETH.GBP !== "number" ||
                typeof fallbackData.ETH.BTC !== "number"
            ) {
                throw new Error(
                    "Unexpected API response format or missing ETH to EUR/USD/GBP/BTC rates"
                )
            }

            // Return the fallback rates
            return {
                eur: fallbackData.ETH.EUR,
                usd: fallbackData.ETH.USD,
                gbp: fallbackData.ETH.GBP,
                btc: fallbackData.ETH.BTC,
            }
        } catch (fallbackError) {
            console.error(
                "Error fetching ETH to EUR/USD/GBP/BTC from CryptoCompare:",
                fallbackError
            )

            // Return null rates if both API requests fail
            return { eur: null, usd: null, gbp: null, btc: null }
        }
    }
}
