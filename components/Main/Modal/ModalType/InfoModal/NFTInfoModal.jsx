// React imports (React core and hooks
import React, { forwardRef, useState, useEffect } from "react"
import Image from "next/image"

// Custom hooks and components
import Modal from "../../ModalBasis/Modal"
import NFTModalList from "../../ModalElements/ModalCollectionList/NFTModalList"
import { truncateStr } from "../../../../../utils/formatting"

// Styles import
import styles from "../../../../../styles/Home.module.css"

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
        nftAddress,
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

    // Logic for determining button text and handlers
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
            okText = ["SELL", "SWAP"]
            onOkHandler = [() => handleListClick("sell"), () => handleListClick("swap")]
            break
        case "sell":
            okText = "UPDATE"
            onOkHandler = handleUpdatePriceButtonClick
            break

        default:
            okText = ""
            onOkHandler = () => {}
    }

    // Conditional logic simplified
    const isListedForSwap = desiredNftAddress !== "0x0000000000000000000000000000000000000000"
    const showCancelListingButton = type === "sell"

    // State definitions
    const [loveLightClass, setLoveLightClass] = useState("")
    const [formattedExternalLink, setFormattedExternalLink] = useState()

    const handleLoveLightClick = () => {
        setLoveLightClass((currentClass) =>
            currentClass === "" ? "modalLoveLightInnerYellow" : ""
        )
    }

    // Utility function for capitalizing the first letter
    const capitalizeFirstLetter = (string) => {
        return typeof string === "string"
            ? string.charAt(0).toUpperCase() + string.slice(1)
            : string
    }

    // Only update formattedExternalLink if tokenExternalLink exists
    useEffect(() => {
        if (tokenExternalLink) {
            setFormattedExternalLink(truncateStr(tokenExternalLink, 25, 0))
        }
    }, [tokenExternalLink])

    return (
        <Modal
            ref={ref}
            isVisible={type}
            modalTitle={[tokenName, " ", "#", tokenId]}
            closeModal={closeModal}
            okText={okText}
            onOk={onOkHandler}
            cancelListing={showCancelListingButton ? handleCancelListingClick : null}
        >
            <div className={styles.modalContent}>
                <div className={styles.modalImage}>
                    <Image src={imageURI} alt={tokenDescription || ""} height={300} width={300} />
                </div>
                <div className={styles.modalTextWrapper}>
                    <div className={styles.modalTextInnerWrapper}>
                        <div className={styles.modalPriceWrapper}>
                            {!isListedForSwap ? (
                                <>
                                    <p>Price:</p>
                                    <div className={styles.modalPriceInnerWrapper}>
                                        <strong>{price} ETH </strong>
                                        <strong>{priceInEur} €</strong>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p>Swap:</p>
                                    <div className={styles.modalPriceInnerWrapper}>
                                        <p>Desired Address: </p>
                                        <strong>{formattedDesiredNftAddress}</strong>

                                        <p>Desired Token-Id: </p>
                                        <strong>{desiredTokenId}</strong>
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
                                {attributes && attributes.length > 0 ? (
                                    attributes.map((attribute, index) => (
                                        <div key={index} className={styles.modalAttributesWrapper}>
                                            <span className={styles.modalAttributes}>
                                                <p>
                                                    {capitalizeFirstLetter(attribute.trait_type)}:
                                                </p>
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
            <NFTModalList filterAddress={nftAddress} filterTokenId={tokenId} />
        </Modal>
    )
})

export default NftModal
