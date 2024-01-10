// React Imports
import { useEffect, useState } from "react"
import { useRouter } from "next/router"

// Ethereum and Smart Contract Interaction
import { ethers } from "ethers"
import { useAccount, usePublicClient } from "wagmi"

// User-Created Hooks and Components
import SellSwapForm from "../components/Main/SellSwapForm/SellSwapForm"
import { useNFT } from "../context/NFTDataProvider"
import { useGetProceeds } from "../hooks/useGetProceeds"
import { useWithdrawProceeds } from "../hooks/useWithdrawProceeds"
import { useRawApprove } from "../hooks/useRawApprove"
import { useListItem } from "../hooks/useListItem"
import networkMapping from "../constants/networkMapping.json"
import LoadingWave from "../components/Main/ux/LoadingWave"

// Styles
import styles from "../styles/Home.module.css"

const SellSwapNFT = () => {
    // -------------------- Web3 Elements ---------------------
    const router = useRouter()
    const provider = usePublicClient()
    const chainId = provider.chains[0]
    const chainString = chainId.id ? parseInt(chainId.id).toString() : "31337"
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]
    const { address: userAdress, isConnected } = useAccount()

    // ------------------- Custom Hooks -------------------
    const { reloadNFTs } = useNFT()

    // ------------------- State Management -------------------
    const [nftAddressFromQuery, setNftAddressFromQuery] = useState(router.query.nftAddress || "")
    const [tokenIdFromQuery, setTokenIdFromQuery] = useState(router.query.tokenId || "")
    const [priceFromQuery, setPriceFromQuery] = useState(router.query.price || "")
    const [activeForm, setActiveForm] = useState("sell")
    const [proceeds, setProceeds] = useState("0.0")
    const [formData, setFormData] = useState({
        nftAddress: "",
        tokenId: "",
        price: "",
        desiredNftAddress: "",
        desiredTokenId: "",
    })

    // Update NFT address and token ID from the router query
    useEffect(() => {
        setNftAddressFromQuery(router.query.nftAddress)
        setTokenIdFromQuery(router.query.tokenId)
        setPriceFromQuery(router.query.price)
    }, [router.query])

    // Update NFT address, token ID, and price from the router query
    useEffect(() => {
        const { nftAddress, tokenId, price } = router.query
        setFormData({
            ...formData,
            nftAddress: nftAddress || "",
            tokenId: tokenId || "",
            price: price || "",
        })
    }, [router.query])

    const handleWithdrawCompletion = () => {
        refetchProceeds()
    }

    const handleTransactionCompletion = () => {
        reloadNFTs()

        setTimeout(() => {
            router.push("/my-nft")
        }, 2000)
    }

    const handleApproveCompletion = () => {
        handleListItem()
    }

    // Funktion zum Aktualisieren der Formulardaten
    const updateFormData = (newFormData) => {
        setFormData(newFormData)
    }

    // ------------------ Contract Functions ------------------
    // Function hook to get proceeds
    const {
        returnedProceeds,
        isLoadingProceeds,
        errorLoadingProceeds,
        proceedsStatus,
        refetchProceeds,
    } = useGetProceeds(marketplaceAddress, userAdress)
    console.log("Proceeds status", proceedsStatus)

    //Function hook to withdraw proceeds
    const { handleWithdrawProceeds, isWithdrawTxSuccess } = useWithdrawProceeds(
        marketplaceAddress,
        isConnected,
        handleWithdrawCompletion
    )

    //Function hook to approve an Item for the marketplace
    const { handleApproveItem, isApprovingTxSuccess } = useRawApprove(
        formData.nftAddress,
        marketplaceAddress,
        formData.tokenId,
        isConnected,
        handleApproveCompletion
    )
    //Function hook to list an item on the marketplace
    const { handleListItem } = useListItem(
        marketplaceAddress,
        formData.nftAddress,
        formData.tokenId,
        formData.price,
        formData.desiredNftAddress,
        formData.desiredTokenId,
        handleTransactionCompletion
    )

    // Function to handle form submission
    const handleFormSubmit = (newFormData) => {
        console.log("Form Data Received: ", newFormData)
        updateFormData(newFormData)

        const { nftAddress, tokenId, price, desiredNftAddress, desiredTokenId } = newFormData

        const formattedPrice = ethers.utils.parseUnits(price, "ether").toString() // Add any other data formatting here
        const formattedDesiredNftAddress = desiredNftAddress || ethers.constants.AddressZero
        const formattedDesiredTokenId = desiredTokenId || "0"

        const updatedFormData = {
            ...newFormData,
            price: formattedPrice,
            desiredNftAddress: formattedDesiredNftAddress,
            desiredTokenId: formattedDesiredTokenId,
        }
        setFormData(updatedFormData)
        approveAndList(updatedFormData)
    }

    // Function to approve the NFT for sale or swap
    const approveAndList = async (formData) => {
        console.log("Starting approveAndList with data:", formData)
        try {
            // Aufrufen der rawApprove Funktion
            await handleApproveItem()

            if (isApprovingTxSuccess) {
                await handleListItem()
            } else {
                console.error("No transaction receipt from approve.")
            }
        } catch (error) {
            console.error("An error occurred during the transaction: ", error)
        }
    }

    // Setup the UI, checking for any proceeds the user can withdraw
    useEffect(() => {
        if (isConnected || returnedProceeds || userAdress) {
            // Convert the proceeds from Wei to Ether
            const proceedsInEther = ethers.utils.formatUnits(returnedProceeds.toString(), "ether")
            setProceeds(proceedsInEther)
        }
    }, [isConnected, returnedProceeds, userAdress])

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
                            onSubmit={handleFormSubmit}
                            title="Sell your NFT!"
                            id="Sell Form"
                            defaultNftAddress={nftAddressFromQuery}
                            defaultTokenId={tokenIdFromQuery}
                            defaultPrice={priceFromQuery}
                        />
                    )}
                    {activeForm === "swap" && (
                        <SellSwapForm
                            onSubmit={handleFormSubmit}
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
                                    <div>Processing...</div>
                                ) : (
                                    <div>{proceeds} ETH</div>
                                )}
                            </div>
                        </div>
                        <div className={styles.nftWithdrawButton}>
                            {proceeds !== "0.0" ? (
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
