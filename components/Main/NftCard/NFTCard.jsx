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

    // ------------------ Component Return ------------------

    return (
        <>
            {imageURI ? (
                <div className={styles.nftCard} onClick={() => handleCardClick(nftData)}>
                    {" "}
                    <div className={styles.cardTitleWrapper}>
                        <div className={styles.cardTitle}>
                            <h2>{tokenSymbol}</h2>
                        </div>
                        <div>
                            {isListed ? (
                                <div className={styles.cardListedStatus}>Listed #{listingId}</div>
                            ) : (
                                <div className={styles.cardNotListedStatus}>
                                    Not Listed #{listingId}
                                </div>
                            )}
                        </div>
                    </div>
                    <Image
                        className={styles.cardImage}
                        src={imageURI.src}
                        height={225}
                        width={300}
                        loading="lazy"
                        alt={tokenDescription || "..."}
                    />
                    <div className={styles.cardTextArea}>
                        <div className={styles.cardOwnerAndId}>
                            <div>{collectionName}</div>
                            <div>#{tokenId}</div>
                        </div>
                        <div className={styles.cardListedPrice}>
                            <div className={styles.cardPrice}>{formattedPrice} ETH</div>
                            {priceInEur && <strong>{formattedPriceInEur} EUR</strong>}
                        </div>
                    </div>
                </div>
            ) : (
                <LoadingWave />
            )}
        </>
    )
}
