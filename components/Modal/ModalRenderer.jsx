import React from "react"
import { useModal } from "@context"
import {
    WelcomeModal,
    ChatModal,
    InfoModal,
    CollectionModal,
    UpdateListingModal,
    TransactionModal,
} from "./index"

const ModalRenderer = () => {
    const { modalType, isModalOpen } = useModal()

    if (!isModalOpen) return null

    switch (modalType) {
        case "welcome":
            return <WelcomeModal />
        case "chat":
            return <ChatModal />
        case "info":
        case "sell":
        case "list":
            return <InfoModal />
        case "collection":
            return <CollectionModal />
        case "update":
            return <UpdateListingModal />
        case "listed":
        case "bought":
        case "delisted":
        case "updated":
        case "withdrawn":
        case "transaction":
            return <TransactionModal />
        default:
            return null
    }
}

export default ModalRenderer
