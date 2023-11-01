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
    const [isConnected, setIsConnected] = useState(isWeb3Enabled)
    const [transactionError, setTransactionError] = useState(null)
    const [buying, setBuying] = useState(false)

    // Modal states
    const [showInfoModal, setShowInfoModal] = useState(false)
    const [showSellModal, setShowSellModal] = useState(false)
    const [showListModal, setShowListModal] = useState(false)
    const [showUpdateListingModal, setShowUpdateListingModal] = useState(false)
    const [anyModalIsOpen, setAnyModalIsOpen] = useState(false)

    // Message states
    const [showPurchaseMessage, setShowPurchaseMessage] = useState(false)
    const [showConnectMessage, setShowConnectMessage] = useState(false)

    const { nftNotification, showNftNotification, clearNftNotification } = useNftNotification()

    // Clipboard state
    const [isCopying, setIsCopying] = useState(false)

    // ------------------ Derived States & Utilities ------------------

    // Check ownership of the NFT
    const isOwnedBySeller = seller === account && !buyer
    const isOwnedByBuyer = buyer === account
    const isOwnedByUser = isConnected && (isOwnedBySeller || isOwnedByBuyer)

    // Determine the current owner of the NFT
    const currentOwner = buyer || seller || ""

    // Format addresses for display
    const formattedSellerAddress = isOwnedByUser ? "You" : truncateStr(currentOwner, 15)
    const formattedNftAddress = truncateStr(nftAddress || "", 15)

    // ------------------ Contract Functions ------------------

    // Contract function to buy an item !!! warum ist die hier???
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
        if (!isConnected) {
            setShowConnectMessage(true)
            return
        }

        if (buying) {
            showNftNotification("Buying", "A purchase is already in progress!", "info", 3000)
            return
        }

        setBuying(true)
        showNftNotification("Buying", "Initiating purchase...", "info")

        if (isOwnedByUser) {
            setShowInfoModal(true)
            setBuying(false) // Stellen Sie sicher, dass Sie den Kaufstatus zurücksetzen.
        } else {
            await buyItem({
                onError: (error) => {
                    console.error(error)
                    setBuying(false)
                    showNftNotification(
                        "Error",
                        "Could not complete the purchase.",
                        "error",
                        10000
                    )
                },
                onSuccess: handleBuyItemSuccess,
            })
        }
    }

    // Handler for successful item purchase
    const handleBuyItemSuccess = async (tx) => {
        try {
            await tx.wait(1)
            showNftNotification("Success", "Purchase successful!", "success", 10000)
        } catch (error) {
            console.error("Error processing transaction success:", error)
            showNftNotification(
                "Transaction Error",
                "An error occurred while purchasing.",
                "error",
                10000
            )
        } finally {
            setBuying(false)
            setShowPurchaseMessage(false)
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
    const modalListener = useCallback(() => {
        setAnyModalIsOpen(
            showUpdateListingModal || showInfoModal || showSellModal || showListModal
        )
    }, [showUpdateListingModal, showInfoModal, showSellModal, showListModal])

    //------------------ Handlers for nftAddress to copy ------------------

    // Handler for mouse enter on NFT address
    const handleMouseEnter = () => {
        setIsCopying(true)
    }

    // Handler for mouse leave on NFT address
    const handleMouseLeave = () => {
        setIsCopying(false)
    }

    // Handler to copy NFT address to clipboard
    const copyNftAddressToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(nftAddress)
            // Zeigen Sie hier die Erfolgsbenachrichtigung an
            showNftNotification("Success", "Address copied!", "success", 6000) // Annahme, dass die Funktion so definiert ist
        } catch (error) {
            console.error("Error copying to clipboard:", error)
            // Zeigen Sie hier eine Fehlerbenachrichtigung an, falls gewünscht
            showNftNotification("Error", "Error copying!", "error", 3000)
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

    // Update connection state and listen to modal changes
    useEffect(() => {
        setIsConnected(isWeb3Enabled)
        modalListener()
    }, [isWeb3Enabled, modalListener])

    // Handle connection state changes
    useEffect(() => {
        if (isConnected) {
            setShowConnectMessage(false)
        }
    }, [isConnected])

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
                                Owned by {formattedSellerAddress}
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
                    formattedSellerAddress={formattedSellerAddress}
                    tokenId={tokenId}
                    tokenName={tokenName}
                    price={ethers.utils.formatUnits(price, "ether")}
                    buyerCount={buyerCount}
                    handleBuyClick={handleBuyClick}
                    handleMouseEnter={handleMouseEnter}
                    handleMouseLeave={handleMouseLeave}
                    copyNftAddressToClipboard={copyNftAddressToClipboard}
                    closeModal={() => setShowInfoModal(false)}
                    showPurchaseMessage={showPurchaseMessage}
                    showConnectMessage={showConnectMessage}
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
                    formattedSellerAddress={formattedSellerAddress}
                    tokenId={tokenId}
                    tokenName={tokenName}
                    price={ethers.utils.formatUnits(price, "ether")}
                    handleUpdatePriceButtonClick={handleUpdatePriceButtonClick}
                    handleMouseEnter={handleMouseEnter}
                    handleMouseLeave={handleMouseLeave}
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
                    formattedSellerAddress={formattedSellerAddress}
                    tokenId={tokenId}
                    tokenName={tokenName}
                    price={ethers.utils.formatUnits(price, "ether")}
                    handleListClick={handleListClick}
                    handleMouseEnter={handleMouseEnter}
                    handleMouseLeave={handleMouseLeave}
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
