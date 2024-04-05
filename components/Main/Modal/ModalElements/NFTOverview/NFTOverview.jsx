// React imports
import React, { useState, useEffect } from "react"
import Image from "next/image"
import { useAccount, usePublicClient } from "wagmi"
import { useNftNotification } from "@context/NotificationProvider"
import { truncateStr, formatPriceToEther, truncatePrice } from "@utils/formatting"
import { fetchEthToEurRate } from "@utils/fetchEthToEurRate"
import { copyNftAddressToClipboard } from "@utils/copyAddress"
// Style imports
import styles from "./NFTOverview.module.scss"

const NFTOverview = ({
    modalContent,
    //isListedForSwap,
    //formattedPrice,
    //formattedPriceInEur,
    //formattedDesiredNftAddress,
    //handleLoveLightClick,
    //handleCopyAddress,
    //formattedNftAddress,
    //isOwnedByUser,
    //formattedTokenOwner,
    //formattedExternalLink,
    //loveLightClass,
    //capitalizeFirstLetter,
}) => {
    const { address, isConnected } = useAccount()
    const { showNftNotification } = useNftNotification()
    const [loveLightClass, setLoveLightClass] = useState("")
    const [formattedNftAddress, setFormattedNftAddress] = useState("")
    const [formattedTokenOwner, setFormattedTokenOwner] = useState("")
    const [formattedDesiredNftAddress, setFormattedDesiredNftAddress] = useState("")
    const [formattedPrice, setFormattedPrice] = useState("")
    const [priceInEur, setPriceInEur] = useState("")
    const [formattedPriceInEur, setFormattedPriceInEur] = useState("")
    const [formattedExternalLink, setFormattedExternalLink] = useState("")
    console.log("Modal content overview", modalContent)

    const isOwnedByUser =
        isConnected &&
        modalContent.tokenOwner &&
        modalContent.tokenOwner.toLowerCase() === address?.toLowerCase()

    const handleCopyAddress = () =>
        copyNftAddressToClipboard(modalContent.nftAddress, showNftNotification)

    // Utility function for capitalizing the first letter
    const capitalizeFirstLetter = (string) => {
        return typeof string === "string"
            ? string.charAt(0).toUpperCase() + string.slice(1)
            : string
    }
    const isListedForSwap =
        modalContent.desiredNftAddress !== "0x0000000000000000000000000000000000000000"

    const handleLoveLightClick = () => {
        setLoveLightClass((currentClass) =>
            currentClass === "" ? "modalLoveLightInnerYellow" : ""
        )
    }

    useEffect(() => {
        const updatePriceInEur = async () => {
            const ethToEurRate = await fetchEthToEurRate()
            if (ethToEurRate) {
                const ethPrice = formatPriceToEther(modalContent.price)
                setPriceInEur(ethPrice * ethToEurRate)
            }
        }
        updatePriceInEur()
    }, [modalContent.price])

    useEffect(() => {
        if (modalContent) {
            setFormattedDesiredNftAddress(truncateStr(modalContent.desiredNftAddress, 4, 4))
            setFormattedNftAddress(truncateStr(modalContent.nftAddress, 4, 4))
            setFormattedTokenOwner(truncateStr(modalContent.tokenOwner, 4, 4))
            setFormattedPrice(formatPriceToEther(modalContent.price))
            setFormattedPriceInEur(truncatePrice(priceInEur, 5))
        }
    }, [
        modalContent.nftAddress,
        modalContent.tokenOwner,
        modalContent.desiredNftAddress,
        priceInEur,
    ])

    // Only update formattedExternalLink if tokenExternalLink exists
    useEffect(() => {
        if (modalContent.tokenExternalLink) {
            setFormattedExternalLink(truncateStr(modalContent.tokenExternalLink, 25, 0))
        }
    }, [modalContent.tokenExternalLink])

    return (
        <div className={styles.modalContent}>
            <div className={styles.modalImage}>
                <Image
                    src={modalContent.imageURI.src}
                    alt={modalContent.tokenDescription || ""}
                    width={600}
                    height={600}
                />
            </div>
            <div className={styles.modalTextWrapper}>
                <div className={styles.modalTextInnerWrapper}>
                    <div className={styles.modalPriceWrapper}>
                        {!isListedForSwap ? (
                            <>
                                <p>Price:</p>
                                <div className={styles.modalPriceInnerWrapper}>
                                    <strong>{formattedPrice} ETH </strong>
                                    <strong>{formattedPriceInEur} €</strong>
                                </div>
                            </>
                        ) : (
                            <>
                                <p>Swap:</p>
                                <div className={styles.modalPriceInnerWrapper}>
                                    <p>Desired Address: </p>
                                    <strong>{formattedDesiredNftAddress}</strong>

                                    <p>Desired Token-Id: </p>
                                    <strong>{modalContent.desiredTokenId}</strong>
                                </div>
                            </>
                        )}
                    </div>

                    <div className={styles.modalLoveLightWrapper}>
                        <p>Turn me on if you love me</p>
                        <div
                            className={`${styles.modalLoveLightInner} ${styles[loveLightClass]}`}
                            onClick={handleLoveLightClick}
                        >
                            <Image
                                width={100}
                                height={100}
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
                                onClick={handleCopyAddress}
                            >
                                <strong>{formattedNftAddress}</strong>
                            </div>
                        </div>
                        <div>
                            <p>Token-Id: </p>
                            <strong>{modalContent.tokenId}</strong>
                        </div>
                        <div>
                            <p>Owned by: </p>
                            <strong>{isOwnedByUser ? "You" : formattedTokenOwner}</strong>
                        </div>
                        <div>
                            <p>Times sold:</p>
                            <strong>{modalContent.buyerCount}x</strong>
                        </div>
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

export default NFTOverview
