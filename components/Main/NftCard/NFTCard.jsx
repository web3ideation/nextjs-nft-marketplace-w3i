// ------------------ React & Next.js Imports ------------------
import { useState, useEffect } from "react"
import Image from "next/image"

// ------------------ Third-Party Imports ------------------
import { useAccount } from "wagmi"

// ------------------ Custom Hook Imports ------------------
import { useModal } from "@context/ModalProvider"

// ------------------ Component Imports ------------------
import LoadingWave from "@components/UX/LoadingWave/LoadingWave"

// ------------------ Utility Imports ------------------
import { formatPriceToEther, truncatePrice } from "@utils/formatting"
import { fetchEthToEurRate } from "@utils/fetchEthToEurRate"

// ------------------ Constant & Style Imports ------------------
import styles from "./NFTCard.module.scss"

// ------------------ Main Component Function ------------------
export default function NFTCard({ nftData }) {
    // Destructuring for clarity
    const { isListed, listingId, tokenOwner, desiredNftAddress } = nftData

    // Context and hook usage for data and actions
    const { address, isConnected } = useAccount()
    // Standardwerte für den Ladezustand
    const defaultImageURI = "/path/to/default/image.jpg" // Pfad zu einem Standardbild
    const defaultTokenSymbol = "LOADING..."
    const defaultTokenId = "000"
    const defaultPrice = "0"
    const defaultTokenDescription = "Description is loading..."
    const defaultCollectionName = "Collection loading..."

    // Zustandsvariablen für NFT-Daten, initialisiert mit Standardwerten
    const [imageURI, setImageURI] = useState(defaultImageURI)
    const [tokenSymbol, setTokenSymbol] = useState(defaultTokenSymbol)
    const [tokenId, setTokenId] = useState(defaultTokenId)
    const [price, setPrice] = useState(defaultPrice)
    const [tokenDescription, setTokenDescription] = useState(defaultTokenDescription)
    const [collectionName, setCollectionName] = useState(defaultCollectionName)
    const imageURISrc = imageURI.src
    // ... Weitere Zustandsvariablen für andere NFT-Eigenschaften

    // useEffect Hook, um echte Daten zu laden und Zustände zu aktualisieren
    useEffect(() => {
        if (nftData) {
            // Annahme: nftData enthält alle benötigten Informationen
            setImageURI(nftData.imageURI || defaultImageURI)
            setTokenSymbol(nftData.tokenSymbol || defaultTokenSymbol)
            setTokenId(nftData.tokenId || defaultTokenId)
            setPrice(nftData.price || defaultPrice)
            setTokenDescription(nftData.tokenDescription || defaultTokenDescription)
            setCollectionName(nftData.collectionName || defaultCollectionName)
            // ... Zustände für andere NFT-Eigenschaften aktualisieren
        }
    }, [nftData]) // Abhängigkeiten, hier nftData, damit der Effekt ausgeführt wird, wenn sich nftData ändert

    // Verwenden Sie ModalContext
    const { openModal } = useModal()

    // Derived state calculations
    const isOwnedByUser = isConnected && tokenOwner?.toLowerCase() === address?.toLowerCase()
    const formattedPrice = formatPriceToEther(price)
    const [priceInEur, setPriceInEur] = useState(null)
    const [formattedPriceInEur, setFormattedPriceInEur] = useState()

    // State für die Deckkraft von Bild und Ladeindikator
    const [imageOpacity, setImageOpacity] = useState(0)
    const [loadingWaveOpacity, setLoadingWaveOpacity] = useState(1)

    const isListedForSwap = desiredNftAddress !== "0x0000000000000000000000000000000000000000"

    const handleCardClick = (nftData) => {
        const modalId = "nftCardModal-" + `${nftData.nftAddress}${nftData.tokenId}`

        if (!isOwnedByUser) {
            openModal("info", modalId, nftData)
        } else if (isOwnedByUser && isListed) {
            openModal("sell", modalId, nftData)
        } else if (isOwnedByUser && !isListed) {
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
            {imageURISrc && (
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
                                src={imageURISrc}
                                width={300}
                                height={300}
                                loading="lazy"
                                priority={false}
                                //placeholder="blur"
                                alt={tokenDescription || "..."}
                                className={styles.cardImage}
                                style={{ opacity: imageOpacity }}
                                onLoad={handleImageLoad}
                            />
                        </div>
                        <div className={styles.cardContent}>
                            <div className={styles.cardTitleWrapper}>
                                <div className={styles.cardTitle}>
                                    <h4>{tokenSymbol}</h4>
                                </div>
                                <div>#{tokenId}</div>
                            </div>
                            {isListed ? (
                                <div className={styles.cardTextArea}>
                                    <div className={styles.cardSwapAndListingStatusWrapper}>
                                        <>{isListedForSwap ? <div>Swap</div> : <div>Sell</div>}</>
                                        <>
                                            {isListed ? (
                                                <div className={styles.cardListedStatus}>
                                                    Listed #{listingId}
                                                </div>
                                            ) : (
                                                <div className={styles.cardNotListedStatus}>
                                                    Not Listed #{listingId}
                                                </div>
                                            )}
                                        </>
                                    </div>
                                    <div className={styles.cardPriceWrapper}>
                                        {formattedPrice ? (
                                            <div className={styles.cardPrice}>
                                                {formattedPrice} ETH{/*Ξ*/}
                                            </div>
                                        ) : null}
                                        {priceInEur ? (
                                            <strong>{formattedPriceInEur} €</strong>
                                        ) : null}
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.cardTextArea}>
                                    <div className={styles.cardNotListedStatus}>
                                        Not Listed #{listingId}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
