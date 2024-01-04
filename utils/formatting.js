// External Libraries
import { ethers } from "ethers"

// -----------------------------------------------------------------------------------
// String Utilities

/**
 * Truncates a string by keeping a specified number of characters at the start and end, and adding an ellipsis in the middle.
 * This function is useful for shortening long strings while preserving context.
 * @param {string} fullStr - The string to truncate.
 * @param {number} frontChars - The number of characters to keep at the start of the string.
 * @param {number} backChars - The number of characters to keep at the end of the string.
 * @returns {string} - The truncated string.
 */
export const truncateStr = (fullStr, frontChars, backChars) => {
    // Check whether the total length of the string is shorter than the sum of the characters to be kept
    if (fullStr.length <= frontChars + backChars) return fullStr

    const separator = "..."
    return (
        fullStr.substring(0, frontChars) +
        separator +
        fullStr.substring(fullStr.length - backChars)
    )
}

// -----------------------------------------------------------------------------------
// Ethereum Utilities

/**
 * Converts a value from Wei to Ether.
 * Useful for displaying Ethereum values in a more readable format.
 * @param {string|number} priceInWei - The price in Wei.
 * @returns {string} - The price in Ether.
 */
export const formatPriceToEther = (priceInWei) => {
    const priceAsString = String(priceInWei)
    return ethers.utils.formatUnits(priceAsString, "ether")
}

/**
 * Reduces a price to a certain number of decimal places.
 * Useful for standardizing the display of prices.
 * @param {string|number} price - The original price.
 * @param {number} decimalPlaces - The number of decimal places.
 * @returns {string} - The reduced price.
 */
export const truncatePrice = (price, decimalPlaces) => {
    const factor = Math.pow(10, decimalPlaces)
    return (Math.floor(parseFloat(price) * factor) / factor).toFixed(decimalPlaces)
}
