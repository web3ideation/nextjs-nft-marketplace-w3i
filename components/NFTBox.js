import { useState, useEffect, useCallback } from "react"
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
        tokenId,
        price,
        seller,
        isListed,
        listingId,
        buyer,
        imageURI,
        tokenName,
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
    const [formattedSeller, setFormattedSeller] = useState("")
    const [formattedNftAddress, setFormattedNftAddress] = useState("")

    // Modal states
    const [anyModalIsOpen, setAnyModalIsOpen] = useState(false)
    const [showInfoModal, setShowInfoModal] = useState(false)
    const [showSellModal, setShowSellModal] = useState(false)
    const [showListModal, setShowListModal] = useState(false)
    const [showUpdateListingModal, setShowUpdateListingModal] = useState(false)

    // Message states
    const { nftNotifications, showNftNotification, clearNftNotification, closeNftNotification } =
        useNftNotification()
    const [transactionError, setTransactionError] = useState(false)

    // ------------------ Derived States & Utilities ------------------

    // Check ownership of the NFT
    const isOwnedBySeller = seller === account && !buyer
    const isOwnedByBuyer = buyer === account
    const isOwnedByUser = isWeb3Enabled && (isOwnedBySeller || isOwnedByBuyer)

    // Determine the current owner of the NFT
    const currentOwner = buyer || seller || ""

    // Format addresses for display

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
            showNftNotification("Connect", "Connect your wallet to buy items!", "error")
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
        try {
            await navigator.clipboard.writeText(nftAddress)
            // Zeigen Sie hier die Erfolgsbenachrichtigung an
            console.log("copy")
            showNftNotification("Success", "Address copied!", "success")
        } catch (error) {
            console.error("Error copying to clipboard:", error)
            // Zeigen Sie hier eine Fehlerbenachrichtigung an, falls gewünscht
            showNftNotification("Error", "Error copying!", "error")
        }
    }

    // ------------------ Render Functions ------------------

    // Render the NFT card

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
        setFormattedSeller(truncateStr(currentOwner, 15))
        setFormattedNftAddress(truncateStr(nftAddress, 15))
    }, [currentOwner, nftAddress])

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
                    <div className={styles.nftTextArea}>
                        <div className={styles.nftCardInformation}>
                            <div className={styles.nftTitle}>
                                <h2>{tokenName}</h2>
                            </div>
                            <div className={styles.nftDescription}>
                                {tokenDescription || "..."}
                            </div>
                        </div>
                    </div>
                    <Image
                        className={styles.nftImage}
                        src={imageURI.src}
                        height={300}
                        width={300}
                        loading="eager"
                        alt={tokenDescription || "..."}
                    />
                    <div className={styles.nftTextArea}>
                        <div className={styles.nftOwnerAndId}>
                            <div className={styles.nftOwner}>
                                Owned by {isOwnedByUser ? "You" : formattedSeller}
                            </div>
                            <div>#{tokenId}</div>
                        </div>
                        <div className={styles.nftListedPrice}>
                            <div className={styles.nftPrice}>
                                {ethers.utils.formatUnits(price, "ether")} ETH
                            </div>
                            <div>
                                {isListed ? (
                                    <div className={styles.nftListedStatus}>
                                        Listed #{listingId}
                                    </div>
                                ) : (
                                    <div className={styles.nftNotListedStatus}>
                                        Not Listed #{listingId}
                                    </div>
                                )}
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
            {showInfoModal && (
                <NFTInfoModal
                    show={showInfoModal}
                    type="info"
                    imageURI={imageURI.src}
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
            )}
            {/* NFT Selling Modal */}
            {showSellModal && (
                <NFTInfoModal
                    show={showSellModal}
                    type="sell"
                    imageURI={imageURI.src}
                    tokenDescription={tokenDescription}
                    formattedNftAddress={formattedNftAddress}
                    formattedSellerAddress={formattedSeller}
                    tokenId={tokenId}
                    tokenName={tokenName}
                    price={ethers.utils.formatUnits(price, "ether")}
                    buyerCount={buyerCount}
                    handleUpdatePriceButtonClick={handleUpdatePriceButtonClick}
                    copyNftAddressToClipboard={copyNftAddressToClipboard}
                    closeModal={() => setShowSellModal(false)}
                />
            )}
            {/* NFT Listing Modal */}
            {showListModal && (
                <NFTInfoModal
                    show={showListModal}
                    type="list"
                    imageURI={imageURI.src}
                    tokenDescription={tokenDescription}
                    formattedNftAddress={formattedNftAddress}
                    formattedSellerAddress={formattedSeller}
                    tokenId={tokenId}
                    tokenName={tokenName}
                    price={ethers.utils.formatUnits(price, "ether")}
                    buyerCount={buyerCount}
                    handleListClick={handleListClick}
                    copyNftAddressToClipboard={copyNftAddressToClipboard}
                    closeModal={() => setShowListModal(false)}
                />
            )}
            {/*Price Updating Modal*/}
            {showUpdateListingModal && (
                <NFTUpdateListingModal
                    tokenId={tokenId}
                    marketplaceAddress={marketplaceAddress}
                    nftAddress={nftAddress}
                    onCancel={() => {
                        setShowUpdateListingModal(false)
                    }}
                />
            )}
        </>
    )
}
