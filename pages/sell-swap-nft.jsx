// React Imports
import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/router"

// User-Created Hooks and Components
import SellSwapForm from "../components/Main/SellSwapForm/SellSwapForm"
import { useNFT } from "../context/NFTDataProvider"
import { useNftNotification } from "../context/NotificationProvider"

// Styles
import styles from "../styles/Home.module.css"

// Ethereum and Smart Contract Interaction
import { ethers } from "ethers"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"
import networkMapping from "../constants/networkMapping.json"
import { getAccount, getContract } from "@wagmi/core"
import { usePublicClient, useContractWrite, useContractRead, useWaitForTransaction } from "wagmi"

const SellSwapNFT = () => {
    // -------------------- Web3 Elements ---------------------
    const provider = usePublicClient()
    const chainId = provider.chains[0]
    const chainString = chainId.id ? parseInt(chainId.id).toString() : "31337"
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]
    const contract = getContract({ address: marketplaceAddress, abi: nftMarketplaceAbi })
    const { address, isConnected } = getAccount()
    const router = useRouter()
    const { reloadNFTs } = useNFT()
    const { showNftNotification, closeNftNotification } = useNftNotification()

    // ------------------- State Management -------------------
    const [nftAddressFromQuery, setNftAddressFromQuery] = useState(router.query.nftAddress || "")
    const [tokenIdFromQuery, setTokenIdFromQuery] = useState(router.query.tokenId || "")
    const [priceFromQuery, setPriceFromQuery] = useState(router.query.price || "")
    const [activeForm, setActiveForm] = useState("sell")
    const [proceeds, setProceeds] = useState("0")
    const [approving, setApproving] = useState(false)
    const [listing, setListing] = useState(false)

    // Update NFT address and token ID from the router query
    useEffect(() => {
        setNftAddressFromQuery(router.query.nftAddress)
        setTokenIdFromQuery(router.query.tokenId)
        setPriceFromQuery(router.query.price)
    }, [router.query])

    // ------------------ Contract Functions ------------------
    // Read contract function to get proceeds
    const {
        data: returnedProceeds,
        isLoading: isLoadingProceeds,
        error: errorLoadingProceeds,
        refetch: refetchProceeds,
    } = useContractRead({
        address: marketplaceAddress,
        abi: nftMarketplaceAbi,
        functionName: "getProceeds",
        args: [address],
    })

    // Write Contract function to withdraw proceeds
    const withdrawlProceedsNotificationId = useRef(null)
    const whileWithdrawlNotificationId = useRef(null)

    const { data: withdrawData, writeAsync: withdrawProceeds } = useContractWrite({
        address: marketplaceAddress,
        abi: nftMarketplaceAbi,
        functionName: "withdrawProceeds",
        onSuccess: (data) => {
            console.log("Withdrawl send success: ", data)
            closeNftNotification(withdrawlProceedsNotificationId.current)
            setWithdrawTxHash(data.hash) // Store the transaction response
        },
        onError: (error) => {
            console.error("Error sending withdrawal:", error)
            showNftNotification(
                "Error",
                error.message || "Withdrawal transaction failed.",
                "error"
            )
        },
        // add args on call
    })
    const [withdrawTxHash, setWithdrawTxHash] = useState(null)
    const {
        data: withdrawTxReceipt,
        isLoading: isWithdrawTxLoading,
        isSuccess: isWithdrawTxSuccess,
        isError: isWithdrawTxError,
    } = useWaitForTransaction({
        hash: withdrawTxHash,
    })

    // Effect to handle transaction confirmation
    useEffect(() => {
        if (isWithdrawTxLoading) {
            whileWithdrawlNotificationId.current = showNftNotification(
                "Withdrawl",
                "Transaction sent. Awaiting confirmation...",
                "info",
                true
            )
        } else if (isWithdrawTxSuccess) {
            closeNftNotification(whileWithdrawlNotificationId.current)
            showNftNotification("Withdrawal", "Proceeds successfully withdrawn.", "success")
            console.log("Withdraw data", withdrawData, "Withdraw receipt", withdrawTxReceipt)
            refetchProceeds()
        } else if (isWithdrawTxError) {
            closeNftNotification(whileWithdrawlNotificationId.current)
            showNftNotification(
                "Withdrawal",
                error.message || "Withdrawal transaction failed.",
                "error"
            )
        }
    }, [isWithdrawTxSuccess, isWithdrawTxLoading, isWithdrawTxError, refetchProceeds])

    const handleWithdrawProceeds = async () => {
        withdrawlProceedsNotificationId.current = showNftNotification(
            "Check your wallet",
            "Confirm withdrawl...",
            "info",
            true
        )
        await withdrawProceeds()
    }

    // Write contract function to list item
    const confirmListingNotificationId = useRef(null)
    const whileListingNotificationId = useRef(null)

    const { data: listItemData, writeAsync: listItem } = useContractWrite({
        address: marketplaceAddress,
        abi: nftMarketplaceAbi,
        functionName: "listItem",
        onSuccess: (data) => {
            console.log("List Item send: ", data)
            closeNftNotification(confirmListingNotificationId.current)
            setListItemTxHash(data.hash)
        },
        onError: (error) => {
            console.log("List item error: ", error)
            setListing(false)
            if (error.message.includes("User denied transaction signature")) {
                // for user rejected transaction
                showNftNotification(
                    "Transaction Rejected",
                    "You have rejected the transaction.",
                    "error"
                )
            } else {
                // Handle other errors
                showNftNotification("Error", error.message || "Failed to list the NFT.", "error")
            }
            closeNftNotification(confirmListingNotificationId.current)
        },
        // add args on call
    })

    const [listItemTxHash, setListItemTxHash] = useState(null)
    const {
        data: listItemTxReceipt,
        isLoading: isListItemTxLoading,
        isSuccess: isListItemTxSuccess,
        isError: isListItemTxError,
    } = useWaitForTransaction({
        hash: listItemTxHash,
    })

    useEffect(() => {
        if (isListItemTxLoading) {
            whileListingNotificationId.current = showNftNotification(
                "Listing",
                "Transaction sent. Awaiting confirmation...",
                "info",
                true
            )
        } else if (isListItemTxSuccess) {
            setListing(false)
            closeNftNotification(whileListingNotificationId.current)
            showNftNotification("Success", "Item successful listed", "success")
            console.log(
                "Listing item data",
                listItemData,
                "Listing item receipt",
                listItemTxReceipt
            )
            updateAfterListing()
        } else if (isListItemTxError) {
            setListing(false)
            closeNftNotification(whileListingNotificationId.current)
            showNftNotification("Error", error.message || "Failed to list the NFT.", "error")
        }
    }, [isListItemTxLoading, isListItemTxSuccess, isListItemTxError])

    // Raw approve function to allow the marketplace to manage the NFT !!!N why is there no approve in the ABI?
    const useRawApprove = (nftAddress) => {
        const provider = new ethers.providers.Web3Provider(window.ethereum)

        return async (to, tokenId) => {
            const functionSignature = ethers.utils.id("approve(address,uint256)").slice(0, 10)
            const addressPadded = ethers.utils.hexZeroPad(to, 32).slice(2)
            const tokenIdHex = ethers.utils
                .hexZeroPad(ethers.BigNumber.from(tokenId).toHexString(), 32)
                .slice(2)
            const data = functionSignature + addressPadded + tokenIdHex
            const signer = provider.getSigner(address)
            return signer.sendTransaction({
                to: nftAddress,
                data: data,
            })
        }
    }

    // (1) onSubmit event handler for the SellSwapForm component
    // Function to approve the NFT for sale or swap
    const approveAndList = async (data) => {
        // Destructuring the data received from the form
        const { nftAddress, tokenId, price, desiredNftAddress, desiredTokenId } = data

        // (2) Parsing the price to a proper format for blockchain transactions
        const formattedPrice = ethers.utils.parseUnits(price, "ether").toString()

        // (3) Formatting the desired NFT address and token ID for the swap functionality, if provided
        const formattedDesiredNftAddress = desiredNftAddress || ethers.constants.AddressZero
        const formattedDesiredTokenId = desiredTokenId || "0"

        // (4) Initialize notification and set approving state
        let listAndApproveNotificationId
        let whileApprovingNotificationId
        let confirmListNotificationId
        setApproving(true)
        // (5) Showing a notification to the user to check their wallet for approval
        listAndApproveNotificationId = showNftNotification(
            "Check your wallet!",
            "Confirm for approving NFT...",
            "info",
            true
        )
        try {
            // Approving the NFT
            // (6) Executing the raw approve function to permit the marketplace to handle the NFT
            const tx = await useRawApprove(nftAddress)(marketplaceAddress, tokenId)

            closeNftNotification(listAndApproveNotificationId)
            whileApprovingNotificationId = showNftNotification(
                "Approving...",
                "Approving in progress...",
                "info",
                true
            )
            await tx.wait()

            closeNftNotification(whileApprovingNotificationId)
            showNftNotification("Success", "NFT approved", "success")
            confirmListNotificationId = showNftNotification(
                "Check your wallet",
                "Confirm listing...",
                "info",
                true
            )

            // Listing the NFT after approval
            await listItem({
                args: [
                    nftAddress,
                    tokenId,
                    formattedPrice,
                    formattedDesiredNftAddress,
                    formattedDesiredTokenId,
                ],
            })
            closeNftNotification(confirmListNotificationId)
        } catch (error) {
            console.error("Error in approveAndList:", error)
            closeNftNotification(listAndApproveNotificationId)
            if (
                error.message.includes(
                    "User denied transaction signature" || "user rejected transaction"
                )
            ) {
                // for user rejected transaction
                showNftNotification(
                    "Transaction Rejected",
                    "You have rejected the transaction.",
                    "error"
                )
            } else {
                // Handle other errors
                showNftNotification("Error", "Failed to approve and list the NFT.", "error")
            }
            console.error("Error in listing NFT:", error)
        } finally {
            setApproving(false)
        }
    }

    // Setup the UI, checking for any proceeds the user can withdraw
    useEffect(() => {
        if (isConnected && returnedProceeds) {
            // Convert the proceeds from Wei to Ether
            const proceedsInEther = ethers.utils.formatUnits(returnedProceeds.toString(), "ether")
            setProceeds(proceedsInEther)
        }
    }, [isConnected, returnedProceeds, address])

    useEffect(() => {
        refetchProceeds()
    }, [refetchProceeds])

    return (
        <div className={styles.nftSellSwapContainer}>
            <div className={styles.nftSellSwapButton}>
                <button onClick={() => setActiveForm("sell")}>SELL</button>
                <button onClick={() => setActiveForm("swap")}>SWAP</button>
            </div>
            <div className={styles.nftSellSwapWrapper}>
                <div className={styles.nftSellSwapWrapper}>
                    {activeForm === "sell" && (
                        <SellSwapForm
                            onSubmit={approveAndList}
                            title="Sell your NFT!"
                            id="Sell Form"
                            defaultNftAddress={nftAddressFromQuery}
                            defaultTokenId={tokenIdFromQuery}
                            defaultPrice={priceFromQuery}
                        />
                    )}
                    {activeForm === "swap" && (
                        <SellSwapForm
                            onSubmit={approveAndList}
                            title="Swap your NFT!"
                            id="Swap Form"
                            defaultNftAddress={nftAddressFromQuery}
                            defaultTokenId={tokenIdFromQuery}
                            defaultPrice={priceFromQuery}
                            extraFields={[
                                {
                                    name: "Desired NFT Address",
                                    type: "text",
                                    key: "desiredNftAddress",
                                    placeholder: "0x0000000000000000000000000000000000000000",
                                },
                                {
                                    name: "Desired Token ID",
                                    type: "number",
                                    key: "desiredTokenId",
                                    placeholder: "0",
                                },
                            ]}
                        />
                    )}
                </div>
                <div className={styles.nftWithdrawWrapper}>
                    <div className={styles.nftWithdraw}>
                        <div>
                            <h2>Important note for users:</h2>
                        </div>
                        <div className={styles.nftWithdrawInformation}>
                            <p>
                                When selling or exchanging NFTs on our platform, it is important
                                that you are clear about the withdrawal process of your proceeds.
                                After a successful sale or exchange, your proceeds will be credited
                                to your account in Ether. To access these funds you will need to
                                make a manual withdrawal. Please remember to withdraw your proceeds
                                regularly to ensure your funds remain safe and accessible. This
                                step is crucial to maintaining full control of your earned funds.
                                If you need help or further information, do not hesitate to contact
                                our support.
                            </p>
                        </div>
                        <div className={styles.nftCreditInformationWrapper}>
                            <div className={styles.nftCreditInformation}>
                                <h3>Your credit:</h3>
                                {isLoadingProceeds ? (
                                    <div>Processing</div>
                                ) : (
                                    <div>{proceeds} ETH</div>
                                )}
                            </div>
                        </div>
                        <div className={styles.nftWithdrawButton}>
                            {proceeds !== "0" ? (
                                <button
                                    name="Withdraw"
                                    type="button"
                                    onClick={() => {
                                        handleWithdrawProceeds()
                                    }}
                                >
                                    WITHDRAW
                                </button>
                            ) : (
                                <div>
                                    <div>No proceeds detected</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SellSwapNFT
