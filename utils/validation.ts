import { ethers } from "ethers"

/**
 * Checks if a given string is a valid Ethereum address.
 *
 * @param {string} address - The string to validate as an Ethereum address.
 * @returns {boolean} True if the address is valid, false otherwise.
 */
function isValidEthereumAddress(address: string): boolean {
    return ethers.utils.isAddress(address)
}

/**
 * Checks if a given string is a positive integer.
 *
 * @param {string} value - The string to validate as a positive integer.
 * @returns {boolean} True if the value is a positive integer, false otherwise.
 */
function isPositiveInteger(value: string): boolean {
    return /^\d+$/.test(value)
}

/**
 * Validates if a given string is a valid price format.
 *
 * @param {string} price - The string to validate as a price.
 * @returns {boolean} True if the price format is valid, false otherwise.
 */
function isValidPrice(price: string): boolean {
    // Ensure the price is a valid number with up to 18 decimals
    const regex = /^\d+(\.\d{1,18})?$/
    if (!regex.test(price)) {
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
 * Checks if a given string is a valid price format for Euros.
 *
 * @param {string} price - The string to validate as a Euro price.
 * @returns {boolean} True if the Euro price format is valid, false otherwise.
 */
function isValidEuroPrice(price: string): boolean {
    // Ensure the price is a valid number with up to 2 decimals (common for fiat currencies)
    const regex = /^\d+(\.\d{1,2})?$/
    return regex.test(price)
}

/**
 * Validates an individual form field based on its name and value.
 *
 * @param {string} name - The name of the form field to validate.
 * @param {string | number} value - The value of the form field.
 * @returns {string} An error message if validation fails, otherwise an empty string.
 */
export const validateField = (name: string, value: string | number): string => {
    value = String(value).trim()
    let errorMessage = ""

    console.log(`Validating field: ${name} with value: ${value}, type: ${typeof value}`)

    switch (name) {
        case "nftAddress":
        case "desiredNftAddress":
        case "newDesiredNftAddress":
            if (!isValidEthereumAddress(value)) {
                errorMessage = "Please enter a valid Ethereum address in the format 0x1234..."
            }
            break
        case "tokenId":
        case "desiredTokenId":
        case "newDesiredTokenId":
            if (!isPositiveInteger(value)) {
                errorMessage = "Please enter a positive integer or zero."
            }
            break
        case "price":
        case "newPrice":
            if (value === "") {
                errorMessage = "Price cannot be empty. Please enter a positive amount or 0 in ETH."
            } else if (!isValidPrice(value)) {
                errorMessage =
                    "Please enter a valid price in ETH (up to 18 digits, with an optional 18 decimal places)."
            }
            break
        case "priceInEur":
        case "newPriceInEur":
            if (value === "") {
                errorMessage =
                    "Price in EUR cannot be empty. Please enter a positive amount or 0 in EUR."
            } else if (!isValidEuroPrice(value)) {
                errorMessage = "Please enter a valid price in EUR (up to 2 decimal places)."
            }
            break
        default:
            break
    }
    return errorMessage
}
