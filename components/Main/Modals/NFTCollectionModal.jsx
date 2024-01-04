// ------------------ React Imports ------------------
import React, { forwardRef } from "react"

// User-created hooks and components
import { useNFT } from "../../../context/NFTDataProvider"
import Modal from "./ModalsBasis/Modal"
import NFTModalList from "./ModalCollectionList/NFTModalList"
import { formatPriceToEther } from "../../../utils/formatting"

// ------------------ Styles ------------------
import styles from "../../../styles/Home.module.css"

// Component for displaying a modal with NFT collection details
const NFTCollectionModal = forwardRef(
    ({ closeModal, selectedCollection, nftCollections }, ref) => {
        // Retrieve NFT data using a custom hook
        const { data: nftsData } = useNFT()

        // Find the selected collection from the list of NFT collections
        const selectedCollectionData = nftCollections.find(
            (collectionData) => collectionData.nftAddress === selectedCollection.nftAddress
        )

        // Extract NFTs of the selected collection
        const selectedNFTs = selectedCollectionData ? selectedCollectionData.items : []
        const filteredNFTsData = nftsData.filter((nftData) =>
            selectedNFTs.some(
                (selectedNFT) =>
                    selectedNFT.nftAddress === nftData.nftAddress &&
                    selectedNFT.tokenId === nftData.tokenId
            )
        )
        // Sort the filtered NFTs data by tokenId
        filteredNFTsData.sort((a, b) => parseInt(a.tokenId) - parseInt(b.tokenId))

        return (
            <Modal
                key={selectedCollection.nftAddress}
                isVisible={true}
                cancelText="CLOSE"
                onCancel={closeModal}
            >
                <div ref={ref} className={styles.collectionModalContentWrapper}>
                    <h2>
                        {selectedCollectionData.collectionName} <br /> Collection
                    </h2>
                </div>
                <div className={styles.modalMoreNftsWrapper}>
                    <NFTModalList filterAddress={selectedCollection.nftAddress} />
                </div>
                <div className={styles.collectionModalTextWrapper}>
                    <div className={styles.collectionModalTextInnerWrapper}>
                        <div className={styles.collectionModalText}>
                            <div>
                                <p>Items: </p>
                                <strong>{selectedCollectionData.count}</strong>
                            </div>
                            <div>
                                <p>Token-Id's: </p>
                                <strong>
                                    {selectedCollectionData.tokenIds.split(",").join(", ")}
                                </strong>
                            </div>
                            <div>
                                <p>Volume:</p>
                                <strong>
                                    {formatPriceToEther(selectedCollectionData.collectionPrice)}
                                    ETH
                                </strong>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        )
    }
)

export default NFTCollectionModal
