/**
 * Updates the page content after a transaction involving NFTs.
 * @param {Function} reloadNFTs - Function to reload the NFTs.
 */
export const updatePageContentAfterTransaction = (reloadNFTs) => {
    console.log("Reloading NFTs...")
    setTimeout(() => {
        reloadNFTs()
    }, 1000)
}
