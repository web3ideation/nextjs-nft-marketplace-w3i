import styles from "../styles/Home.module.css"
import React, { useState, useEffect, useRef } from "react"
import { useMoralis } from "react-moralis"
import networkMapping from "../constants/networkMapping.json"
import NFTTableElement from "../components/NFTTableElement"
import NFTCollectionModal from "../components/NFTCollectionModal"
import { CSSTransition } from "react-transition-group"

export default function NFTTable({ nftCollections, loadingImage }) {
    // ------------------ Hooks & Data Retrieval ------------------

    // Retrieve blockchain and user data using Moralis hook
    const { chainId, isWeb3Enabled } = useMoralis()

    // Convert chain ID to string format
    const chainString = chainId ? parseInt(chainId).toString() : "31337"

    // Get the marketplace address based on the current chain
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]

    const modalRef = useRef(null)

    // ------------------ State Management ------------------

    // Web3 and User related states
    const [isConnected, setIsConnected] = useState(isWeb3Enabled)
    const [selectedCollection, setSelectedCollection] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [anyModalIsOpen, setAnyModalIsOpen] = useState(false)

    const handleOpenModal = (collection) => {
        setSelectedCollection(collection)

        setShowModal(true)
    }

    const handleCloseModal = () => {
        setShowModal(false) // oder was auch immer der Zustand ist, der das Modal kontrolliert
    }

    // Listener for modals' state
    function modalListener() {
        setAnyModalIsOpen(showModal)
    }

    // ------------------ useEffect Hooks ------------------

    // Handle modal open/close effects on body overflow
    useEffect(() => {
        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = anyModalIsOpen ? "hidden" : "auto"
        return () => {
            document.body.style.overflow = previousOverflow
        }
    }, [anyModalIsOpen])

    // Update connection state and listen to modal changes
    useEffect(() => {
        modalListener()
    }, [showModal])

    // Update connection state
    useEffect(() => {
        setIsConnected(isWeb3Enabled)
    }, [isWeb3Enabled])

    // ------------------ Render Functions ------------------

    return (
        <table className={styles.nftTable}>
            <thead>
                <tr>
                    <th></th>
                    <th>Address</th>
                    <th>Collection Name</th>
                    <th>Items</th>
                    <th>Total price</th>
                </tr>
            </thead>
            <tbody>
                {nftCollections.map((collection) => (
                    <NFTTableElement
                        key={`${collection.nftAddress}${collection.itemCount}`}
                        collection={collection}
                        loadingImage={loadingImage}
                        onClick={() => handleOpenModal(collection)}
                    />
                ))}
                <CSSTransition
                    in={showModal}
                    timeout={400}
                    nodeRef={modalRef}
                    classNames={{
                        enter: styles.modalTransitionEnter,
                        enterActive: styles.modalTransitionEnterActive,
                        exit: styles.modalTransitionExit,
                        exitActive: styles.modalTransitionExitActive,
                    }}
                    unmountOnExit
                >
                    <NFTCollectionModal
                        onClose={handleCloseModal}
                        selectedCollection={selectedCollection} // Korrigierte Prop-Übergabe
                        nftCollections={nftCollections}
                    />
                </CSSTransition>
            </tbody>
        </table>
    )
}
