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
    if (fullStr === undefined) return
    if (
        typeof fullStr !== "string" ||
        typeof frontChars !== "number" ||
        typeof backChars !== "number"
    ) {
        throw new Error("Invalid input types")
    }

    if (!fullStr) return ""
    if (fullStr.length <= frontChars + backChars) return fullStr

    const separator = "..."
    return (
        fullStr.substring(0, frontChars) +
        separator +
        fullStr.substring(fullStr.length - backChars)
    )
}

/**
 * Capitalizes the first character of a string.
 * @param {string} str - The string to capitalize.
 * @returns {string} - The string with the first character capitalized.
 */
export const capitalizeFirstChar = (str) => {
    if (typeof str !== "string") {
        throw new Error("Invalid input type")
    }

    if (!str) return ""
    return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Replaces placeholders in a string with corresponding values from an object.
 * @param {string|array} message - The message with placeholders.
 * @param {object} values - Object with keys corresponding to placeholders.
 * @returns {array} - Array of strings with placeholders replaced.
 */
export const replacePlaceholders = (message, values) => {
    const lines = Array.isArray(message) ? message : [message]

    return lines.map((line) => {
        return Object.keys(values).reduce((currentLine, key) => {
            const value = values[key]
            const regex = new RegExp(`\\$\\{${key}\\}`, "g")
            return currentLine.replace(regex, value)
        }, line)
    })
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
    if (!priceInWei) return 0

    let priceAsString = priceInWei.toString()

    try {
        if (priceAsString.includes("e")) {
            const [base, exponent] = priceAsString.split("e").map(Number)
            const bigNumberBase = ethers.BigNumber.from(
                ethers.utils.parseUnits(base.toString(), 18)
            )
            const bigNumberPrice = bigNumberBase.mul(ethers.BigNumber.from(10).pow(exponent - 18))
            return ethers.utils.formatUnits(bigNumberPrice, "ether")
        } else {
            const bigNumberPrice = ethers.BigNumber.from(priceAsString)
            return ethers.utils.formatUnits(bigNumberPrice, "ether")
        }
    } catch (error) {
        console.error("Error converting price from Wei to Ether:", error)
        return "0"
    }
}

/**
 * Reduces a price to a certain number of decimal places.
 * Useful for standardizing the display of prices.
 * @param {string|number} price - The original price.
 * @param {number} decimalPlaces - The number of decimal places.
 * @returns {string} - The reduced price.
 */
export const truncatePrice = (price, decimalPlaces) => {
    if (typeof price !== "string" && typeof price !== "number") {
        throw new Error("Invalid input type for price")
    }
    if (typeof decimalPlaces !== "number") {
        throw new Error("Invalid input type for decimalPlaces")
    }

    const parsedPrice = parseFloat(price)
    if (isNaN(parsedPrice)) {
        throw new Error("Invalid price value")
    }

    const factor = Math.pow(10, decimalPlaces)
    let truncatedPrice = (Math.round(parsedPrice * factor) / factor).toFixed(decimalPlaces)

    // Remove unnecessary trailing zeros, but keep at most two
    truncatedPrice = truncatedPrice.replace(/(\.\d{2})0+$/g, "$1") // Behalte zwei Dezimalstellen
    truncatedPrice = truncatedPrice.replace(/(\.\d*?[1-9])0+$/g, "$1") // Entfernt überflüssige Nullen bei mehr Dezimalstellen
    truncatedPrice = truncatedPrice.replace(/(\.\d)$/g, "$10") // Falls nur eine Dezimalstelle übrig bleibt, füge eine zweite hinzu

    return truncatedPrice
}
