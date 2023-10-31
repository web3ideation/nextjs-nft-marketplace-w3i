import React from "react"
import { useNFT } from "../components/NFTContextProvider"
import NFTBox from "./NFTBox"
import { Modal, Button } from "web3uikit"

export default function NFTCollectionModal({ onClose, selectedCollection }) {
    // Retrieve NFT data and loading state using custom hook
    const { nftsData, loadingImage } = useNFT()

    // Extrahieren Sie die ausgewählte Sammlung aus den NFT-Sammlungen
    const selectedCollectionData = nftCollections.find(
        (collectionData) => collectionData.nftAddress === selectedCollection.nftAddress
    )

    // Extrahieren Sie die NFTs der ausgewählten Sammlung
    const selectedNFTs = selectedCollectionData ? selectedCollectionData.items : []

    // Filtern Sie nftsData basierend auf selectedNFTs
    const filteredNFTsData = nftsData.filter((nftData) =>
        selectedNFTs.some(
            (selectedNFT) =>
                selectedNFT.nftAddress === nftData.nftAddress &&
                selectedNFT.tokenId === nftData.tokenId
        )
    )

    return (
        <Modal
            onCancel={onClose}
            cancelText="Close"
            closeButton={<Button disabled text=""></Button>}
            width="max-content"
        >
            <div className="nft-collection-modal">
                <div className="modal-content">
                    <h2>Collection</h2>
                    <div className="nft-collection">
                        {filteredNFTsData.map((filteredNftData) => (
                            <NFTBox
                                key={`${filteredNftData.nftAddress}${filteredNftData.tokenId}`}
                                nftData={filteredNftData}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    )
}
