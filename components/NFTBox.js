import { useState, useEffect } from "react"
import { useWeb3Contract, useMoralis } from "react-moralis"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"
import Image from "next/image"
import { Card, useNotification, Modal, Button } from "web3uikit"
import { ethers } from "ethers"
import UpdateListingModal from "./UpdateListingModal"
import styles from '../styles/Home.module.css'
import LoadingIcon from "../public/LoadingIcon"

const truncateStr = (fullStr, strLen) => {
    if (fullStr.length <= strLen) return fullStr

    const separator = "..."
    const seperatorLength = separator.length
    const charsToShow = strLen - seperatorLength
    const frontChars = Math.ceil(charsToShow / 2)
    const backChars = Math.floor(charsToShow / 2)
    return (
        fullStr.substring(0, frontChars) + separator + fullStr.substring(fullStr.length - backChars)
    )
}

export default function NFTBox({ price, nftAddress, tokenId, marketplaceAddress, seller, disableMouseWheel, enableMouseWheel, isModalOpen }) {
    const { isWeb3Enabled, account } = useMoralis()
    const [imageURI, setImageURI] = useState("")
    const [tokenName, setTokenName] = useState("")
    const [tokenDescription, setTokenDescription] = useState("")
    const dispatch = useNotification()

    const [showInfoModal, setShowInfoModal] = useState(false) // Modal for info NFT
    const [showSellModal, setShowSellModal] = useState(false) // Modal for selling NFT
    const [showUpdateListingModal, setShowUpdateListingModal] = useState(false) // Modal for updating Price

    const [loadingImage, setLoadingImage] = useState(false) // Added loading state
    const [errorLoadingImage, setErrorLoadingImage] = useState(false) // Added error state

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
                console.error("Error loading image or token information:", error);
                setErrorLoadingImage(true);
            }
        }
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    const isOwnedByUser = seller === account || seller === undefined
    const formattedSellerAddress = isOwnedByUser ? "You" : truncateStr(seller || "", 15)
    const formattedNftAddress = truncateStr(nftAddress || "", 15)

    const handleCardClick = () => {
        if (isOwnedByUser) {
            setShowSellModal(true) // Open NFT sell modal
            disableMouseWheel(); // Call the function to disable the mouse wheel
        } else {
            setShowInfoModal(true) // Open NFT info modal
            disableMouseWheel(); // Call the function to disable the mouse wheel
        }
    }

    const [buying, setBuying] = useState(false); // Added buying state

    const handleBuyClick = () => {
        isOwnedByUser
            ? setShowInfoModal(true)
            : buyItem({
                // !!!W here it should also have a modal coming up, which displays detailed infromation about the nft and on there there would be a button for the buy function
                onError: (error) => console.log(error),
                onSuccess: handleBuyItemSuccess,
            })
    }

    const openUpdateListingModal = () => {
        setShowUpdateListingModal(true);
        disableMouseWheel();
    };

    const handleUpdatePriceButtonClick = () => {
        openUpdateListingModal(true);
        setShowSellModal(false); // Close NFT Selling Modal
        disableMouseWheel(); // Call the function to enable the mousewheel
    }

    const handleBuyItemSuccess = async (tx) => {
try {
        await tx.wait(1)
        dispatch({
            type: "success",
            message: "Item bought!",
            title: "Item Bought",
            position: "topR",
        });
        enableMouseWheel(); // Call the function to enable the mousewheel
    } catch (error) {
       console.error("Error processing transaction success:", error);
            setTransactionError("An error occurred while processing the transaction.");
        } finally {
            setBuying(false); // Reset buying state
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
        if (isWeb3Enabled) {
            loadImage() // Load the image when the component mounts
        }
    }, [isWeb3Enabled])

    return (
        <div className={styles.NFTCardWrapper}>
                {imageURI ? (
                        <Card
                            className={styles.NFTCard}
                            title={tokenName}
                            description={tokenDescription || '...'}
                            onClick={() => {
                                handleCardClick();
                                disableMouseWheel();
                            }}
                        >
                            <div>
                                <div className={styles.NFTTextArea}>
                                    <div>#{tokenId}</div>
                                    <div className={styles.NFTOwner}>Owned by {formattedSellerAddress}</div>
                                    {imageURI ? (
                                        <Image
                                            className={styles.NFTImage}
                                            src={imageURI.src}
                                            height={100}
                                            width={100}
                                            loading="eager"
                                            alt={tokenDescription} />
                                    ) : (
                                        <div>
                                            {loadingImage ? (
                                                <div>Loading Image... </div>
                                            ) : errorLoadingImage ? (
                                                <div>Error loading image</div>
                                            ) : (
                                                <Image
                                                    className={styles.NFTImage}
                                                    src={imageURI.src}
                                                    height={100}
                                                    width={100}
                                                    alt={tokenDescription} />
                                            )}
                                        </div>
                                    )}
                                    <div className="font-bold">{ethers.utils.formatUnits(price, "ether")} ETH</div>
                                </div>
                            </div>
                        </Card>
                ) : (
                    <div className={styles.loadingIcon}>
                        <LoadingIcon /></div>
                )}
            {/* NFT Info Modal */}
            {showInfoModal && (
                <Modal
                    className={styles.NFTInfoModal}
                    onCancel={() => { setShowInfoModal(false); enableMouseWheel(); }}
                    onOk={handleBuyClick}
                    closeButton={<Button disabled text=""></Button>}
                    cancelText="Close"
                    okText="BUY!"
                    width="325px"
                >
                    <Image
                        className={styles.NFTImage}
                        src={imageURI.src}
                        alt={tokenDescription}
                        height={100}
                        width={100}
                    />
                    <div className={styles.NFTInformation}>
                        <div>
                            <p>Owned by: </p><p>{formattedSellerAddress}</p>
                        </div>
                        <div>
                            <p>Token-Adress: </p><p>{formattedNftAddress}</p>
                        </div>
                        <div>
                            <p>Token-Id: </p><p>{tokenId}</p>
                        </div>
                        <div>
                            <p>Name: </p><p>{tokenName}</p>
                        </div>
                        <div>
                            <p>Description: </p><p>{tokenDescription || '...'}</p>
                        </div>
                        <div>
                            <p>Price: </p><p>{ethers.utils.formatUnits(price, "ether")} ETH</p>
                        </div>
                    </div>
                </Modal>
            )}

            {/* NFT Selling Modal */}
            {showSellModal && (
                <Modal
                    className={styles.NFTInfoModal}
                    onOk={() => handleUpdatePriceButtonClick()
                    }
                    okText="Update price"
                    onCancel={() => {
                        setShowSellModal(false); enableMouseWheel()
                    }}
                    cancelText="Close"
                    closeButton={<Button disabled text=""></Button>}
                    width="325px"
                >
                    <Image
                        className={styles.NFTImage}
                        src={imageURI.src}
                        alt={tokenDescription}
                        height={100}
                        width={100}
                    />
                    <div className={styles.NFTInformation}>
                        <div>
                            <p>Owned by: </p><p>{formattedSellerAddress}</p>
                        </div>
                        <div>
                            <p>Token-Adress: </p><p>{formattedNftAddress}</p>
                        </div>
                        <div>
                            <p>Token-Id: </p><p>{tokenId}</p>
                        </div>
                        <div>
                            <p>Name: </p><p>{tokenName}</p>
                        </div>
                        <div>
                            <p>Description: </p><p>{tokenDescription || '...'}</p>
                        </div>
                        <div>
                            <p>Price: </p><p>{ethers.utils.formatUnits(price, "ether")} ETH</p>
                        </div>
                    </div>
                </Modal>
            )}

            {/*Price Updating Modal*/}
            {showUpdateListingModal && (<UpdateListingModal
                className={styles.updateListingPriceModal}
                tokenId={tokenId}
                marketplaceAddress={marketplaceAddress}
                nftAddress={nftAddress}
                onCancel={() => {
                    setShowUpdateListingModal(false); enableMouseWheel()
                }}
            />
            )}
        </div>
    )
}
