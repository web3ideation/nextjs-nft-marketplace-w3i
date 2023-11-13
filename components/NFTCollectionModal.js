import React from "react"
import { useNFT } from "../context/NFTContextProvider"
import NFTBox from "./NFTBox"
import Modal from "../components/Modal"
import { ethers } from "ethers"
import styles from "../styles/Home.module.css"

export default function NFTCollectionModal({ onClose, selectedCollection, nftCollections, type }) {
    // Retrieve NFT data and loading state using custom hook
    const { nftsData, loadingImage } = useNFT()

    // Extrahieren Sie die ausgewählte Sammlung aus den NFT-Sammlungen
    const selectedCollectionData = nftCollections.find(
        (collectionData) => collectionData.nftAddress === selectedCollection.nftAddress
    )

    // Extrahieren Sie die NFTs der ausgewählten Sammlung
    const selectedNFTs = selectedCollectionData ? selectedCollectionData.items : []

    const filteredNFTsData = nftsData.filter((nftData) =>
        // Sortieren der filteredNFTsData nach tokenId

        selectedNFTs.some(
            (selectedNFT) =>
                selectedNFT.nftAddress === nftData.nftAddress &&
                selectedNFT.tokenId === nftData.tokenId
        )
    )
    filteredNFTsData.sort((a, b) => parseInt(a.tokenId) - parseInt(b.tokenId))
    // Filtern Sie nftsData basierend auf selectedNFTs
    return (
        <Modal isVisible={true} cancelText="Close" onCancel={onClose}>
            <div className={styles.collectionModalContentWrapper}>
                <h2>{selectedCollectionData.firstTokenName} Collection</h2>
                <div className={styles.collectionModalContent}>
                    {filteredNFTsData.map((filteredNftData) => (
                        <div className={styles.collectionModalContentInnerwrapper}>
                            <NFTBox
                                key={`${filteredNftData.tokenId}${filteredNftData.nftAddress}`}
                                nftData={filteredNftData}
                            />
                        </div>
                    ))}
                </div>
            </div>
            <div className={styles.collectionModalTextWrapper}>
                <div className={styles.modalText}>
                    <div>
                        <p>Items: </p>
                        <strong>{selectedCollectionData.count}</strong>
                    </div>
                    <div>
                        <p>Token-Id's: </p>
                        <strong>{selectedCollectionData.tokenIds}</strong>
                    </div>
                    <div>
                        <p>Volume:</p>
                        <strong>
                            {ethers.utils.formatUnits(
                                selectedCollectionData.collectionPrice,
                                "ether"
                            )}{" "}
                            ETH
                        </strong>
                    </div>
                </div>
            </div>
        </Modal>
    )
}
