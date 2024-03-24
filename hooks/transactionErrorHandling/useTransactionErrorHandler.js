import { useCallback } from "react"
import { useNftNotification } from "@context/NotificationProvider"

export const useTransactionErrorHandler = () => {
    const { showNftNotification } = useNftNotification()

    const handleTransactionError = useCallback(
        (error) => {
            // Identification of specific error cases
            const userDenied = error.message.includes("User denied transaction signature")
            const userDontOwn = error.message.includes("0xa9fbf51f")
            const nonExistentToken = error.message.includes("0x7e273289")
            const nftNotApproved = error.message.includes("NftMarketplace__NotApproved")
            const nftAlreadyListed = error.message.includes("NftMarketplace__AlreadyListed")
            const listingFailed = error.message.includes("Failed to list the NFT.")
            const delistingFailed = error.message.includes("Failed to delist the NFT.")
            const updateFailed = error.message.includes("Failed to update the NFT.")
            const withdrawFailed = error.message.includes("Failed to withdraw proceeds.")

            // Entscheidung über die anzuzeigende Benachrichtigung basierend auf dem Fehler
            showNftNotification(
                userDenied
                    ? "Transaction Rejected"
                    : userDontOwn
                    ? "Transaction Rejected"
                    : nonExistentToken
                    ? "Token problem"
                    : nftNotApproved
                    ? "Transaction Rejected"
                    : nftAlreadyListed
                    ? "Transaction failed"
                    : listingFailed
                    ? "Listing Failed"
                    : delistingFailed
                    ? "Delisting Failed"
                    : updateFailed
                    ? "Update Failed"
                    : withdrawFailed
                    ? "Withdrawal Failed"
                    : "Error",
                userDenied
                    ? "You rejected the transaction."
                    : userDontOwn
                    ? "You don't own the desired NFT for sell or swap"
                    : nonExistentToken
                    ? "Token does not exist"
                    : nftNotApproved
                    ? "The NFT is not approved for transactions."
                    : nftAlreadyListed
                    ? "The NFT is already listed"
                    : listingFailed
                    ? "Failed to list the NFT. Please ensure it meets all listing requirements."
                    : delistingFailed
                    ? "Failed to delist the NFT. Please try again or contact support."
                    : updateFailed
                    ? "Failed to update the NFT. Please check the details and try again."
                    : withdrawFailed
                    ? "Failed to withdraw proceeds. Please ensure you have available funds to withdraw."
                    : error.message || "Failed to process the transaction.",
                "error"
            )
        },
        [showNftNotification]
    )

    return { handleTransactionError }
}
