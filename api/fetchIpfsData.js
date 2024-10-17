/**
 * Fetches data from a given IPFS URI, converting it to a standard HTTP URL.
 * Attempts to retrieve JSON data, extracting the image URI if available.
 * If the content is not JSON, it returns the direct link to the content.
 *
 * @param {string} tokenURI - The IPFS URI of the token metadata.
 * @returns {Promise<{ imageURI: string, requestURL: string, [key: string]: any }>} The parsed IPFS data, including the image URI and request URL, or additional JSON properties if available.
 * @throws Will throw an error if the fetch request fails or the content is not accessible.
 */
export const fetchIPFSData = async (tokenURI) => {
    try {
        // Convert the IPFS URI to a standard HTTP URL using the ipfs.io gateway
        const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")

        // Fetch the data from the generated HTTP URL
        const response = await fetch(requestURL)

        // Determine the content type of the response
        const contentType = response.headers.get("content-type")

        // Check if the content is of JSON type
        if (contentType && contentType.includes("application/json")) {
            // Parse the JSON response
            const tokenURIData = await response.json()

            // Replace any IPFS image URIs with an HTTP URL and return the data
            return {
                ...tokenURIData,
                imageURI: tokenURIData.image.replace("ipfs://", "https://ipfs.io/ipfs/"),
                requestURL,
            }
        } else {
            // If the content is not JSON, return the request URL as the image URI
            return { imageURI: requestURL, requestURL }
        }
    } catch (error) {
        // Log any errors encountered during the fetch process
        console.error("Error fetching IPFS data:", error)

        // Re-throw the error to allow for higher-level error handling
        throw error
    }
}
