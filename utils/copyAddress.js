/**
 * Copies a given NFT address to the clipboard and shows a notification.
 * This function utilizes the Clipboard API to copy the text and a custom
 * notification function to provide user feedback.
 *
 * @param {string} nftAddress - The NFT address to be copied.
 * @param {Function} showNotification - Function to show a notification.
 */
export const copyNftAddressToClipboard = async (nftAddress, showNotification) => {
    try {
        // Attempt to copy the NFT address to the clipboard
        await navigator.clipboard.writeText(nftAddress)

        // On success, show a success notification
        showNotification("Success", "Address copied!", "success")
    } catch (error) {
        // On failure, show an error notification
        showNotification("Error", "Error copying!", "error")
    }
}
