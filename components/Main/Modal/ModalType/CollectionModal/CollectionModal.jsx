import React, { forwardRef, useEffect, useState } from "react"

import { useNFT } from "@context/NFTDataProvider"
import { useModal } from "@context/ModalProvider"

import Modal from "@components/Main/Modal/ModalBasis/Modal"
import NFTModalList from "@components/Main/Modal/ModalElements/ModalCollectionList/NFTModalList"

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
                <NFTModalList filterAddress={selectedCollection?.nftAddress} />
                <div className={styles.collectionModalContent}>
                    <div className={styles.collectionModalTextWrapper}>
                        <div className={styles.collectionModalText}>
                            <p>
                                Collection address:{" "}
                                <strong>{selectedCollection?.nftAddress}</strong>
                            </p>
                            <p>
                                Items: <strong>{selectedCollection?.count}</strong>
                            </p>
                            <p>
                                Token-Id's:{" "}
                                <strong>
                                    {selectedCollection?.tokenIds.split(",").join(", ")}
                                </strong>
                            </p>
                            <p>
                                Volume:{" "}
                                <strong>
                                    {formatPriceToEther(selectedCollection?.collectionPrice)} ETH
                                </strong>
                                {priceInEur ? ` (${priceInEur} €)` : " Loading..."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
})

export default NFTCollectionModal
