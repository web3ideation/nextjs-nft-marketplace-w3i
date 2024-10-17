import React, { forwardRef, useEffect, useState } from "react"
import { useModal, useNotification, useNFT } from "@context"
import { useEthToCurrencyRates } from "@hooks"
import { Modal, CollectionList } from "@components/Modal"
import { formatPriceToEther, truncatePrice, truncateStr, copyNftAddressToClipboard } from "@utils"
import styles from "./CollectionModal.module.scss"

const CollectionModal = forwardRef((prop, ref) => {
    const { data: nftsData } = useNFT()
    const { modalContent: selectedCollection } = useModal()

    const { ethToCurrencyRates } = useEthToCurrencyRates()
    const [collectionPriceInEur, setCollectionPriceInEur] = useState(0)
    const [formattedPriceETH, setFormattedPriceETH] = useState("")
    const [formattedPriceEUR, setFormattedPriceEUR] = useState("")
    const { showNotification } = useNotification()

    const selectedNFTs = selectedCollection ? selectedCollection.items : []
    const filteredNFTsData = nftsData.filter((nftData) =>
        selectedNFTs.some(
            (selectedNFT) =>
                selectedNFT.nftAddress === nftData.nftAddress &&
                selectedNFT.tokenId === nftData.tokenId
        )
    )

    filteredNFTsData.sort((a, b) => parseInt(a.tokenId) - parseInt(b.tokenId))

    const handleCopyAddress = (addressToCopy) => () =>
        copyNftAddressToClipboard(addressToCopy, showNotification)

    // Update the price in EUR only if we have both the price and the exchange rate
    useEffect(() => {
        if (selectedCollection?.collectionPrice && ethToCurrencyRates.eur) {
            const ethPrice = formatPriceToEther(selectedCollection.collectionPrice)
            setCollectionPriceInEur(ethPrice * ethToCurrencyRates.eur)
            setFormattedPriceETH(truncatePrice(ethPrice, 5))
            setFormattedPriceEUR(truncatePrice(ethPrice * ethToCurrencyRates.eur, 2))
        } else {
            setCollectionPriceInEur(0)
            setFormattedPriceETH("0")
            setFormattedPriceEUR("0")
        }
    }, [selectedCollection?.collectionPrice, ethToCurrencyRates.eur])

    return (
        <Modal
            ref={ref}
            key={selectedCollection?.nftAddress}
            modalTitle={`${selectedCollection.collectionName} Collection`}
        >
            <div className={styles.collectionModalContentWrapper}>
                <CollectionList filterAddress={selectedCollection?.nftAddress} />
                <div className={styles.collectionModalContent}>
                    <div className={styles.collectionModalTextWrapper}>
                        <div className={styles.collectionModalText}>
                            <div>
                                <p>Collection address: </p>
                                <strong
                                    className={styles.nftNftAddressToCopy}
                                    title={selectedCollection?.nftAddress}
                                    onClick={handleCopyAddress(selectedCollection.nftAddress)}
                                >
                                    {truncateStr(selectedCollection?.nftAddress, 5, 5)}
                                </strong>
                            </div>
                            <div>
                                <p>Items:</p>
                                <strong>{selectedCollection?.count}</strong>
                            </div>
                            <div>
                                <p>Items listed:</p>
                                <strong>{filteredNFTsData.length}</strong>
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
