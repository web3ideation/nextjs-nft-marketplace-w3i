// React imports
import React, { useState, useEffect, useRef } from "react"

// ------------------ Third-Party Imports ------------------
import { CSSTransition } from "react-transition-group"

// ------------------ Custom Hook Imports ------------------
import { useNFT } from "../../../context/NFTDataProvider"

// ------------------ Component Imports ------------------
import NFTTable from "../NftTable/NFTTable"
import NFTTableElement from "../NftTable/NftTableElement/NFTTableElement"
import NFTCollectionModal from "../Modals/NFTCollectionModal"

// Style imports
import styles from "../../../styles/Home.module.css"

function NFTCollection() {
    // Hooks & Data Retrieval
    const { collections: nftCollections, loadingImage, reloadNFTs } = useNFT()

    // State Management
    const [selectedCollection, setSelectedCollection] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [anyModalIsOpen, setAnyModalIsOpen] = useState(false)
    const modalRef = useRef(null)

    // Modal handling functions
    const handleOpenModal = (collection) => {
        setSelectedCollection(collection)
        setShowModal(true)
    }

    const handleCloseModal = () => {
        setShowModal(false)
    }

    // Listener for modals' state
    useEffect(() => {
        setAnyModalIsOpen(showModal)
    }, [showModal])

    // Reload NFT collections on component mount
    useEffect(() => {
        reloadNFTs()
    }, [reloadNFTs])

    // Handle modal open/close effects on body overflow
    useEffect(() => {
        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = anyModalIsOpen ? "hidden" : "auto"
        return () => {
            document.body.style.overflow = previousOverflow
        }
    }, [anyModalIsOpen])

    // Sort collections based on collectionPrice in descending order
    const sortedCollections = [...nftCollections].sort(
        (a, b) => b.collectionPrice - a.collectionPrice
    )

    // Create table rows for each collection
    const tableRows = sortedCollections.map((collection) => (
        <NFTTableElement
            key={`${collection.nftAddress}${collection.itemCount}`}
            collection={collection}
            loadingImage={loadingImage}
            onClick={() => handleOpenModal(collection)}
        />
    ))

    // Render Function
    return (
        <div className={styles.nftTableContainer}>
            <div className={styles.nftTableWrapper}>
                <h1>Top Value</h1>
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
                    >
                        <NFTCollectionModal
                            ref={modalRef}
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
