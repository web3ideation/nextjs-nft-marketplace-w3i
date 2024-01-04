// React Imports
import React, { useState, useEffect, useRef } from "react"

// Custom Hooks and Components
import { useNFT } from "../../../context/NFTDataProvider"
import NFTTable from "../NftTable/NFTTable"
import NFTTableElement from "../NftTable/NftTableElement/NFTTableElement"
import NFTCollectionModal from "../Modals/NFTCollectionModal"

// Style Imports
import styles from "../../../styles/Home.module.css"

// Third-Party Imports
import { CSSTransition } from "react-transition-group"

function NFTCollection() {
    // State management for NFT collections and modal states
    const { collections: nftCollections, loadingImage, reloadNFTs } = useNFT()
    const [selectedCollection, setSelectedCollection] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [anyModalIsOpen, setAnyModalIsOpen] = useState(false)
    const modalRef = useRef(null)

    // Opens the modal and sets the selected collection
    const handleOpenModal = (collection) => {
        setSelectedCollection(collection)
        setShowModal(true)
    }

    // Closes the modal
    const handleCloseModal = () => {
        setShowModal(false)
    }

    // Update modal state on showModal change
    useEffect(() => {
        setAnyModalIsOpen(showModal)
    }, [showModal])

    // Reload NFT collections on dependency change
    useEffect(() => {
        reloadNFTs()
    }, [reloadNFTs])

    // Handle body overflow when modal is open/closed
    useEffect(() => {
        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = anyModalIsOpen ? "hidden" : "auto"
        return () => {
            document.body.style.overflow = previousOverflow
        }
    }, [anyModalIsOpen])

    // Sort collections based on collection count in descending order
    const sortedCollections = [...nftCollections].sort(
        (a, b) => b.collectionCount - a.collectionCount
    )

    // Map each collection to a table row element
    const tableRows = sortedCollections.map((collection) => (
        <NFTTableElement
            key={`${collection.nftAddress}${collection.itemCount}`}
            collection={collection}
            loadingImage={loadingImage}
            onClick={() => handleOpenModal(collection)}
        />
    ))

    // Render component
    return (
        <div className={styles.nftTableContainer}>
            <div className={styles.nftTableWrapper}>
                <h1>Top 10</h1>
                <div id="NFTCollection" className={styles.nftCollection}>
                    <NFTTable tableRows={tableRows} />
                    <CSSTransition
                        in={showModal}
                        timeout={400}
                        classNames={{
                            enter: styles.modalTransitionEnter,
                            enterActive: styles.modalTransitionEnterActive,
                            exit: styles.modalTransitionExit,
                            exitActive: styles.modalTransitionExitActive,
                        }}
                        unmountOnExit
                        nodeRef={modalRef}
                    >
                        <NFTCollectionModal
                            closeModal={handleCloseModal}
                            selectedCollection={selectedCollection}
                            nftCollections={nftCollections}
                        />
                    </CSSTransition>
                </div>
            </div>
        </div>
    )
}

export default NFTCollection
