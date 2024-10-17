import React, { useState, useEffect } from "react"
import Image from "next/image"
import { useAccount } from "wagmi"
import { useNFT, useNotification } from "@context"
import { useSingleNFTData, useEthToCurrencyRates } from "hooks"
import { Card, LoadingWave } from "@components"
import { truncateStr, formatPriceToEther, truncatePrice, copyNftAddressToClipboard } from "@utils"
import styles from "./Overview.module.scss"

const Overview = ({ modalContent }) => {
    const { address, isConnected } = useAccount()
    const { showNotification } = useNotification()
    const [loveLightClass, setLoveLightClass] = useState("")
    const [formattedNftAddress, setFormattedNftAddress] = useState("")
    const [formattedTokenOwner, setFormattedTokenOwner] = useState("")
    const [formattedDesiredNftAddress, setFormattedDesiredNftAddress] = useState("")
    const [formattedPrice, setFormattedPrice] = useState("")
    const [priceInEur, setPriceInEur] = useState("")
    const [formattedPriceInEur, setFormattedPriceInEur] = useState("")
    const [formattedExternalLink, setFormattedExternalLink] = useState("")
    const [imageLoaded, setImageLoaded] = useState(false)

    const { ethToCurrencyRates } = useEthToCurrencyRates()
    const { data: internalNfts } = useNFT() // Zugang zu bereits gelisteten NFTs

    const isListedForSwap =
        modalContent.desiredNftAddress !== "0x0000000000000000000000000000000000000000"

    // Prüfe, ob der NFT in den bereits gelisteten NFTs vorhanden ist
    const existingNft =
        internalNfts && internalNfts.length > 0 && isListedForSwap
            ? internalNfts.find(
                  (nft) =>
                      nft.nftAddress.toLowerCase() ===
                          modalContent.desiredNftAddress.toLowerCase() &&
                      nft.tokenId === modalContent.desiredTokenId
              )
            : null

    // Wenn der NFT nicht vorhanden ist, benutze den Hook, um die Daten abzurufen
    const {
        nftData: desiredNftData,
        isLoading: isLoadingDesiredNft,
        error: desiredNftError,
    } = useSingleNFTData(
        isListedForSwap && !existingNft ? modalContent.desiredNftAddress : null, // Verwende den Hook nur, wenn der NFT nicht vorhanden ist und desiredNftAddress valide ist
        isListedForSwap && !existingNft ? modalContent.desiredTokenId : null
    )

    const isOwnedByUser =
        isConnected &&
        modalContent.tokenOwner &&
        modalContent.tokenOwner.toLowerCase() === address?.toLowerCase()

    const handleCopyAddress = (addressToCopy) => () =>
        copyNftAddressToClipboard(addressToCopy, showNotification)

    const capitalizeFirstLetter = (string) =>
        typeof string === "string" ? string.charAt(0).toUpperCase() + string.slice(1) : string

    const handleLoveLightClick = () =>
        setLoveLightClass((currentClass) =>
            currentClass === "" ? "modalLoveLightInnerYellow" : ""
        )

    // Preis in EUR umrechnen
    useEffect(() => {
        if (modalContent.price && ethToCurrencyRates.eur) {
            const ethPrice = formatPriceToEther(modalContent.price)
            setFormattedPrice(truncatePrice(ethPrice, 10))
            setPriceInEur(ethPrice * ethToCurrencyRates.eur)
        }
    }, [modalContent.price, ethToCurrencyRates.eur])

    // Informationen formatieren
    useEffect(() => {
        if (modalContent) {
            setFormattedDesiredNftAddress(truncateStr(modalContent.desiredNftAddress, 4, 4))
            setFormattedNftAddress(truncateStr(modalContent.nftAddress, 4, 4))
            setFormattedTokenOwner(truncateStr(modalContent.tokenOwner, 4, 4))
        }
        if (priceInEur) {
            setFormattedPriceInEur(truncatePrice(priceInEur, 2))
        }
    }, [modalContent, priceInEur])

    // External Link formatieren
    useEffect(() => {
        if (modalContent.tokenExternalLink?.length > 0) {
            setFormattedExternalLink(truncateStr(modalContent.tokenExternalLink, 25, 0))
        }
    }, [modalContent.tokenExternalLink])

    // Image Load Event
    useEffect(() => {
        if (!modalContent.imageURI) setImageLoaded(false)
    }, [modalContent.imageURI])

    const handleImageLoad = () => {
        setImageLoaded(true)
    }

    return (
        <div className={styles.modalContent}>
            <div className={styles.modalImageWrapper}>
                {!imageLoaded && (
                    <div className={styles.modalImageLoadingWaveWrapper}>
                        <LoadingWave />
                    </div>
                )}
                <Image
                    src={modalContent.imageURI}
                    alt={modalContent.tokenDescription || "..."}
                    priority="true"
                    width={600}
                    height={600}
                    className={`${styles.modalImage} ${!imageLoaded ? styles.imageLoading : ""}`}
                    onLoad={handleImageLoad}
                />
            </div>
            <div className={styles.modalTextWrapper}>
                <div className={styles.modalTextInnerWrapper}>
                    {modalContent.price ? (
                        <div className={styles.modalPriceWrapper}>
                            {!isListedForSwap ? (
                                <div className={styles.modalPriceInnerWrapper}>
                                    <p>
                                        <strong>Price:</strong>
                                    </p>

                                    <strong>{formattedPrice} ETH </strong>
                                    <strong>{formattedPriceInEur} €</strong>
                                </div>
                            ) : (
                                <div className={styles.modalPriceInnerWrapper}>
                                    <p>
                                        <strong>Swap:</strong>
                                    </p>
                                    <div>
                                        {formattedPrice > 0 && (
                                            <div className={styles.swapPriceWrapper}>
                                                <strong>{formattedPrice} ETH </strong>
                                                <strong>{formattedPriceInEur} €</strong>
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.swapPriceWrapper}>
                                        {/* Zeige den NFT aus dem Cache, wenn er vorhanden ist */}
                                        {existingNft ? (
                                            <Card
                                                nftData={existingNft} // Nutze die vorhandenen NFT-Daten
                                                key={`${modalContent.desiredNftAddress}${modalContent.desiredTokenId}`}
                                            />
                                        ) : isLoadingDesiredNft ? (
                                            <p>Loading desired NFT data...</p>
                                        ) : desiredNftError ? (
                                            <p>
                                                Error loading desired NFT data: {desiredNftError}
                                            </p>
                                        ) : desiredNftData ? (
                                            <Card
                                                nftData={desiredNftData} // Hier werden die abgerufenen Daten übergeben
                                                key={`${modalContent.desiredNftAddress}${modalContent.desiredTokenId}`}
                                            />
                                        ) : (
                                            <p>No NFT data found</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : null}
                    <div className={styles.modalLoveLightWrapper}>
                        <p>Turn me on if you love me</p>
                        <div
                            className={`${styles.modalLoveLightInner} ${styles[loveLightClass]}`}
                            onClick={handleLoveLightClick}
                        >
                            <Image
                                className={styles.loveLight}
                                width={40}
                                height={40}
                                loading="eager"
                                src="/media/only-lightbulb.png"
                                alt="love-lightbulb"
                            />
                        </div>
                    </div>
                    <div className={styles.modalText}>
                        <div>
                            <p>Symbol: </p>
                            <strong>{modalContent.tokenSymbol}</strong>
                        </div>
                        <div>
                            <p>Token-Adress: </p>
                            <div
                                className={styles.nftNftAddressToCopy}
                                onClick={handleCopyAddress(modalContent.nftAddress)}
                            >
                                <strong title={modalContent.nftAddress}>
                                    {formattedNftAddress}
                                </strong>
                            </div>
                        </div>
                        <div>
                            <p>Token-Id: </p>
                            <strong>{modalContent.tokenId}</strong>
                        </div>
                        <div>
                            <p>Owned by: </p>
                            <div
                                className={styles.nftNftAddressToCopy}
                                onClick={handleCopyAddress(modalContent.tokenOwner)}
                            >
                                <strong title={modalContent.tokenOwner}>
                                    {isOwnedByUser ? "You" : formattedTokenOwner}
                                </strong>
                            </div>
                        </div>
                        {modalContent.buyerCount && (
                            <div>
                                <p>Times sold:</p>
                                <strong>{modalContent.buyerCount}x</strong>
                            </div>
                        )}
                    </div>
                    <div className={styles.modalDescriptionWrapper}>
                        <div className={styles.modalDescription}>
                            {(modalContent.tokenDescription || modalContent.description) && (
                                <div className={styles.modalAttributesWrapper}>
                                    <div className={styles.modalAttributes}>
                                        <p>Description:</p>
                                        <strong>
                                            {modalContent.tokenDescription ||
                                                modalContent.description ||
                                                "..."}
                                        </strong>
                                    </div>
                                </div>
                            )}
                            <div className={styles.modalAttributes}>
                                {modalContent.tokenExternalLink ? (
                                    <>
                                        <p>Link:</p>
                                        <a
                                            href={modalContent.tokenExternalLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {formattedExternalLink || ""}
                                        </a>
                                    </>
                                ) : (
                                    <></>
                                )}
                            </div>
                            {modalContent.attributes && modalContent.attributes.length > 0 ? (
                                modalContent.attributes.map((attribute, index) => (
                                    <div key={index} className={styles.modalAttributesWrapper}>
                                        <span className={styles.modalAttributes}>
                                            <p>{capitalizeFirstLetter(attribute.trait_type)}:</p>
                                            <strong>
                                                {capitalizeFirstLetter(attribute.value)}
                                            </strong>
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.modalAttributesWrapper}>
                                    <span className={styles.modalAttributes}>
                                        <p>No Attributes Available</p>
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Overview
