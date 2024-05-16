import React, { forwardRef, useEffect, useState } from "react"

import { useNFT } from "@context/NftDataProvider"
import { useModal } from "@context/ModalProvider"

import Modal from "@components/Modal/ModalBasis/Modal"
import ModalList from "@components/Modal/ModalElements/NftModalCollectionList/ModalList"

import { fetchEthToEurRate } from "@utils/fetchEthToEurRate"
import { formatPriceToEther, truncatePrice } from "@utils/formatting"

import styles from "./CollectionModal.module.scss"

const NFTCollectionModal = forwardRef((prop, ref) => {
    const { data: nftsData } = useNFT()
    const { modalContent: selectedCollection } = useModal()

    const [priceInEur, setPriceInEur] = useState(null)

    const selectedNFTs = selectedCollection ? selectedCollection.items : []
    const filteredNFTsData = nftsData.filter((nftData) =>
        selectedNFTs.some(
            (selectedNFT) =>
                selectedNFT.nftAddress === nftData.nftAddress &&
                selectedNFT.tokenId === nftData.tokenId
        )
    )

    filteredNFTsData.sort((a, b) => parseInt(a.tokenId) - parseInt(b.tokenId))

    useEffect(() => {
        setPriceInEur(truncatePrice(priceInEur, 10))
    }, [priceInEur])

    useEffect(() => {
        const updatePriceInEur = async () => {
            const ethToEurRate = await fetchEthToEurRate()
            if (ethToEurRate) {
                const ethPrice = formatPriceToEther(selectedCollection.collectionPrice)
                setPriceInEur(ethPrice * ethToEurRate)
            }
        }
        if (selectedCollection.collectionPrice) updatePriceInEur()
    }, [selectedCollection.collectionPrice])

    return (
        <Modal
            ref={ref}
            key={selectedCollection?.nftAddress}
            modalTitle={`${selectedCollection.collectionName} Collection`}
        >
            <div className={styles.collectionModalContentWrapper}>
                <ModalList filterAddress={selectedCollection?.nftAddress} />
                <div className={styles.collectionModalContent}>
                    <div className={styles.collectionModalTextWrapper}>
                        <div className={styles.collectionModalText}>
                            <div>
                                <p>Collection address: </p>
                                <strong>{selectedCollection?.nftAddress}</strong>
                            </div>
                            <div>
                                <p>Items:</p>
                                <strong>{selectedCollection?.count}</strong>
                            </div>
                            <div>
                                <p>Token-Id's: </p>
                                <strong>
                                    {selectedCollection?.tokenIds.split(",").join(", ")}
                                </strong>
                            </div>
                            <div>
                                <p>Volume: </p>
                                <strong>
                                    {formatPriceToEther(selectedCollection?.collectionPrice)} ETH
                                </strong>
                                <strong>
                                    {priceInEur ? ` (${priceInEur} €)` : " Loading..."}
                                </strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
})

export default NFTCollectionModal
