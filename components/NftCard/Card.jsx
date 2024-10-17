import React, { useState, useEffect, useCallback, useMemo } from "react"
import Image from "next/image"
import { useAccount } from "wagmi"
import { useModal } from "@context"
import { useEthToCurrencyRates } from "@hooks"
import { formatPriceToEther, truncatePrice } from "@utils"
import styles from "./Card.module.scss"

const Card = ({ nftData }) => {
    const { address, isConnected } = useAccount()
    const { openModal } = useModal()

    const defaultValues = useMemo(
        () => ({
            imageURI: "/media/nftDefault.png",
            tokenSymbol: "LOADING...",
            tokenId: "000",
            price: "0",
            tokenDescription: "",
        }),
        []
    )

    const [imageURI, setImageURI] = useState(defaultValues.imageURI)
    const [tokenSymbol, setTokenSymbol] = useState(defaultValues.tokenSymbol)
    const [tokenId, setTokenId] = useState(defaultValues.tokenId)
    const [price, setPrice] = useState(defaultValues.price)
    const [tokenDescription, setTokenDescription] = useState(defaultValues.tokenDescription)
    const [priceInEur, setPriceInEur] = useState(null)

    const { ethToCurrencyRates } = useEthToCurrencyRates()

    const isOwnedByUser =
        isConnected && nftData && nftData.tokenOwner?.toLowerCase() === address?.toLowerCase()
    const isListedForSwap =
        nftData && nftData.desiredNftAddress !== "0x0000000000000000000000000000000000000000"
    const formattedPrice = formatPriceToEther(price)

    // Update the NFT details whenever nftData changes
    useEffect(() => {
        if (nftData) {
            setImageURI(nftData.imageURI || defaultValues.imageURI)
            setTokenSymbol(nftData.tokenSymbol || defaultValues.tokenSymbol)
            setTokenId(nftData.tokenId || defaultValues.tokenId)
            setPrice(nftData.price || defaultValues.price)
            setTokenDescription(nftData.tokenDescription || defaultValues.tokenDescription)
        } else {
            setImageURI(defaultValues.imageURI)
            setTokenSymbol(defaultValues.tokenSymbol)
            setTokenId(defaultValues.tokenId)
            setPrice(defaultValues.price)
            setTokenDescription(defaultValues.tokenDescription)
        }
    }, [nftData, defaultValues])

    // Update the price in EUR only if we have both the price and the exchange rate
    useEffect(() => {
        if (price && ethToCurrencyRates.eur) {
            const ethPrice = formatPriceToEther(price)
            setPriceInEur(ethPrice * ethToCurrencyRates.eur)
        }
    }, [price, ethToCurrencyRates.eur])

    const handleCardClick = useCallback(
        (nftData) => {
            if (!nftData) return
            const modalId = `nftCardModal-${nftData.nftAddress}${nftData.tokenId}`
            if (!isOwnedByUser) {
                openModal("info", modalId, nftData)
            } else if (isOwnedByUser && nftData.isListed) {
                openModal("sell", modalId, nftData)
            } else if (isOwnedByUser && !nftData.isListed) {
                openModal("list", modalId, nftData)
            }
        },
        [isOwnedByUser, openModal]
    )

    return (
        <div className={styles.nftCardWrapper}>
            <div className={styles.nftCard} onClick={() => handleCardClick(nftData)}>
                <div className={styles.cardBackgroundImage}>
                    <Image
                        src={imageURI}
                        alt={tokenDescription || "..."}
                        priority={true}
                        width={300}
                        height={300}
                        className={styles.cardImage}
                    />
                </div>
                <div className={styles.cardContent}>
                    <div className={styles.cardTitleWrapper}>
                        <div className={styles.cardTitle}>
                            <h6>{tokenSymbol}</h6>
                        </div>
                        <div>#{tokenId}</div>
                    </div>
                    {nftData && nftData.isListed ? (
                        <div className={styles.cardTextArea}>
                            <div className={styles.cardSwapAndListingStatusWrapper}>
                                {isListedForSwap ? <div>SWAP</div> : <div>SELL</div>}
                                <div className={styles.cardListedStatus}>
                                    Listed #{nftData.listingId}
                                </div>
                            </div>
                            <div className={styles.cardPriceWrapper}>
                                {isListedForSwap && formattedPrice === "0.0" ? null : (
                                    <>
                                        {formattedPrice && (
                                            <div className={styles.cardPrice}>
                                                {truncatePrice(formattedPrice, 5)} ETH
                                            </div>
                                        )}
                                        {priceInEur ? (
                                            <strong>{truncatePrice(priceInEur, 2)} €</strong>
                                        ) : null}
                                    </>
                                )}
                            </div>
                        </div>
                    ) : !nftData ? null : (
                        <div className={styles.cardTextArea}>
                            <div className={styles.cardNotListedStatus}>
                                Not Listed #{nftData ? nftData.listingId : "..."}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Card
