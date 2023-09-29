import { useState, useEffect } from "react"
import { useWeb3Contract, useMoralis } from "react-moralis"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"
import Image from "next/image"
import { Card, useNotification, Modal, Button } from "web3uikit"
import { ethers } from "ethers"
import UpdateListingModal from "./UpdateListingModal"
import styles from "../styles/Home.module.css"
import LoadingIcon from "../public/LoadingIcon"

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

export default function NFTBox({ price, nftAddress, tokenId, marketplaceAddress, seller }) {
    const { isWeb3Enabled, account } = useMoralis()
    const [imageURI, setImageURI] = useState("")
    const [tokenName, setTokenName] = useState("")
    const [tokenDescription, setTokenDescription] = useState("")
    const dispatch = useNotification()

    const [showInfoModal, setShowInfoModal] = useState(false) // Modal for info NFT
    const [showSellModal, setShowSellModal] = useState(false) // Modal for selling NFT
    const [showUpdateListingModal, setShowUpdateListingModal] = useState(false) // Modal for updating Price
    const [anyModalIsOpen, setAnyModalIsOpen] = useState(false)

    const [loadingImage, setLoadingImage] = useState(false) // Added loading state
    const [errorLoadingImage, setErrorLoadingImage] = useState(false) // Added error state
    const [transactionError, setTransactionError] = useState(null)

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

    async function updateUI() {
        const tokenURI = await getRawTokenURI()
        console.log(`The TokenURI is ${tokenURI}`)
        // We are going to cheat a little here... !!!W what does he mean and how to do it the correct way?
        if (tokenURI) {
            try {
                // IPFS Gateway: A server that will return IPFS files from a "normal" URL.
                const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
                const tokenURIResponse = await (await fetch(requestURL)).json()
                const imageURI = tokenURIResponse.image
                const imageURIURL = imageURI.replace("ipfs://", "https://ipfs.io/ipfs/")

                setImageURI(imageURIURL)
                setTokenName(tokenURIResponse.name)
                setTokenDescription(tokenURIResponse.description)
                // Ways for decentralizantion
                // We could render the Image on our sever, and just call our sever.
                // For testnets & mainnet -> use moralis server hooks
                // Have the world adopt IPFS
                // Build our own IPFS gateway
            } catch (error) {
                console.error("Error loading image or token information:", error)
                setErrorLoadingImage(true)
            }
        }
    }

    useEffect(() => {
        updateUI()
    }, [isWeb3Enabled])

    const isOwnedByUser = seller === account || seller === undefined
    const formattedSellerAddress = isOwnedByUser ? "You" : truncateStr(seller || "", 15)
    const formattedNftAddress = truncateStr(nftAddress || "", 15)

    const handleCardClick = () => {
        if (isOwnedByUser) {
            setShowSellModal(true) // Open NFT sell modal
        } else {
            setShowInfoModal(true) // Open NFT info modal
        }
    }

    const [buying, setBuying] = useState(false) // Added buying state

    const handleBuyClick = async () => {
        if (buying) return // Verhindere mehrfache Klicks, solange ein Kaufvorgang läuft
        setBuying(true)

        if (!isWeb3Enabled) {
            // Message to connect Wallet if you want to buy NFT
            alert("Please connect your wallet.")
        }
        try {
            if (isOwnedByUser) {
                setShowInfoModal(true)
            } else {
                await buyItem({
                    // !!!W here it should also have a modal coming up, which displays detailed infromation about the nft and on there there would be a button for the buy function
                    onError: (error) => {
                        console.error(error)
                        setBuying(false)
                    },
                    onSuccess: handleBuyItemSuccess,
                })
            }
        } finally {
            setBuying(false)
        }
    }

    const openUpdateListingModal = () => {
        setShowUpdateListingModal(true)
    }

    const handleUpdatePriceButtonClick = () => {
        openUpdateListingModal(true)
        setShowSellModal(false) // Close NFT Selling Modal
    }

    const preventScroll = (shouldPrevent) => {
        document.body.style.overflow = shouldPrevent ? "hidden" : "auto"
    }

    const modalListener = () => {
        setAnyModalIsOpen(showUpdateListingModal || showInfoModal || showSellModal)
    }

    useEffect(() => {
        modalListener()
        preventScroll(anyModalIsOpen)
    }, [anyModalIsOpen])

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

    // Load the image from IPFS and fall back to HTTP if needed
    const loadImage = async () => {
        try {
            setLoadingImage(true) // Set loading state to true
            setErrorLoadingImage(false) // Reset error state

            const tokenURI = await getRawTokenURI()
            if (tokenURI) {
                const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
                const tokenURIResponse = await (await fetch(requestURL)).json()
                const imageURI = tokenURIResponse.image
                const imageURIURL = imageURI.replace("ipfs://", "https://ipfs.io/ipfs/")
                setImageURI({ src: imageURIURL, width: 100 })
            }
            setLoadingImage(false) // Set loading state to false after image is loaded
        } catch (error) {
            console.error("Error loading image:", error)
            setErrorLoadingImage(true) // Set error state to true
            setLoadingImage(false) // Set loading state to false in case of error
        }
    }

    useEffect(() => {
        loadImage() // Load the image when the component mounts
    }, [isWeb3Enabled])
    const [isCopying, setIsCopying] = useState(false)
    const handleMouseEnter = () => {
        setIsCopying(true)
    }

    const handleMouseLeave = () => {
        setIsCopying(false)
    }

    const copyNftAddressToClipboard = async () => {
        // Kopieren Sie die NFT-Adresse in die Zwischenablage
        try {
            await navigator.clipboard.writeText(nftAddress)
            // Benachrichtigung oder Feedback hier hinzufügen
        } catch (error) {
            console.error("Error copying to clipboard:", error)
        }
    }

    return (
        <div className={styles.nftCardWrapper}>
            {imageURI ? (
                <Card
                    className={styles.nftCard}
                    style={{
                        backgroundColor: "white",
                        transition: "background-color 0.5s",
                        borderRadius: "5px",
                        padding: "0",
                    }}
                    onClick={handleCardClick}
                >
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
                            <div className={styles.nftOwner}>
                                Owned by {formattedSellerAddress}
                            </div>
                            <div className={styles.nftPrice}>
                                {ethers.utils.formatUnits(price, "ether")} ETH
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
                </Card>
            ) : (
                <div className={styles.loadingIcon}>
                    <LoadingIcon />
                </div>
            )}
            {/* NFT Info Modal */}
            {showInfoModal && (
                <Modal
                    className={styles.nftModalInfo}
                    onCancel={() => {
                        setShowInfoModal(false)
                    }}
                    onOk={handleBuyClick}
                    closeButton={<Button disabled text=""></Button>}
                    cancelText="Close"
                    okText="BUY!"
                    width="max-content"
                >
                    <Image
                        className={styles.nftModalImage}
                        src={imageURI.src}
                        alt={tokenDescription}
                        height={100}
                        width={100}
                    />
                    <div className={styles.nftModalInformation}>
                        <div>
                            <p>Owned by: </p>
                            <p>{formattedSellerAddress}</p>
                        </div>
                        <div>
                            <p>Token-Adress: </p>
                            <div
                                onMouseEnter={() => handleMouseEnter}
                                onMouseLeave={() => handleMouseLeave}
                                onClick={copyNftAddressToClipboard}
                                style={{
                                    display: "inline-block",
                                    position: "relative",
                                    cursor: isCopying ? "text" : "copy", // different cursor???
                                }}
                            >
                                <p>{formattedNftAddress}</p>
                            </div>
                        </div>
                        <div>
                            <p>Token-Id: </p>
                            <p>{tokenId}</p>
                        </div>
                        <div>
                            <p>Name: </p>
                            <p>{tokenName}</p>
                        </div>
                        <div>
                            <p>Description: </p>
                            <p>{tokenDescription || "..."}</p>
                        </div>
                        <div>
                            <p>Price: </p>
                            <p>{ethers.utils.formatUnits(price, "ether")} ETH</p>
                        </div>
                    </div>
                </Modal>
            )}

            {/* NFT Selling Modal */}
            {showSellModal && (
                <Modal
                    className={styles.nftModalInfo}
                    onOk={() => handleUpdatePriceButtonClick()}
                    okText="Update price"
                    onCancel={() => {
                        setShowSellModal(false)
                    }}
                    cancelText="Close"
                    closeButton={<Button disabled text=""></Button>}
                    width="325px"
                >
                    <Image
                        className={styles.nftModalImage}
                        src={imageURI.src}
                        alt={tokenDescription}
                        height={100}
                        width={100}
                    />
                    <div className={styles.nftModalInformation}>
                        <div>
                            <p>Owned by: </p>
                            <p>{formattedSellerAddress}</p>
                        </div>
                        <div>
                            <p>Token-Adress: </p>
                            <div
                                onMouseEnter={() => handleMouseEnter}
                                onMouseLeave={() => handleMouseLeave}
                                onClick={copyNftAddressToClipboard}
                                style={{
                                    display: "inline-block",
                                    position: "relative",
                                    cursor: isCopying ? "text" : "copy", // different cursor???
                                }}
                            >
                                <p>{formattedNftAddress}</p>
                            </div>
                        </div>
                        <div>
                            <p>Token-Id: </p>
                            <p>{tokenId}</p>
                        </div>
                        <div>
                            <p>Name: </p>
                            <p>{tokenName}</p>
                        </div>
                        <div>
                            <p>Description: </p>
                            <p>{tokenDescription || "..."}</p>
                        </div>
                        <div>
                            <p>Price: </p>
                            <p>{ethers.utils.formatUnits(price, "ether")} ETH</p>
                        </div>
                    </div>
                </Modal>
            )}

            {/*Price Updating Modal*/}
            {showUpdateListingModal && (
                <UpdateListingModal
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
