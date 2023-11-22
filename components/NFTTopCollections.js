import React, { useState, useEffect, useRef } from "react"
import NFTTable from "../components/NFTTable"
import NFTTableElement from "../components/NFTTableElement"
import NFTCollectionModal from "../components/NFTCollectionModal"
import { CSSTransition } from "react-transition-group"
import { useNFT } from "../context/NFTContextProvider"
import { useMoralis } from "react-moralis"
import networkMapping from "../constants/networkMapping.json"
import styles from "../styles/Home.module.css"

function NFTCollection() {
    // Hooks & Data Retrieval
    const { nftCollections, loadingImage } = useNFT()
    const { chainId, isWeb3Enabled } = useMoralis()

    // State Management
    const [isConnected, setIsConnected] = useState(isWeb3Enabled)
    const [selectedCollection, setSelectedCollection] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [anyModalIsOpen, setAnyModalIsOpen] = useState(false)

    const modalRef = useRef(null)

    // Convert chain ID to string format
    const chainString = chainId ? parseInt(chainId).toString() : "31337"

    // Get the marketplace address based on the current chain
    const marketplaceAddress = networkMapping[chainString]?.NftMarketplace[0]

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

    // Update connection state
    useEffect(() => {
        setIsConnected(isWeb3Enabled)
    }, [isWeb3Enabled])

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
                <h1>NFT Top Collections</h1>
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
