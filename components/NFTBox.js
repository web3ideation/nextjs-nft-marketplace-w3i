import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/router"
import Image from "next/image"
import { ethers } from "ethers"
import { CSSTransition } from "react-transition-group"
import { useAccount, usePublicClient } from "wagmi"

import { useNFT } from "../context/NFTContextProvider"
import { useNftNotification } from "../context/NFTNotificationContext"
import networkMapping from "../constants/networkMapping.json"
import LoadingWave from "../components/LoadingWave"
import NFTInfoModal from "../components/NFTInfoModal"
import NFTUpdateListingModal from "../components/NFTUpdateListingModal"
import styles from "../styles/Home.module.css"
import { useBuyItem } from "../hooks/useBuyItem"
import { useCancelListing } from "../hooks/useCancelListing"

// Utility function to truncate strings
const truncateStr = (fullStr, strLen) => {
    if (fullStr.length <= strLen) return fullStr

    const separator = "..."
    const seperatorLength = separator.length
    const charsToShow = strLen - seperatorLength
    const frontChars = Math.ceil(charsToShow / 2)
    const backChars = Math.floor(charsToShow / 2)

    return (
        fullStr.substring(0, frontChars) +
        separator +
        fullStr.substring(fullStr.length - backChars)
    )
}

// Utility function to convert Wei to ETH
const formatPriceToEther = (priceInWei) => {
    return ethers.utils.formatUnits(priceInWei, "ether")
}

export default function NFTBox({ nftData, loadingImage }) {
    // ------------------ Hooks & Data Retrieval ------------------
    // Destructure NFT details directly from the prop
    const {
        nftAddress,
        nftOwner,
        tokenId,
        price,
        isListed,
        listingId,
        imageURI,
        tokenName,
        description,
        tokenDescription,
        buyerCount,
        desiredNftAddress,
        desiredTokenId,
    } = nftData

    const formattedPrice = formatPriceToEther(price)
    const chainString = usePublicClient().chains[0]?.id?.toString() ?? "31337"
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]
    const { address, isConnected } = useAccount()
    const router = useRouter()
    const { loadNFTs } = useNFT()
    const modalRef = useRef(null)
    const updateModalRef = useRef(null)

    const reloadNFTs = useCallback(() => {
        loadNFTs()
    }, [loadNFTs])

    // ------------------- Refs ---------------------------

    // ------------------ State Management ------------------
    // State for truncated strings
    const [formattedNftAddress, setFormattedNftAddress] = useState("")
    const [formattedNftOwner, setFormattedNftOwner] = useState("")
    const [formattedDesiredNftAddress, setformattedDesiredNftAddress] = useState("")

    // Modal states
    const [anyModalIsOpen, setAnyModalIsOpen] = useState(false)
    const [showInfoModal, setShowInfoModal] = useState(false)
    const [showSellModal, setShowSellModal] = useState(false)
    const [showListModal, setShowListModal] = useState(false)
    const [showUpdateListingModal, setShowUpdateListingModal] = useState(false)

    // Message states
    const { showNftNotification, closeNftNotification } = useNftNotification()

    // Check ownership of the NFT
    const isOwnedByUser = isConnected && nftOwner?.toLowerCase() === address?.toLowerCase()

    // Function for updating after buy or delist
    const updatePageContentAfterTransaction = useCallback(() => {
        console.log("Reloding NFTs...")
        setTimeout(() => {
            reloadNFTs()
        }, 1000)
    }, [loadNFTs])

    // ------------------ Contract Functions ------------------
    // function for buy item
    const { handleBuyClick } = useBuyItem(
        marketplaceAddress,
        price,
        nftAddress,
        tokenId,
        isConnected,
        updatePageContentAfterTransaction
    )
    // function for delisting item
    const { handleCancelListingClick } = useCancelListing(
        marketplaceAddress,
        nftAddress,
        tokenId,
        isConnected,
        updatePageContentAfterTransaction
    )

    //------------------ Handlers ------------------------
    // Handler for NFT card click
    const handleCardClick = () => {
        if (isOwnedByUser) {
            if (isListed) {
                setShowSellModal(true)
            } else {
                setShowListModal(true)
            }
        } else {
            setShowInfoModal(true)
        }
    }

    // Handler to copy NFT address to clipboard
    const copyNftAddressToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(nftAddress)
            showNftNotification("Success", "Address copied!", "success")
        } catch (error) {
            showNftNotification("Error", "Error copying!", "error")
        }
    }

    // Handler for list button click
    const handleListClick = () => {
        router.push(
            `/sell-swap-nft?nftAddress=${nftAddress}&tokenId=${tokenId}&price=${formatPriceToEther(
                price
            )}`
        )
    }

    // Handler for updating price button click
    const handleUpdatePriceButtonClick = () => {
        setShowUpdateListingModal(true)
    }
    // ------------------ useEffect Hooks ------------------
    // Listener for modals' state
    useEffect(() => {
        setAnyModalIsOpen(
            showUpdateListingModal || showInfoModal || showSellModal || showListModal
        )
    }, [showUpdateListingModal, showInfoModal, showSellModal, showListModal])

    // Handle modal open/close effects on body overflow
    useEffect(() => {
        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = anyModalIsOpen ? "hidden" : "auto"
        return () => {
            document.body.style.overflow = previousOverflow
        }
    }, [anyModalIsOpen])

    // Effect to update truncated strings when currentOwner or nftAddress change
    useEffect(() => {
        setformattedDesiredNftAddress(truncateStr(desiredNftAddress, 15))
        setFormattedNftAddress(truncateStr(nftAddress, 15))
        setFormattedNftOwner(truncateStr(nftOwner, 15))
    }, [nftAddress, nftOwner])

    // ------------------ Component Return ------------------

    return (
        <>
            {imageURI ? (
                <div className={styles.nftCard} onClick={handleCardClick}>
                    {" "}
                    <div className={styles.cardTitleWrapper}>
                        <div className={styles.cardTitle}>
                            <h2>{tokenName}</h2>
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
                        loading="eager"
                        alt={tokenDescription || "..."}
                    />
                    <div className={styles.cardTextArea}>
                        <div className={styles.cardOwnerAndId}>
                            <div>Owned by {isOwnedByUser ? "You" : formattedNftOwner}</div>
                            <div>Token #{tokenId}</div>
                        </div>
                        <div className={styles.cardListedPrice}>
                            <div className={styles.cardPrice}>
                                {ethers.utils.formatUnits(price, "ether")} ETH
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className={styles.nftLoadingIconWrapper}>
                    <div className={styles.nftLoadingIcon}>
                        <LoadingWave />
                    </div>
                </div>
            )}

            {/* NFT Info Modal */}
            <CSSTransition
                in={showInfoModal}
                timeout={400}
                classNames={{
                    enter: styles.modalTransitionEnter,
                    enterActive: styles.modalTransitionEnterActive,
                    exit: styles.modalTransitionExit,
                    exitActive: styles.modalTransitionExitActive,
                }}
                unmountOnExit
            >
                <NFTInfoModal
                    ref={modalRef}
                    show={showInfoModal}
                    type="info"
                    imageURI={imageURI.src}
                    description={description}
                    tokenDescription={tokenDescription}
                    formattedNftAddress={formattedNftAddress}
                    desiredNftAddress={desiredNftAddress}
                    formattedDesiredNftAddress={formattedDesiredNftAddress}
                    desiredTokenId={desiredTokenId}
                    formattedNftOwner={isOwnedByUser ? "You" : formattedNftOwner}
                    tokenId={tokenId}
                    tokenName={tokenName}
                    isListed={isListed}
                    price={ethers.utils.formatUnits(price, "ether")}
                    buyerCount={buyerCount}
                    handleBuyClick={handleBuyClick}
                    copyNftAddressToClipboard={copyNftAddressToClipboard}
                    closeModal={() => setShowInfoModal(false)}
                />
            </CSSTransition>

            {/* NFT Selling Modal */}
            <CSSTransition
                in={showSellModal}
                timeout={400}
                classNames={{
                    enter: styles.modalTransitionEnter,
                    enterActive: styles.modalTransitionEnterActive,
                    exit: styles.modalTransitionExit,
                    exitActive: styles.modalTransitionExitActive,
                }}
                unmountOnExit
            >
                <NFTInfoModal
                    ref={modalRef}
                    show={showSellModal}
                    type="sell"
                    imageURI={imageURI.src}
                    description={description}
                    tokenDescription={tokenDescription}
                    formattedNftAddress={formattedNftAddress}
                    desiredNftAddress={desiredNftAddress}
                    formattedDesiredNftAddress={formattedDesiredNftAddress}
                    desiredTokenId={desiredTokenId}
                    formattedNftOwner={isOwnedByUser ? "You" : formattedNftOwner}
                    tokenId={tokenId}
                    tokenName={tokenName}
                    isListed={isListed}
                    price={ethers.utils.formatUnits(price, "ether")}
                    buyerCount={buyerCount}
                    handleCancelListingClick={handleCancelListingClick}
                    handleUpdatePriceButtonClick={handleUpdatePriceButtonClick}
                    copyNftAddressToClipboard={copyNftAddressToClipboard}
                    closeModal={() => setShowSellModal(false)}
                />
            </CSSTransition>
            {/* NFT Listing Modal */}
            <CSSTransition
                in={showListModal}
                timeout={400}
                classNames={{
                    enter: styles.modalTransitionEnter,
                    enterActive: styles.modalTransitionEnterActive,
                    exit: styles.modalTransitionExit,
                    exitActive: styles.modalTransitionExitActive,
                }}
                unmountOnExit
            >
                <NFTInfoModal
                    ref={modalRef}
                    show={showListModal}
                    type="list"
                    imageURI={imageURI.src}
                    description={description}
                    tokenDescription={tokenDescription}
                    formattedNftAddress={formattedNftAddress}
                    desiredNftAddress={desiredNftAddress}
                    formattedDesiredNftAddress={formattedDesiredNftAddress}
                    desiredTokenId={desiredTokenId}
                    formattedNftOwner={isOwnedByUser ? "You" : formattedNftOwner}
                    tokenId={tokenId}
                    tokenName={tokenName}
                    isListed={isListed}
                    price={ethers.utils.formatUnits(price, "ether")}
                    buyerCount={buyerCount}
                    handleListClick={handleListClick}
                    copyNftAddressToClipboard={copyNftAddressToClipboard}
                    closeModal={() => setShowListModal(false)}
                />
            </CSSTransition>
            {/*Price Updating Modal*/}
            <CSSTransition
                in={showUpdateListingModal}
                timeout={400}
                classNames={{
                    enter: styles.updateModalTransitionEnter,
                    enterActive: styles.updateModalTransitionEnterActive,
                    exit: styles.updateModalTransitionExit,
                    exitActive: styles.updateModalTransitionExitActive,
                }}
                unmountOnExit
            >
                <NFTUpdateListingModal
                    ref={updateModalRef}
                    tokenId={tokenId}
                    marketplaceAddress={marketplaceAddress}
                    nftAddress={nftAddress}
                    desiredNftAddress={desiredNftAddress}
                    desiredTokenId={desiredTokenId}
                    price={formattedPrice}
                    showUpdateListingModal={showUpdateListingModal}
                    onCancel={() => setShowUpdateListingModal(false)}
                />
            </CSSTransition>
        </>
    )
}
