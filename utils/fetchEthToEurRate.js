// fetchEthToEurRate.js
export const fetchEthToEurRate = async () => {
    try {
        const response = await fetch(
            "https://min-api.cryptocompare.com/data/pricemulti?fsyms=ETH&tsyms=EUR"
        )
        const data = await response.json()
        const ethToEurRate = data.ETH.EUR
        return ethToEurRate
    } catch (error) {
        console.error("Error getting ETH to EUR exchange rate:", error)
        return null
    }
}
