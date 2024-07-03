/**
 *
 * @param {*} message
 * @param {*} values
 * @returns
 */

export const replacePlaceholders = (message, values) => {
    // Falls message ein String ist, in ein Array mit einer Zeile umwandeln
    const lines = Array.isArray(message) ? message : [message]

    return lines.map((line) => {
        return Object.keys(values).reduce((currentLine, key) => {
            const value = values[key]
            const regex = new RegExp(`\\$\\{${key}\\}`, "g")
            return currentLine.replace(regex, value)
        }, line)
    })
}
