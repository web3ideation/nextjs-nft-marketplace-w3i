// hooks/useTransactionErrorHandler.js
import { useCallback } from "react"
import { useNftNotification } from "../context/NotificationProvider"

export const useTransactionErrorHandler = () => {
    const { showNftNotification } = useNftNotification()

    const handleTransactionError = useCallback(
        (error) => {
            const userDenied = error.message.includes("User denied transaction signature")
            const userDontOwn = error.message.includes("You don't own the desired NFT for swap")
            const userNFTNotApproved = error.message.includes(
                "NftMarketplace__NotApprovedForMarketplace()"
            )
            showNftNotification(
                userDenied
                    ? "Transaction Rejected"
                    : userDontOwn
                    ? "Transaction Rejected"
                    : userNFTNotApproved
                    ? "NFT Not Approved"
                    : "Error",
                userDenied
                    ? "You rejected the transaction."
                    : userDontOwn
                    ? "You don't own the desired NFT for swap"
                    : userNFTNotApproved
                    ? "You own the NFT to swap but it is not approved for the marketplace. You need to list the NFT."
                    : error.message || "Failed to buy the NFT.",
                userDenied || userDontOwn ? "error" : "error"
            )
        },
        [showNftNotification]
    )

    return { handleTransactionError }
}
