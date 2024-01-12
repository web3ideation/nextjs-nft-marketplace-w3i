// ------------------ React & Next.js Imports ------------------
import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/router"
import Image from "next/image"

// ------------------ Third-Party Imports ------------------
import { CSSTransition } from "react-transition-group"
import { useAccount, usePublicClient } from "wagmi"

// ------------------ Custom Hook Imports ------------------
import { useNFT } from "../../../context/NFTDataProvider"
import { useNftNotification } from "../../../context/NotificationProvider"
import { useBuyItem } from "../../../hooks/useBuyItem"
import { useCancelListing } from "../../../hooks/useCancelListing"

// ------------------ Component Imports ------------------
import LoadingWave from "../ux/LoadingWave"
import NFTInfoModal from "../Modal/ModalType/InfoModal/NFTInfoModal"
import NFTUpdateListingModal from "../Modal/ModalType/UpdateListingModal/NFTUpdateListingModal"

// ------------------ Utility Imports ------------------
import { truncateStr, formatPriceToEther, truncatePrice } from "../../../utils/formatting"
import { copyNftAddressToClipboard } from "../../../utils/copyAddress"
import { fetchEthToEurRate } from "../../../utils/fetchEthToEurRate"

// ------------------ Constant & Style Imports ------------------
import networkMapping from "../../../constants/networkMapping.json"
import styles from "../../../styles/Home.module.css"

// ------------------ Main Component Function ------------------
export default function NFTBox({ nftData }) {
    // Destructuring for clarity
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

    // Context and hook usage for data and actions
    const { reloadNFTs } = useNFT()
    const { showNftNotification } = useNftNotification()
    const { address, isConnected } = useAccount()
    const router = useRouter()
    const chainString = usePublicClient().chains[0]?.id?.toString() ?? "31337"
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]

    // State for handling UI and modal visibility
    const [formattedNftAddress, setFormattedNftAddress] = useState("")
    const [formattedTokenOwner, setFormattedTokenOwner] = useState("")
    const [formattedDesiredNftAddress, setFormattedDesiredNftAddress] = useState("")
    const [formattedPriceInEur, setFormattedPriceInEur] = useState("")
    const [anyModalIsOpen, setAnyModalIsOpen] = useState(false)
    const [showInfoModal, setShowInfoModal] = useState(false)
    const [showSellModal, setShowSellModal] = useState(false)
    const [showListModal, setShowListModal] = useState(false)
    const [showUpdateListingModal, setShowUpdateListingModal] = useState(false)

    // Refs for modals
    const modalRef = useRef(null)
    const updateModalRef = useRef(null)

    // Derived state calculations
    const isOwnedByUser = isConnected && tokenOwner?.toLowerCase() === address?.toLowerCase()
    const formattedPrice = formatPriceToEther(price)
    const [priceInEur, setPriceInEur] = useState(null)

    // Event handlers for various interactions
    const handleTransactionCompletion = () => {
        reloadNFTs()

        setTimeout(() => {
            router.push("/my-nft")
        }, 2000)
    }

    const handleCopyAddress = () => copyNftAddressToClipboard(nftAddress, showNftNotification)

    const { handleBuyClick } = useBuyItem(
        marketplaceAddress,
        price,
        nftAddress,
        tokenId,
        isConnected,
        formattedPrice,
        handleTransactionCompletion
    )
    const { handleCancelListingClick } = useCancelListing(
        marketplaceAddress,
        nftAddress,
        tokenId,
        isConnected,
        handleTransactionCompletion
    )
    const handleCardClick = useCallback(() => {
        setShowInfoModal(!isOwnedByUser)
        setShowSellModal(isOwnedByUser && isListed)
        setShowListModal(isOwnedByUser && !isListed)
    }, [isOwnedByUser, isListed])

    const handleListClick = (action) => {
        if (action === "sell") {
            // Logic for sell
            router.push(
                `/sell-nft?nftAddress=${nftAddress}&tokenId=${tokenId}&price=${formatPriceToEther(
                    price
                )}`
            )
        } else if (action === "swap") {
            // Logic for swap
            router.push(`/swap-nft?nftAddress=${nftAddress}&tokenId=${tokenId}`)
        }
    }

    const handleUpdatePriceButtonClick = () => setShowUpdateListingModal(true)

    // useEffect hooks for side effects
    useEffect(() => {
        setAnyModalIsOpen(
            showUpdateListingModal || showInfoModal || showSellModal || showListModal
        )
    }, [showUpdateListingModal, showInfoModal, showSellModal, showListModal])

    useEffect(() => {
        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = anyModalIsOpen ? "hidden" : "auto"
        return () => {
            document.body.style.overflow = previousOverflow
        }
    }, [anyModalIsOpen])

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
                <LoadingWave />
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
                    nftAddress={nftAddress}
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
                    nftAddress={nftAddress}
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
                    nftAddress={nftAddress}
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
                    isConnected={isConnected}
                    showUpdateListingModal={showUpdateListingModal}
                    closeModal={() => setShowUpdateListingModal(false)}
                />
            </CSSTransition>
        </>
    )
}
