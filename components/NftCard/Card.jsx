import React, { useState, useEffect, useCallback, useMemo } from "react"
import Image from "next/image"

import { useAccount } from "wagmi"
import { useModal } from "@context/ModalProvider"

import LoadingWave from "@components/LoadingWave/LoadingWave"

import { formatPriceToEther, truncatePrice } from "@utils/formatting"
import { fetchEthToEurRate } from "@utils/fetchEthToEurRate"

import styles from "./Card.module.scss"

const Card = ({ nftData }) => {
    const { address, isConnected } = useAccount()
    const defaultValues = useMemo(
        () => ({
            imageURI: false,
            tokenSymbol: "LOADING...",
            tokenId: "000",
            price: "0",
        }),
        []
    )

    const [imageURI, setImageURI] = useState(defaultValues.imageURI)
    const [tokenSymbol, setTokenSymbol] = useState(defaultValues.tokenSymbol)
    const [tokenId, setTokenId] = useState(defaultValues.tokenId)
    const [price, setPrice] = useState(defaultValues.price)
    const [tokenDescription, setTokenDescription] = useState(defaultValues.tokenDescription)
    const { openModal } = useModal()
    const isOwnedByUser = isConnected && nftData && nftData.tokenOwner?.toLowerCase() === address?.toLowerCase()
    const formattedPrice = formatPriceToEther(price)
    const [priceInEur, setPriceInEur] = useState(null)
    const [formattedPriceInEur, setFormattedPriceInEur] = useState()
    const isListedForSwap = nftData && nftData.desiredNftAddress !== "0x0000000000000000000000000000000000000000"
    const [imageLoaded, setImageLoaded] = useState(false)

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

    useEffect(() => {
        setFormattedPriceInEur(truncatePrice(priceInEur, 5))
    }, [priceInEur])

    useEffect(() => {
        if (!price) return
        const updatePriceInEur = async () => {
            const ethToEurRate = await fetchEthToEurRate()
            if (ethToEurRate) {
                const ethPrice = formatPriceToEther(price)
                setPriceInEur(ethPrice * ethToEurRate)
            }
        }
        updatePriceInEur()
    }, [price])

    const handleCardClick = useCallback(
        (nftData) => {
            if (!nftData) return
            const modalId = "nftCardModal-" + `${nftData.nftAddress}${nftData.tokenId}`
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

    useEffect(() => {
        if (imageURI) {
            setImageLoaded(false)
        }
    }, [imageURI])

    const handleImageLoad = () => {
        setImageLoaded(true)
    }

    return (
        <div className={styles.nftCardWrapper}>
            <div className={styles.nftCard} onClick={() => handleCardClick(nftData)}>
                <div className={styles.cardBackgroundImage}>
                    {!imageLoaded && (
                        <div className={styles.cardImageLoadingWaveWrapper}>
                            <LoadingWave />
                        </div>
                    )}
                    <Image
                        src={imageURI}
                        alt={tokenDescription || "..."}
                        priority="true"
                        width={300}
                        height={300}
                        className={`${styles.cardImage} ${!imageLoaded ? styles.imageLoading : ""}`}
                        onLoad={handleImageLoad}
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
                                <div className={styles.cardListedStatus}>Listed #{nftData.listingId}</div>
                            </div>
                            <div className={styles.cardPriceWrapper}>
                                {formattedPrice && <div className={styles.cardPrice}>{formattedPrice} ETH</div>}
                                {priceInEur ? <strong>{formattedPriceInEur} €</strong> : null}
                            </div>
                        </div>
                    ) : (
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
