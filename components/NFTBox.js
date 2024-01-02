import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/router"
import Image from "next/image"
import { ethers } from "ethers"
import { CSSTransition } from "react-transition-group"
import { useAccount, usePublicClient } from "wagmi"

import { useNFT } from "../context/NFTContextProvider"
import { useNftNotification } from "../context/NFTNotificationContext"
import networkMapping from "../constants/networkMapping.json"
import LoadingWave from "./ui/LoadingWave"
import NFTInfoModal from "./ui/NFTInfoModal"
import NFTUpdateListingModal from "./ui/NFTUpdateListingModal"
import styles from "../styles/Home.module.css"
import { useBuyItem } from "../hooks/useBuyItem"
import { useCancelListing } from "../hooks/useCancelListing"
import { truncateStr, formatPriceToEther, truncatePrice } from "../utils/formatting"
import { updatePageContentAfterTransaction } from "../utils/nftUpdating"
import { copyNftAddressToClipboard } from "../utils/copyAddress"
import { fetchEthToEurRate } from "../utils/fetchEthToEurRate"

export default function NFTBox({ nftData, loadingImage }) {
    // ------------------ Hooks & Data Retrieval ------------------
    // Destructure NFT details directly from the prop
    const {
        nftAddress,
        tokenOwner,
        tokenId,
        price,
        isListed,
        listingId,
        imageURI,
        tokenName,
        tokenSymbol,
        description,
        tokenDescription,
        tokenExternalLink,
        attributes,
        buyerCount,
        desiredNftAddress,
        desiredTokenId,
    } = nftData

    const { loadNFTs } = useNFT()
    // Message states
    const { showNftNotification } = useNftNotification()
    const { address, isConnected } = useAccount()
    const router = useRouter()
    const chainString = usePublicClient().chains[0]?.id?.toString() ?? "31337"
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]

    // ------------------ State Management ------------------
    // State for truncated strings
    const [formattedNftAddress, setFormattedNftAddress] = useState("")
    const [formattedTokenOwner, setFormattedTokenOwner] = useState("")
    const [formattedDesiredNftAddress, setFormattedDesiredNftAddress] = useState("")
    const [formattedPriceInEur, setFormattedPriceInEur] = useState("")

    // Modal states
    const [anyModalIsOpen, setAnyModalIsOpen] = useState(false)
    const [showInfoModal, setShowInfoModal] = useState(false)
    const [showSellModal, setShowSellModal] = useState(false)
    const [showListModal, setShowListModal] = useState(false)
    const [showUpdateListingModal, setShowUpdateListingModal] = useState(false)

    // ------------------- Refs ---------------------------
    const modalRef = useRef(null)
    const updateModalRef = useRef(null)

    // Check ownership of the NFT
    const isOwnedByUser = isConnected && tokenOwner?.toLowerCase() === address?.toLowerCase()

    const formattedPrice = formatPriceToEther(price)

    // Convert price to euros
    const [priceInEur, setPriceInEur] = useState(null)

    // ------------------ Functions and event-handler ------------------
    const reloadNFTs = useCallback(() => loadNFTs(), [loadNFTs])
    const handleTransactionCompletion = () => updatePageContentAfterTransaction(reloadNFTs)
    const handleCopyAddress = () => {
        copyNftAddressToClipboard(nftAddress, showNftNotification)
    }

    // ------------------ Contract functions ------------------
    // function for buy item
    const { handleBuyClick } = useBuyItem(
        marketplaceAddress,
        price,
        nftAddress,
        tokenId,
        isConnected,
        handleTransactionCompletion
    )
    // function for delisting item
    const { handleCancelListingClick } = useCancelListing(
        marketplaceAddress,
        nftAddress,
        tokenId,
        isConnected,
        handleTransactionCompletion
    )

    // Handler for NFT card click
    const handleCardClick = useCallback(() => {
        setShowInfoModal(!isOwnedByUser)
        setShowSellModal(isOwnedByUser && isListed)
        setShowListModal(isOwnedByUser && !isListed)
    }, [isOwnedByUser, isListed])

    // Handler for list button click
    const handleListClick = () => {
        router.push(
            `/sell-swap-nft?nftAddress=${nftAddress}&tokenId=${tokenId}&price=${formatPriceToEther(
                price
            )}`
        )
    }

    // Handler for updating price button click
    const handleUpdatePriceButtonClick = () => setShowUpdateListingModal(true)

    // ------------------ useEffect ------------------
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
        setFormattedDesiredNftAddress(truncateStr(desiredNftAddress, 4, 4))
        setFormattedNftAddress(truncateStr(nftAddress, 4, 4))
        setFormattedTokenOwner(truncateStr(tokenOwner, 4, 4))
        setFormattedPriceInEur(truncatePrice(priceInEur, 5))
    }, [nftAddress, tokenOwner, desiredNftAddress, priceInEur])

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
                <div className={styles.nftCard} onClick={handleCardClick}>
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
                            <div>{tokenName}</div>
                            <div>#{tokenId}</div>
                        </div>
                        <div className={styles.cardListedPrice}>
                            <div className={styles.cardPrice}>{formattedPrice} ETH</div>
                            {priceInEur && <strong>{formattedPriceInEur} EUR</strong>}
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
                    tokenExternalLink={tokenExternalLink}
                    attributes={attributes}
                    formattedNftAddress={formattedNftAddress}
                    desiredNftAddress={desiredNftAddress}
                    formattedDesiredNftAddress={formattedDesiredNftAddress}
                    desiredTokenId={desiredTokenId}
                    formattedTokenOwner={isOwnedByUser ? "You" : formattedTokenOwner}
                    tokenId={tokenId}
                    tokenName={tokenName}
                    tokenSymbol={tokenSymbol}
                    isListed={isListed}
                    price={formattedPrice}
                    priceInEur={formattedPriceInEur}
                    buyerCount={buyerCount}
                    handleBuyClick={handleBuyClick}
                    copyNftAddressToClipboard={handleCopyAddress}
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
                    tokenExternalLink={tokenExternalLink}
                    attributes={attributes}
                    formattedNftAddress={formattedNftAddress}
                    desiredNftAddress={desiredNftAddress}
                    formattedDesiredNftAddress={formattedDesiredNftAddress}
                    desiredTokenId={desiredTokenId}
                    formattedTokenOwner={isOwnedByUser ? "You" : formattedTokenOwner}
                    tokenId={tokenId}
                    tokenName={tokenName}
                    tokenSymbol={tokenSymbol}
                    isListed={isListed}
                    price={formattedPrice}
                    priceInEur={formattedPriceInEur}
                    buyerCount={buyerCount}
                    handleCancelListingClick={handleCancelListingClick}
                    handleUpdatePriceButtonClick={handleUpdatePriceButtonClick}
                    copyNftAddressToClipboard={handleCopyAddress}
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
                    tokenExternalLink={tokenExternalLink}
                    attributes={attributes}
                    formattedNftAddress={formattedNftAddress}
                    desiredNftAddress={desiredNftAddress}
                    formattedDesiredNftAddress={formattedDesiredNftAddress}
                    desiredTokenId={desiredTokenId}
                    formattedTokenOwner={isOwnedByUser ? "You" : formattedTokenOwner}
                    tokenId={tokenId}
                    tokenName={tokenName}
                    tokenSymbol={tokenSymbol}
                    isListed={isListed}
                    price={formattedPrice}
                    priceInEur={formattedPriceInEur}
                    buyerCount={buyerCount}
                    handleListClick={handleListClick}
                    copyNftAddressToClipboard={handleCopyAddress}
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
