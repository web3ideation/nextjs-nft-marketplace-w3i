// Importing React core
import React from "react"

// Importing user-created modal components
import ChatModal from "./ModalType/ChatModal/ChatModal"
import NftInfoModal from "./ModalType/InfoModal/NFTInfoModal"
import NFTCollectionModal from "./ModalType/CollectionModal/NFTCollectionModal"
import NFTUpdateListingModal from "./ModalType/UpdateListingModal/NFTUpdateListingModal"
// Importing custom hooks
import { useModal } from "../../../context/ModalProvider"

// ModalRenderer: A component to render different types of modals based on the modal type
const ModalRenderer = () => {
    // Destructuring modalType and isModalOpen from the useModal hook
    const { modalType, isModalOpen } = useModal()

    // Return null if the modal is not open
    if (!isModalOpen) return null

    // Switch statement to determine which modal to render based on the modalType
    switch (modalType) {
        case "chat":
            return <ChatModal />
        case "info":
        case "sell":
        case "list":
            // 'info', 'sell', and 'list' share the same modal type: NftInfoModal
            return <NftInfoModal />
        case "collection":
            return <NFTCollectionModal />
        case "update":
            return <NFTUpdateListingModal />
        default:
            // Return null for unknown modal types
            return null
    }
}

// Exporting the ModalRenderer component
export default ModalRenderer
