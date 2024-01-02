import React, { forwardRef, useState, useEffect } from "react"
import Modal from "./Modal"
import Image from "next/image"

import { truncateStr } from "../../utils/formatting"
import styles from "../../styles/Home.module.css"

const NftModal = forwardRef((props, ref) => {
    // Destructuring the passed properties
    const {
        type, // 'info', 'list', or 'sell'
        imageURI,
        description,
        tokenDescription,
        attributes,
        formattedTokenOwner,
        formattedNftAddress,
        desiredNftAddress,
        formattedDesiredNftAddress,
        tokenExternalLink,
        desiredTokenId,
        tokenId,
        tokenName,
        tokenSymbol,
        isListed,
        price,
        priceInEur,
        buyerCount,
        handleBuyClick,
        handleListClick,
        handleCancelListingClick,
        handleUpdatePriceButtonClick,
        copyNftAddressToClipboard,
        closeModal,
    } = props

    // Determine the text and handler for the OK button based on the type
    let okText, onOkHandler
    switch (type) {
        case "info":
            if (isListed) {
                okText = "BUY"
                onOkHandler = handleBuyClick
            } else {
                okText = ""
                onOkHandler = () => {}
            }
            break
        case "list":
            okText = "LIST"
            onOkHandler = handleListClick
            break
        case "sell":
            okText = "UPDATE"
            onOkHandler = handleUpdatePriceButtonClick
            break

        default:
            okText = ""
            onOkHandler = () => {}
    }

    // Determine if the NFT is listed for swap
    const isListedForSwap = desiredNftAddress !== "0x0000000000000000000000000000000000000000"

    const showCancelListingButton = type === "sell"

    const [loveLightClass, setLoveLightClass] = useState("")

    const handleLoveLightClick = () => {
        setLoveLightClass((currentClass) =>
            currentClass === "" ? "modalLoveLightInnerYellow" : ""
        )
    }

    const capitalizeFirstLetter = (string) => {
        if (typeof string === "string") {
            return string.charAt(0).toUpperCase() + string.slice(1)
        }
        return string // Return the original input if it's not a string
    }

    const [formattedExternalLink, setFormattedExternalLink] = useState()

    // Only update formattedExternalLink if tokenExternalLink exists
    useEffect(() => {
        if (tokenExternalLink) {
            setFormattedExternalLink(truncateStr(tokenExternalLink, 25, 0))
        }
    }, [tokenExternalLink])

    console.log("Attributes", attributes)
    return (
        <Modal
            ref={ref}
            isVisible={type}
            modalTitle={[tokenName, " ", "#", tokenId]}
            onCancel={closeModal}
            okText={okText}
            onOk={onOkHandler}
            cancelListing={showCancelListingButton ? handleCancelListingClick : null}
        >
            <div className={styles.modalContent}>
                <div className={styles.modalImageWrapper}>
                    <Image src={imageURI} alt={tokenDescription || ""} height={300} width={300} />
                </div>
                <div className={styles.modalTextWrapper}>
                    <div className={styles.modalTextInnerWrapper}>
                        <div className={styles.modalPrice}>
                            {!isListedForSwap ? (
                                <>
                                    <p>Price:</p>
                                    <div className={styles.modalPriceInner}>
                                        <strong>{price} ETH </strong>
                                        <strong>{priceInEur} €</strong>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p>Swap:</p>
                                    <div className={styles.modalPriceInner}>
                                        <p>Desired Address: </p>
                                        <strong>{formattedDesiredNftAddress}</strong>

                                        <p>Desired Token-Id: </p>
                                        <strong>{desiredTokenId}</strong>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className={styles.modalLoveLight}>
                            <p>Turn me on if you love me</p>
                            <div
                                className={`${styles.modalLoveLightInner} ${styles[loveLightClass]}`}
                                onClick={handleLoveLightClick}
                            >
                                <img src="/media/only-lightbulb.png"></img>
                            </div>
                        </div>
                        <div className={styles.modalText}>
                            <div>
                                <p>Symbol: </p>
                                <strong>{tokenSymbol}</strong>
                            </div>
                            <div>
                                <p>Token-Adress: </p>
                                <div
                                    className={styles.nftNftAddressToCopy}
                                    onClick={copyNftAddressToClipboard}
                                >
                                    <strong>{formattedNftAddress}</strong>
                                </div>
                            </div>
                            <div>
                                <p>Token-Id: </p>
                                <strong>{tokenId}</strong>
                            </div>
                            <div>
                                <p>Owned by: </p>
                                <strong>{formattedTokenOwner}</strong>
                            </div>
                            <div>
                                <p>Times sold:</p>
                                <strong>{buyerCount}x</strong>
                            </div>
                        </div>
                        <div className={styles.modalDescriptionWrapper}>
                            <div className={styles.modalDescription}>
                                {(tokenDescription || description) && (
                                    <div className={styles.modalAttributesWrapper}>
                                        <div className={styles.modalAttributes}>
                                            <p>Description:</p>
                                            <strong>
                                                {tokenDescription || description || "..."}
                                            </strong>
                                        </div>
                                    </div>
                                )}
                                <div className={styles.modalAttributes}>
                                    {tokenExternalLink ? (
                                        <>
                                            <p>Link:</p>
                                            <a
                                                href={tokenExternalLink}
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

                                {attributes.map((attribute, index) => (
                                    <div key={index} className={styles.modalAttributesWrapper}>
                                        <span className={styles.modalAttributes}>
                                            <p>{capitalizeFirstLetter(attribute.trait_type)}:</p>
                                            <strong>
                                                {capitalizeFirstLetter(attribute.value)}
                                            </strong>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
})

export default NftModal
