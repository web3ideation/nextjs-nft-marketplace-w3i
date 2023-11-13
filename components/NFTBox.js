import { useState, useEffect } from "react"
import { useWeb3Contract, useMoralis } from "react-moralis"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"
import networkMapping from "../constants/networkMapping.json"
import { useRouter } from "next/router"
import Image from "next/image"
import { useNftNotification } from "../context/NFTNotificationContext"
import { ethers } from "ethers"
import LoadingWave from "../components/LoadingWave"
import NFTInfoModal from "../components/NFTInfoModal"
import NFTUpdateListingModal from "./NFTUpdateListingModal"
import styles from "../styles/Home.module.css"
import { CSSTransition } from "react-transition-group"

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

export default function NFTBox({ nftData, loadingImage }) {
    // ------------------ Hooks & Data Retrieval ------------------

    // Destructure NFT details directly from the prop
    const {
        nftAddress,
        nftOwner,
        tokenId,
        price,
        seller,
        isListed,
        listingId,
        buyer,
        imageURI,
        tokenName,
        Background,
        description,
        tokenDescription,
        buyerCount,
    } = nftData

    // Retrieve blockchain and user data using Moralis hook
    const { chainId, isWeb3Enabled, account } = useMoralis()

    // Convert chain ID to string format
    const chainString = chainId ? parseInt(chainId).toString() : "31337"

    // Get the marketplace address based on the current chain
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]

    // Router and Notification hooks
    const router = useRouter()

    // ------------------ State Management ------------------

    // Web3 and User related states
    const [buying, setBuying] = useState(false)

    // State for truncated strings
    const [formattedNftAddress, setFormattedNftAddress] = useState("")
    const [formattedNftOwner, setFormattedNftOwner] = useState("")

    // Modal states
    const [anyModalIsOpen, setAnyModalIsOpen] = useState(false)
    const [showInfoModal, setShowInfoModal] = useState(false)
    const [showSellModal, setShowSellModal] = useState(false)
    const [showListModal, setShowListModal] = useState(false)
    const [showUpdateListingModal, setShowUpdateListingModal] = useState(false)

    // Message states
    const { showNftNotification, closeNftNotification } = useNftNotification()
    const [transactionError, setTransactionError] = useState(false)

    // ------------------ Derived States & Utilities ------------------

    // Check ownership of the NFT
    const isOwnedByUser = isWeb3Enabled && nftOwner?.toLowerCase() === account?.toLowerCase()

    // ------------------ Contract Functions ------------------

    // Contract function to buy an item
    const { runContractFunction: buyItem } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "buyItem",
        msgValue: price,
        params: {
            nftAddress: nftAddress,
            tokenId: tokenId,
        },
    })

    // ------------------ Event Handlers ------------------

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

    // Handler for buy click
    const handleBuyClick = async () => {
        let initiatingPurchaseNotificationId
        console.log("Item clicked", nftAddress, tokenId, marketplaceAddress, price)
        if (!isWeb3Enabled) {
            showNftNotification("Connect", "Connect your wallet to buy items!", "info")
            return
        }

        if (buying) {
            showNftNotification(
                "Buying",
                "A purchase is already in progress! Check your wallet!",
                "error"
            )
            return
        }
        setBuying(true)
        initiatingPurchaseNotificationId = showNftNotification(
            "Buying",
            "Initiating purchase... Check wallet!",
            "info",
            true
        )

        try {
            const tx = await buyItem({
                onError: (error) => {
                    console.error("buyItem", error)
                    setTransactionError(true)
                    showNftNotification(
                        "Error",
                        "Could not complete the purchase.",
                        "error",
                        false
                    )
                    closeNftNotification(initiatingPurchaseNotificationId)
                },
            })
            closeNftNotification(initiatingPurchaseNotificationId)
            await handleBuyItemSuccess(tx)
        } catch (error) {
            setTransactionError(true)
            console.error("Error buying item:", error)
            closeNftNotification(initiatingPurchaseNotificationId)
        } finally {
            // router.reload()
            setBuying(false)
            setTransactionError(false)
        }
    }

    // Handler for successful item purchase
    const handleBuyItemSuccess = async (tx) => {
        let purchaseInProgressNotificationId
        if (transactionError) {
            return
        }
        try {
            purchaseInProgressNotificationId = showNftNotification(
                "Buying",
                "Purchase in progress...",
                "info",
                true
            )
            await tx.wait(1)
            showNftNotification("Success", "Purchase successful!", "success")
            closeNftNotification(purchaseInProgressNotificationId)
        } catch (error) {
            console.error("Error processing transaction success:", error)
            showNftNotification("Error", "Error while purchasing!", "error")
            closeNftNotification(purchaseInProgressNotificationId)
        } finally {
        }
    }

    // Handler for updating price button click
    const handleUpdatePriceButtonClick = () => {
        openUpdateListingModal(true)
        setShowSellModal(false)
    }
    // Open the update listing modal
    const openUpdateListingModal = () => {
        setShowUpdateListingModal(true)
    }

    // Handler for list button click
    const handleListClick = () => {
        router.push(`/sell-swap-nft?nftAddress=${nftAddress}&tokenId=${tokenId}`)
    }

    // Listener for modals' state
    function modalListener() {
        setAnyModalIsOpen(
            showUpdateListingModal || showInfoModal || showSellModal || showListModal
        )
    }

    //------------------ Handler for nftAddress to copy ------------------

    // Handler to copy NFT address to clipboard
    const copyNftAddressToClipboard = async () => {
        let copyNftAddressNotificationId
        try {
            await navigator.clipboard.writeText(nftAddress)
            // Zeigen Sie hier die Erfolgsbenachrichtigung an
            console.log("copy")
            copyNftAddressNotificationId = showNftNotification(
                "Success",
                "Address copied!",
                "success"
            )
        } catch (error) {
            console.error("Error copying to clipboard:", error)
            // Zeigen Sie hier eine Fehlerbenachrichtigung an, falls gewünscht
            showNftNotification("Error", "Error copying!", "error")
        }
    }

    // ------------------ useEffect Hooks ------------------

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
        setFormattedNftAddress(truncateStr(nftAddress, 15))
        setFormattedNftOwner(truncateStr(nftOwner, 15))
    }, [nftAddress, nftOwner])

    // Update connection state and listen to modal changes
    useEffect(() => {
        modalListener()
    }, [showUpdateListingModal, showInfoModal, showSellModal, showListModal])

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
                    show={showInfoModal}
                    type="info"
                    imageURI={imageURI.src}
                    description={description}
                    tokenDescription={tokenDescription}
                    formattedNftAddress={formattedNftAddress}
                    formattedSellerAddress={formattedSeller}
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
                    show={showSellModal}
                    type="sell"
                    imageURI={imageURI.src}
                    description={description}
                    tokenDescription={tokenDescription}
                    formattedNftAddress={formattedNftAddress}
                    formattedSellerAddress={formattedSeller}
                    tokenId={tokenId}
                    tokenName={tokenName}
                    isListed={isListed}
                    price={ethers.utils.formatUnits(price, "ether")}
                    buyerCount={buyerCount}
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
                    show={showListModal}
                    type="list"
                    imageURI={imageURI.src}
                    description={description}
                    tokenDescription={tokenDescription}
                    formattedNftAddress={formattedNftAddress}
                    formattedSellerAddress={formattedSeller}
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
                    enter: styles.modalTransitionEnter,
                    enterActive: styles.modalTransitionEnterActive,
                    exit: styles.modalTransitionExit,
                    exitActive: styles.modalTransitionExitActive,
                }}
                unmountOnExit
            >
                <NFTUpdateListingModal
                    tokenId={tokenId}
                    marketplaceAddress={marketplaceAddress}
                    nftAddress={nftAddress}
                    showUpdateListingModal={showUpdateListingModal}
                    onCancel={() => {
                        setShowUpdateListingModal(false)
                    }}
                />
            </CSSTransition>
        </>
    )
}
