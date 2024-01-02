/**
 * Copies a given NFT address to the clipboard and shows a notification.
 * @param {string} nftAddress - The NFT address to be copied.
 * @param {Function} showNotification - Function to show a notification.
 */
export const copyNftAddressToClipboard = async (nftAddress, showNotification) => {
    try {
        await navigator.clipboard.writeText(nftAddress)
        showNotification("Success", "Address copied!", "success")
    } catch (error) {
        showNotification("Error", "Error copying!", "error")
    }
}
