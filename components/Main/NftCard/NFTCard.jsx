// ------------------ React & Next.js Imports ------------------
import { useState, useEffect } from "react"
import Image from "next/image"

// ------------------ Third-Party Imports ------------------
import { useAccount } from "wagmi"

// ------------------ Custom Hook Imports ------------------
import { useModal } from "../../../context/ModalProvider"

// ------------------ Component Imports ------------------
import LoadingWave from "../ux/LoadingWave"

// ------------------ Utility Imports ------------------
import { formatPriceToEther, truncatePrice } from "../../../utils/formatting"
import { fetchEthToEurRate } from "../../../utils/fetchEthToEurRate"

// ------------------ Constant & Style Imports ------------------
import styles from "./NFTCard.module.scss"

// ------------------ Main Component Function ------------------
export default function NFTBox({ nftData }) {
    // Destructuring for clarity
    const {
        tokenOwner,
        tokenId,
        price,
        isListed,
        listingId,
        imageURI,
        collectionName,
        tokenSymbol,
        tokenDescription,
        desiredNftAddress,
    } = nftData

    // Context and hook usage for data and actions
    const { address, isConnected } = useAccount()

    // Verwenden Sie ModalContext
    const { openModal } = useModal()

    // Derived state calculations
    const isOwnedByUser = isConnected && tokenOwner?.toLowerCase() === address?.toLowerCase()
    const formattedPrice = formatPriceToEther(price)
    const [priceInEur, setPriceInEur] = useState(null)
    const [formattedPriceInEur, setFormattedPriceInEur] = useState()
    const [isImageLoading, setIsImageLoading] = useState(true) // New state for image loading

    // State für die Deckkraft von Bild und Ladeindikator
    const [imageOpacity, setImageOpacity] = useState(0)
    const [loadingWaveOpacity, setLoadingWaveOpacity] = useState(1)

    const isListedForSwap = desiredNftAddress !== "0x0000000000000000000000000000000000000000"

    const handleCardClick = (nftData) => {
        console.log("Card Clicked. Owned by user:", isOwnedByUser, "Listed:", isListed)
        console.log("NFT Address:", nftData.nftAddress, "Token ID:", nftData.tokenId)
        const modalId = "nftBoxModal-" + `${nftData.nftAddress}${nftData.tokenId}`

        if (!isOwnedByUser) {
            console.log("Opening Info Modal")

            openModal("info", modalId, nftData)
        } else if (isOwnedByUser && isListed) {
            console.log("Opening Sell Modal")
            openModal("sell", modalId, nftData)
        } else if (isOwnedByUser && !isListed) {
            console.log("Opening List Modal")

            openModal("list", modalId, nftData)
        }
    }

    useEffect(() => {
        setFormattedPriceInEur(truncatePrice(priceInEur, 5))
    }, [priceInEur])

    useEffect(() => {
        const updatePriceInEur = async () => {
            const ethToEurRate = await fetchEthToEurRate()
            if (ethToEurRate) {
                const ethPrice = formatPriceToEther(price)
                setPriceInEur(ethPrice * ethToEurRate)
            }
        }
        updatePriceInEur()
    }, [price])

    // Sobald das Bild geladen ist, aktualisieren Sie die Deckkraft
    const handleImageLoad = () => {
        setImageOpacity(1) // Bild einblenden
        setLoadingWaveOpacity(0) // Ladeindikator ausblenden
    }

    // ------------------ Component Return ------------------

    return (
        <>
            {imageURI ? (
                <div className={styles.nftCardWrapper}>
                    <div className={styles.nftCard} onClick={() => handleCardClick(nftData)}>
                        <div className={styles.cardBackgroundImage}>
                            <div
                                className={styles.cardImageLoadingWaveWrapper}
                                style={{ opacity: loadingWaveOpacity }}
                            >
                                <LoadingWave />
                            </div>
                            <Image
                                src={imageURI.src}
                                layout="responsive"
                                width={300}
                                height={300}
                                loading="lazy"
                                alt={tokenDescription || "..."}
                                className={styles.cardImage}
                                style={{ opacity: imageOpacity }}
                                onLoadingComplete={handleImageLoad}
                            />
                        </div>

                        <div className={styles.cardContent}>
                            <div className={styles.cardTitleWrapper}>
                                <div className={styles.cardTitle}>
                                    <h2>{tokenSymbol}</h2>
                                </div>
                                <div>#{tokenId}</div>
                            </div>
                            <div className={styles.cardTextArea}>
                                <div className={styles.cardSwapAndListingStatusWrapper}>
                                    <div>
                                        {isListedForSwap ? <div>Swap</div> : <div>Sell</div>}
                                    </div>
                                    <div>
                                        {isListed ? (
                                            <div className={styles.cardListedStatus}>
                                                Listed #{listingId}
                                            </div>
                                        ) : (
                                            <div className={styles.cardNotListedStatus}>
                                                Not Listed #{listingId}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className={styles.cardPriceWrapper}>
                                    <div className={styles.cardPrice}>
                                        {formattedPrice} ETH{/*Ξ*/}
                                    </div>
                                    {priceInEur && <strong>{formattedPriceInEur} €</strong>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <LoadingWave />
            )}
        </>
    )
}
