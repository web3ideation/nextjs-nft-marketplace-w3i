import React, { useState, useEffect, useRef } from "react"
import NFTTable from "../components/NFTTable"
import NFTTableElement from "../components/NFTTableElement"
import NFTCollectionModal from "../components/ui/NFTCollectionModal"
import { CSSTransition } from "react-transition-group"
import { useNFT } from "../context/NFTContextProvider"
import styles from "../styles/Home.module.css"

function NFTCollection() {
    // Hooks & Data Retrieval
    const { collections: nftCollections, loadingImage } = useNFT()

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

    // Handle modal open/close effects on body overflow
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

    // Generate table rows for each collection
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
