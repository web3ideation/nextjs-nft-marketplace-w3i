// ------------------ React Imports ------------------
import React, { forwardRef, useEffect, useState } from "react"

// User-created hooks and components
import { useNFT } from "../../../../../context/NFTDataProvider"
import { useModal } from "../../../../../context/ModalProvider"
import Modal from "../../ModalBasis/Modal"
import NFTModalList from "../../ModalElements/ModalCollectionList/NFTModalList"

// Utility imports
import { fetchEthToEurRate } from "../../../../../utils/fetchEthToEurRate"
import { formatPriceToEther } from "../../../../../utils/formatting"

// ------------------ Styles ------------------
import styles from "./CollectionModal.module.scss"

// Component for displaying a modal with NFT collection details
const NFTCollectionModal = forwardRef((prop, ref) => {
    // Retrieve NFT data using a custom hook
    const { data: nftsData } = useNFT()
    const { modalContent } = useModal()

    console.log("Collection modal content", modalContent)
    const selectedCollection = modalContent

    const [priceInEur, setPriceInEur] = useState(null)
    console.log("SElected", selectedCollection)
    // Find the selected collection from the list of NFT collections

    // Extract NFTs of the selected collection
    const selectedNFTs = selectedCollection ? selectedCollection.items : []
    const filteredNFTsData = nftsData.filter((nftData) =>
        selectedNFTs.some(
            (selectedNFT) =>
                selectedNFT.nftAddress === nftData.nftAddress &&
                selectedNFT.tokenId === nftData.tokenId
        )
    )
    // Sort the filtered NFTs data by tokenId
    filteredNFTsData.sort((a, b) => parseInt(a.tokenId) - parseInt(b.tokenId))

    useEffect(() => {
        const updatePriceInEur = async () => {
            const ethToEurRate = await fetchEthToEurRate()
            if (ethToEurRate) {
                const ethPrice = formatPriceToEther(selectedCollection.collectionPrice)
                setPriceInEur(ethPrice * ethToEurRate)
            }
        }
        updatePriceInEur()
    }, [selectedCollection.collectionPrice])

    return (
        <Modal
            ref={ref}
            key={selectedCollection?.nftAddress}
            modalTitle={selectedCollection.collectionName + " Collection"}
        >
            <div className={styles.collectionModalContentWrapper}>
                {selectedCollection && (
                    <NFTModalList filterAddress={selectedCollection.nftAddress} />
                )}
                <div className={styles.collectionModalContent}>
                    <div className={styles.collectionModalTextWrapper}>
                        <div className={styles.collectionModalText}>
                            <div>
                                <p>Collection address:</p>
                                <strong>{selectedCollection.nftAddress}</strong>
                            </div>
                            <div>
                                <p>Items: </p>
                                <strong>{selectedCollection.count}</strong>
                            </div>
                            <div>
                                <p>Token-Id's: </p>
                                <strong>
                                    {selectedCollection.tokenIds.split(",").join(", ")}
                                </strong>
                            </div>
                            <div>
                                <p>Volume:</p>
                                <strong>
                                    {formatPriceToEther(selectedCollection.collectionPrice)}
                                    ETH
                                </strong>
                                <strong>{priceInEur ? `${priceInEur} €` : "Loading..."}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
})

export default NFTCollectionModal
