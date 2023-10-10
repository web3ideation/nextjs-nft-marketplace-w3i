import { useState, useEffect, useCallback } from "react"
import { useWeb3Contract, useMoralis } from "react-moralis"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"
import Image from "next/image"
import { useNotification } from "web3uikit"
import { ethers } from "ethers"
import NFTUpdateListingModal from "./NFTUpdateListingModal"
import styles from "../styles/Home.module.css"
import LoadingIcon from "../public/LoadingIcon"
import NFTInfoModal from "../components/NFTInfoModal"

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

export default function NFTBox({
    price,
    nftAddress,
    tokenId,
    marketplaceAddress,
    seller,
    isListed,
}) {
    // State hooks
    const { isWeb3Enabled, account } = useMoralis()
    const [imageURI, setImageURI] = useState("")
    const [tokenName, setTokenName] = useState("")
    const [tokenDescription, setTokenDescription] = useState("")
    const [loadingImage, setLoadingImage] = useState(false) // Added loading state
    const [errorLoadingImage, setErrorLoadingImage] = useState(false) // Added error state
    const [transactionError, setTransactionError] = useState(null)
    const [buying, setBuying] = useState(false) // Added buying state
    const [showInfoModal, setShowInfoModal] = useState(false) // Modal for info NFT
    const [showSellModal, setShowSellModal] = useState(false) // Modal for selling NFT
    const [showUpdateListingModal, setShowUpdateListingModal] = useState(false) // Modal for updating Price
    const [anyModalIsOpen, setAnyModalIsOpen] = useState(false)

    const dispatch = useNotification()

    const isOwnedByUser = seller === account || seller === undefined
    const formattedSellerAddress = isOwnedByUser ? "You" : truncateStr(seller || "", 15)
    const formattedNftAddress = truncateStr(nftAddress || "", 15)

    function useRawTokenURI(nftAddress, tokenId) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)

        const getRawTokenURI = async () => {
            try {
                const functionSignature = ethers.utils.id("tokenURI(uint256)").slice(0, 10)
                const tokenIdHex = ethers.utils
                    .hexZeroPad(ethers.BigNumber.from(tokenId).toHexString(), 32)
                    .slice(2)
                const data = functionSignature + tokenIdHex

                const result = await provider.call({
                    to: nftAddress,
                    data: data,
                })
                const decodedData = ethers.utils.defaultAbiCoder.decode(["string"], result)
                const tokenUri = decodedData[0]
                return tokenUri
            } catch (error) {
                console.error("Error fetching raw tokenURI:", error)
                throw error
            }
        }

        return getRawTokenURI
    }

    const getRawTokenURI = useRawTokenURI(nftAddress, tokenId)

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

    // Handlers
    const handleCardClick = () => {
        isOwnedByUser ? setShowSellModal(true) : setShowInfoModal(true)
    }

    const handleBuyClick = async () => {
        if (buying) return

        setBuying(true)
        if (!isWeb3Enabled) {
            dispatch({ type: "error", message: "Please connect your wallet to buy this NFT." })
        } else {
            if (isOwnedByUser) {
                setShowInfoModal(true)
            } else {
                await buyItem({
                    onError: (error) => {
                        console.error(error)
                        setBuying(false)
                    },
                    onSuccess: handleBuyItemSuccess,
                })
            }
        }
    }

    const handleBuyItemSuccess = async (tx) => {
        try {
            await tx.wait(1)
            dispatch({
                type: "success",
                message: "Item bought!",
                title: "Item Bought",
                position: "topR",
            })
        } catch (error) {
            console.error("Error processing transaction success:", error)
            setTransactionError("An error occurred while processing the transaction.")
        } finally {
            setBuying(false) // Reset buying state
        }
    }

    const handleUpdatePriceButtonClick = () => {
        openUpdateListingModal(true)
        setShowSellModal(false) // Close NFT Selling Modal
    }

    const modalListener = useCallback(() => {
        setAnyModalIsOpen(showUpdateListingModal || showInfoModal || showSellModal)
    }, [showUpdateListingModal, showInfoModal, showSellModal])

    useEffect(() => {
        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = anyModalIsOpen ? "hidden" : "auto"
        return () => {
            document.body.style.overflow = previousOverflow
        }
    }, [anyModalIsOpen])

    // Load the image from IPFS and fall back to HTTP if needed
    const loadImage = useCallback(async () => {
        setLoadingImage(true) // Set loading state to true
        try {
            const tokenURI = await getRawTokenURI()
            const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
            const tokenURIResponse = await (await fetch(requestURL)).json()
            const imageURI = tokenURIResponse.image
            const imageURIURL = imageURI.replace("ipfs://", "https://ipfs.io/ipfs/")
            setImageURI({ src: imageURIURL, width: 100 })
            setTokenName(tokenURIResponse.name)
            setTokenDescription(tokenURIResponse.description)
        } catch (error) {
            console.error("Error loading image:", error)
            setErrorLoadingImage(true)
            setLoadingImage(false) // Set loading state to false in case of error
        } finally {
            setLoadingImage(false) // Set loading state to false after image is loaded
        }
    }, [getRawTokenURI])

    const openUpdateListingModal = () => {
        setShowUpdateListingModal(true)
    }

    useEffect(() => {
        modalListener()
    }, [modalListener])

    useEffect(() => {
        loadImage()
    }, [loadImage])

    const [isCopying, setIsCopying] = useState(false)
    const handleMouseEnter = () => {
        setIsCopying(true)
    }

    const handleMouseLeave = () => {
        setIsCopying(false)
    }

    const copyNftAddressToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(nftAddress)
        } catch (error) {
            console.error("Error copying to clipboard:", error)
        }
    }

    return (
        <div className={styles.nftCardWrapper}>
            {imageURI ? (
                <div className={styles.nftCard} onClick={handleCardClick}>
                    <div>
                        {imageURI ? (
                            <Image
                                className={styles.nftImage}
                                src={imageURI.src}
                                height={100}
                                width={100}
                                loading="eager"
                                alt={tokenDescription}
                            />
                        ) : (
                            <div>
                                {loadingImage ? (
                                    <div>Loading Image... </div>
                                ) : errorLoadingImage ? (
                                    <div>Error loading image</div>
                                ) : (
                                    <Image
                                        className={styles.nftImage}
                                        src={imageURI.src}
                                        height={100}
                                        width={100}
                                        alt={tokenDescription}
                                    />
                                )}
                            </div>
                        )}
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
                                        <div className={styles.nftListedStatus}>Listed</div>
                                    ) : (
                                        <div className={styles.nftNotListedStatus}>Not Listed</div>
                                    )}
                                </div>
                            </div>
                            <div className={styles.nftCardInformation}>
                                <div className={styles.nftTitle}>
                                    <h2>{tokenName}</h2>
                                </div>
                                <div className={styles.nftDescription}>
                                    {tokenDescription || "..."}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className={styles.nftLoadingIconWrapper}>
                    <div className={styles.nftLoadingIcon}>
                        <LoadingIcon />
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
                    handleBuyClick={handleBuyClick}
                    handleMouseEnter={handleMouseEnter}
                    handleMouseLeave={handleMouseLeave}
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
        </div>
    )
}
