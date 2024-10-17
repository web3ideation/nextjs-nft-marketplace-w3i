import { ethers } from "ethers"

/**
 * Utility function to validate a string using a regex pattern.
 * @param {string} value - The string to validate.
 * @param {RegExp} regex - The regex pattern to validate against.
 * @returns {boolean} True if the value matches the regex, false otherwise.
 */
const validateWithRegex = (value: string, regex: RegExp): boolean => {
    return regex.test(value)
}

/**
 * Checks if a given string is a valid Ethereum address.
 *
 * @param {string} address - The string to validate as an Ethereum address.
 * @returns {boolean} True if the address is valid, false otherwise.
 */
export const isValidEthereumAddress = (address: string): boolean => {
    return ethers.utils.isAddress(address)
}

/**
 * Checks if a given string is a positive integer.
 *
 * @param {string} value - The string to validate as a positive integer.
 * @returns {boolean} True if the value is a positive integer, false otherwise.
 */
export const isPositiveInteger = (value: string): boolean => {
    return validateWithRegex(value, /^\d+$/)
}

/**
 * Validates if a given string is a valid price format for Ethereum.
 *
 * @param {string} price - The string to validate as a price.
 * @returns {boolean} True if the price format is valid, false otherwise.
 */
export const isValidPrice = (price: string): boolean => {
    // Ensure the price is a valid number with up to 18 decimals
    const priceRegex = /^\d+(\.\d{1,18})?$/

    if (!validateWithRegex(price, priceRegex)) {
        return false
    }

    // Check if the price can be parsed correctly by ethers
    try {
        ethers.utils.parseEther(price)
        return true
    } catch (error) {
        return false
    }
}

/**
 * Validates if a given string is a valid price format for Euros.
 *
 * @param {string} price - The string to validate as a Euro price.
 * @param {string} currency - The currency to validate the price against.
 * @returns {boolean} True if the Euro price format is valid, false otherwise.
 */
export const isValidCurrencyPrice = (price: string, currency: string): boolean => {
    let regex

    if (currency === "BTC") {
        // Bitcoin: max. 8 Nachkommastellen
        regex = /^\d+(\.\d{1,8})?$/
    } else {
        // Andere Währungen wie EUR, USD, GBP: max. 2 Nachkommastellen
        regex = /^\d+(\.\d{1,2})?$/
    }

    return validateWithRegex(price, regex)
}

/**
 * Validates an individual form field based on its name and value.
 *
 * @param {string} name - The name of the form field to validate.
 * @param {string | number} value - The value of the form field.
 * @returns {string} An error message if validation fails, otherwise an empty string.
 */
export const validateField = (name: string, value: string | number): string => {
    const stringValue = String(value).trim()
    let errorMessage = ""

    console.log(`Validating field: ${name} with value: ${stringValue}, type: ${typeof value}`)

    switch (name) {
        case "nftAddress":
        case "desiredNftAddress":
        case "newDesiredNftAddress":
            if (!isValidEthereumAddress(stringValue)) {
                errorMessage = "Please enter a valid Ethereum address in the format 0x1234..."
            }
            break
        case "tokenId":
        case "desiredTokenId":
        case "newDesiredTokenId":
            if (!isPositiveInteger(stringValue)) {
                errorMessage = "Please enter a positive integer or zero."
            }
            break
        case "price":
        case "newPrice":
            if (stringValue === "") {
                errorMessage = "Price cannot be empty. Please enter a positive amount or 0 in ETH."
            } else if (!isValidPrice(stringValue)) {
                errorMessage =
                    "Please enter a valid price in ETH (up to 18 digits, with an optional 18 decimal places)."
            }
            break
        case "priceInCurrency":
        case "newPriceInCurrency":
            if (stringValue === "") {
                errorMessage =
                    "Price in your currency cannot be empty. Please enter a positive amount or 0 in currency."
            } else if (!isValidCurrencyPrice(stringValue, "EUR")) {
                // Replace "EUR" with the appropriate currency if needed
                errorMessage = "Please enter a valid price in currency (up to 2 decimal places)."
            }
            break
        default:
            break
    }
    return errorMessage
}
