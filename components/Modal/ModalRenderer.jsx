import React from "react"

import ChatModal from "./ModalType/ChatModal/ChatModal"
import InfoModal from "./ModalType/InfoModal/InfoModal"
import CollectionModal from "./ModalType/CollectionModal/CollectionModal"
import UpdateListingModal from "./ModalType/UpdateListingModal/UpdateListingModal"
import TransactionModal from "./ModalType/TransactionModal/TransactionModal"

import { useModal } from "@context/ModalProvider"

const ModalRenderer = () => {
    const { modalType, isModalOpen } = useModal()

    if (!isModalOpen) return null

    switch (modalType) {
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
            return <TransactionModal />
        default:
            return null
    }
}

export default ModalRenderer
