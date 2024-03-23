// React imports (React core and hooks
import React, { forwardRef, useState, useEffect } from "react"
import { useRouter } from "next/router"

import Image from "next/image"
import { useAccount, usePublicClient } from "wagmi"

// Custom hooks and components
import { useNFT } from "@context/NFTDataProvider"
import { useBuyItem } from "@hooks/useBuyItem"
import { useCancelListing } from "@hooks/useCancelListing"
import { useNftNotification } from "@context/NotificationProvider"
import { useModal } from "@context/ModalProvider"
import Modal from "../../ModalBasis/Modal"
import NFTModalList from "../../ModalElements/ModalCollectionList/NFTModalList"

// ------------------ Utility Imports ------------------
import { truncateStr, formatPriceToEther, truncatePrice } from "@utils/formatting"
import { fetchEthToEurRate } from "@utils/fetchEthToEurRate"
import { copyNftAddressToClipboard } from "@utils/copyAddress"

// Constants import
import networkMapping from "@constants/networkMapping.json"

// Styles import
import styles from "./InfoModal.module.scss"

const NftModal = forwardRef((props, ref) => {
    // Destructuring the passed properties

    const router = useRouter()
    const { reloadNFTs } = useNFT()
    const { address, isConnected } = useAccount()
    const chainString = usePublicClient().chains[0]?.id?.toString() ?? "31337"
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]
    const { showNftNotification } = useNftNotification()
    const { openModal, modalContent, modalType, closeModal, currentModalId } = useModal()
    console.log("MODAL Type", modalType)

    // State for handling UI and modal visibility
    const [loveLightClass, setLoveLightClass] = useState("")
    const [formattedNftAddress, setFormattedNftAddress] = useState("")
    const [formattedTokenOwner, setFormattedTokenOwner] = useState("")
    const [formattedDesiredNftAddress, setFormattedDesiredNftAddress] = useState("")
    const [formattedPrice, setFormattedPrice] = useState("")
    const [priceInEur, setPriceInEur] = useState("")
    const [formattedPriceInEur, setFormattedPriceInEur] = useState("")
    const [formattedExternalLink, setFormattedExternalLink] = useState("")

    const isOwnedByUser =
        isConnected && modalContent.tokenOwner?.toLowerCase() === address?.toLowerCase()

    const handleCopyAddress = () =>
        copyNftAddressToClipboard(modalContent.nftAddress, showNftNotification)

    const handleUpdatePriceButtonClick = () => {
        const modalId = "nftUpdateModal-" + `${modalContent.nftAddress}${modalContent.tokenId}`
        const updateListingData = {
            price: formattedPrice,
            nftAddress: modalContent.nftAddress,
            tokenId: modalContent.tokenId,
            desiredNftAddress: modalContent.desiredNftAddress,
            desiredTokenId: modalContent.desiredTokenId,
        }
        openModal("update", modalId, updateListingData)
    }
    // Event handlers for various interactions
    const handleTransactionCompletion = () => {
        reloadNFTs()

        setTimeout(() => {
            router.push("/my-nft")
        }, 1500)
    }

    const { handleBuyClick } = useBuyItem(
        marketplaceAddress,
        modalContent.price,
        modalContent.nftAddress,
        modalContent.tokenId,
        isConnected,
        formattedPrice,
        handleTransactionCompletion
    )
    const { handleCancelListingClick } = useCancelListing(
        marketplaceAddress,
        modalContent.nftAddress,
        modalContent.tokenId,
        isConnected,
        handleTransactionCompletion
    )
    // Logic for determining button text and handlers
    let okText, onOkHandler
    switch (modalType) {
        case "info":
            if (modalContent.isListed) {
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
    const isListedForSwap =
        modalContent.desiredNftAddress !== "0x0000000000000000000000000000000000000000"
    const showCancelListingButton = modalType === "sell"

    const handleLoveLightClick = () => {
        setLoveLightClass((currentClass) =>
            currentClass === "" ? "modalLoveLightInnerYellow" : ""
        )
    }

    const handleListClick = (action) => {
        if (action === "sell") {
            // Logic for sell
            router.push(
                `/sell-nft?nftAddress=${modalContent.nftAddress}&tokenId=${
                    modalContent.tokenId
                }&price=${formatPriceToEther(modalContent.price)}`
            )
        } else if (action === "swap") {
            // Logic for swap
            router.push(
                `/swap-nft?nftAddress=${modalContent.nftAddress}&tokenId=${
                    modalContent.tokenId
                }&price=${formatPriceToEther(modalContent.price)}&desiredNftAddress=${
                    modalContent.desiredNftAddress
                }&desiredTokenId=${modalContent.desiredTokenId}`
            )
        }
        closeModal(currentModalId)
    }

    // Utility function for capitalizing the first letter
    const capitalizeFirstLetter = (string) => {
        return typeof string === "string"
            ? string.charAt(0).toUpperCase() + string.slice(1)
            : string
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
        setFormattedDesiredNftAddress(truncateStr(modalContent.desiredNftAddress, 4, 4))
        setFormattedNftAddress(truncateStr(modalContent.nftAddress, 4, 4))
        setFormattedTokenOwner(truncateStr(modalContent.tokenOwner, 4, 4))
        setFormattedPrice(formatPriceToEther(modalContent.price))
        setFormattedPriceInEur(truncatePrice(priceInEur, 5))
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
        <Modal
            ref={ref}
            modalTitle={[modalContent.tokenName]}
            okText={okText}
            onOk={onOkHandler}
            cancelListing={showCancelListingButton ? handleCancelListingClick : null}
        >
            <div className={styles.modalContent}>
                <div className={styles.modalImage}>
                    <Image
                        src={modalContent.imageURI.src}
                        alt={modalContent.tokenDescription || ""}
                        width={600}
                        height={800}
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
            <NFTModalList
                filterAddress={modalContent.nftAddress}
                filterTokenId={modalContent.tokenId}
            />
        </Modal>
    )
})

export default NftModal
