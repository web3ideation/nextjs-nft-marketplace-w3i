/**
 * Checks if a given string is a valid Ethereum address.
 *
 * @param {string} address - The string to validate as an Ethereum address.
 * @returns {boolean} True if the address is valid, false otherwise.
 */
function isValidEthereumAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
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
    return /^\d{1,18}(\.\d{1,18})?$/.test(price)
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
            if (!isValidPrice(value)) {
                errorMessage = "Please enter a positive amount in ETH."
            }
            break
        default:
            break
    }
    return errorMessage
}
