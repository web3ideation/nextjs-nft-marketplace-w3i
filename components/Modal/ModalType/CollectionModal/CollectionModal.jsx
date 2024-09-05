import React, { forwardRef, useEffect, useState } from "react"

import { useNFT } from "@context/NftDataProvider"
import { useModal } from "@context/ModalProvider"

import Modal from "@components/Modal/ModalBasis/Modal"
import ModalList from "@components/Modal/ModalElements/NftModalCollectionList/ModalList"

import useEthToEurRate from "@hooks/ethToEurRate/useEthToEurRate"
import { formatPriceToEther, truncatePrice, truncateStr } from "@utils/formatting"

import styles from "./CollectionModal.module.scss"

const CollectionModal = forwardRef((prop, ref) => {
    const { data: nftsData } = useNFT()
    const { modalContent: selectedCollection } = useModal()

    const { ethToEurRate } = useEthToEurRate()
    const [collectionPriceInEur, setCollectionPriceInEur] = useState(0)
    const [formattedPriceETH, setFormattedPriceETH] = useState("")
    const [formattedPriceEUR, setFormattedPriceEUR] = useState("")

    const selectedNFTs = selectedCollection ? selectedCollection.items : []
    const filteredNFTsData = nftsData.filter((nftData) =>
        selectedNFTs.some(
            (selectedNFT) =>
                selectedNFT.nftAddress === nftData.nftAddress &&
                selectedNFT.tokenId === nftData.tokenId
        )
    )

    filteredNFTsData.sort((a, b) => parseInt(a.tokenId) - parseInt(b.tokenId))

    // Update the price in EUR only if we have both the price and the exchange rate
    useEffect(() => {
        if (selectedCollection?.collectionPrice && ethToEurRate) {
            const ethPrice = formatPriceToEther(selectedCollection.collectionPrice)
            setCollectionPriceInEur(ethPrice * ethToEurRate)
            setFormattedPriceETH(truncatePrice(ethPrice, 5))
            setFormattedPriceEUR(truncatePrice(ethPrice * ethToEurRate, 2))
        } else {
            setCollectionPriceInEur(0)
            setFormattedPriceETH("0")
            setFormattedPriceEUR("0")
        }
    }, [selectedCollection?.collectionPrice, ethToEurRate])

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
                                <strong>
                                    {truncateStr(selectedCollection?.nftAddress, 5, 5)}
                                </strong>
                            </div>
                            <div>
                                <p>Items:</p>
                                <strong>{selectedCollection?.count}</strong>
                            </div>
                            <div>
                                <p>{"Token-Id's: "}</p>
                                <strong>
                                    {selectedCollection?.tokenIds?.split(",").join(", ") || "N/A"}
                                </strong>
                            </div>
                            <div>
                                <p>Volume: </p>
                                <strong>{formattedPriceETH} ETH</strong>
                                <strong>{formattedPriceEUR} €</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
})

CollectionModal.displayName = "CollectionModal"

export default CollectionModal
