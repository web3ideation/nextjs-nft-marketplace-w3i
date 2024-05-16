import { useState, useEffect } from "react"
import Image from "next/image"

import { useAccount } from "wagmi"

import { useModal } from "@context/ModalProvider"

import LoadingWave from "@components/LoadingWave/LoadingWave"

import { formatPriceToEther, truncatePrice } from "@utils/formatting"
import { fetchEthToEurRate } from "@utils/fetchEthToEurRate"

import styles from "./Card.module.scss"

const Card = ({ nftData }) => {
    const { isListed, listingId, tokenOwner, desiredNftAddress } = nftData
    const { address, isConnected } = useAccount()
    const defaultValues = {
        imageURI: "/media/nftDefault.jpg",
        tokenSymbol: "LOADING...",
        tokenId: "000",
        price: "0",
        tokenDescription: "Description is loading...",
        collectionName: "Collection loading...",
    }
    const [imageURI, setImageURI] = useState(defaultValues.imageURI)
    const [tokenSymbol, setTokenSymbol] = useState(defaultValues.tokenSymbol)
    const [tokenId, setTokenId] = useState(defaultValues.tokenId)
    const [price, setPrice] = useState(defaultValues.price)
    const [tokenDescription, setTokenDescription] = useState(defaultValues.tokenDescription)
    const [collectionName, setCollectionName] = useState(defaultValues.collectionName)
    const { openModal } = useModal()
    const isOwnedByUser = isConnected && tokenOwner?.toLowerCase() === address?.toLowerCase()
    const formattedPrice = formatPriceToEther(price)
    const [priceInEur, setPriceInEur] = useState(null)
    const [formattedPriceInEur, setFormattedPriceInEur] = useState()
    const isListedForSwap = desiredNftAddress !== "0x0000000000000000000000000000000000000000"
    const [imageLoaded, setImageLoaded] = useState(false)
    useEffect(() => {
        if (nftData) {
            setImageURI(nftData.imageURI || defaultValues.imageURI)
            setTokenSymbol(nftData.tokenSymbol || defaultValues.tokenSymbol)
            setTokenId(nftData.tokenId || defaultValues.tokenId)
            setPrice(nftData.price || defaultValues.price)
            setTokenDescription(nftData.tokenDescription || defaultValues.tokenDescription)
            setCollectionName(nftData.collectionName || defaultValues.collectionName)
        }
    }, [nftData])

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

    const handleCardClick = (nftData) => {
        const modalId = "nftCardModal-" + `${nftData.nftAddress}${nftData.tokenId}`
        if (!isOwnedByUser) {
            console.log(nftData)
            openModal("info", modalId, nftData)
        } else if (isOwnedByUser && isListed) {
            console.log(nftData)
            openModal("sell", modalId, nftData)
        } else if (isOwnedByUser && !isListed) {
            console.log(nftData)
            openModal("list", modalId, nftData)
        }
    }

    useEffect(() => {
        setImageLoaded(false)
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
                        src={imageURI || "/media/nftDefault.jpg"}
                        alt={tokenDescription || "..."}
                        width={300}
                        height={300}
                        loading="lazy"
                        className={`${styles.cardImage} ${
                            !imageLoaded ? styles.imageLoading : ""
                        }`}
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

                                <div className={styles.cardListedStatus}>Listed #{listingId}</div>
                            </div>
                            <div className={styles.cardPriceWrapper}>
                                {formattedPrice && (
                                    <div className={styles.cardPrice}>
                                        {formattedPrice} ETH{/*Ξ*/}
                                    </div>
                                )}
                                {priceInEur ? <strong>{formattedPriceInEur} €</strong> : null}
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
    )
}
export default Card
