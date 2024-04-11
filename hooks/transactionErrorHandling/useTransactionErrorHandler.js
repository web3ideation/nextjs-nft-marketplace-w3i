import { useCallback } from "react"
import { useNftNotification } from "@context/NotificationProvider"

export const useTransactionErrorHandler = () => {
    const { showNftNotification } = useNftNotification()

    const handleTransactionError = useCallback(
        (error) => {
            const errorMessageMapping = {
                "User denied transaction signature": {
                    title: "Transaction Rejected",
                    description: "You rejected the transaction.",
                },
                "0xa9fbf51f": {
                    title: "Transaction Rejected",
                    description: "You don't own the desired NFT for sell or swap",
                },
                "0x7e273289": { title: "Token problem", description: "Token does not exist" },
                NftMarketplace__NotApproved: {
                    title: "Transaction Rejected",
                    description: "The NFT is not approved for transactions.",
                },
                NftMarketplace__AlreadyListed: {
                    title: "Transaction failed",
                    description: "The NFT is already listed",
                },
                "Failed to list the NFT.": {
                    title: "Listing Failed",
                    description:
                        "Failed to list the NFT. Please ensure it meets all listing requirements.",
                },
                "Failed to delist the NFT.": {
                    title: "Delisting Failed",
                    description: "Failed to delist the NFT. Please try again or contact support.",
                },
                "Failed to update the NFT.": {
                    title: "Update Failed",
                    description:
                        "Failed to update the NFT. Please check the details and try again.",
                },
                "Failed to withdraw proceeds.": {
                    title: "Withdrawal Failed",
                    description:
                        "Failed to withdraw proceeds. Please ensure you have available funds to withdraw.",
                },
                "invalid token ID": {
                    title: "Listing Failed",
                    description: "Failed to list the NFT. Please ensure your token ID is correct.",
                },
                "Execution reverted for an unknown reason": {
                    title: "Transaction Failed",
                    description:
                        "Transaction failed for unknown reason check all parameters and try again.",
                },
            }

            const foundError = Object.entries(errorMessageMapping).find(([key]) =>
                error.message.includes(key)
            )

            const { title, description } = foundError
                ? errorMessageMapping[foundError[0]]
                : {
                      title: "Error",
                      description: error.message || "Failed to process the transaction.",
                  }

            showNftNotification(title, description, "error")
        },
        [showNftNotification]
    )

    return { handleTransactionError }
}
