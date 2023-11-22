import styles from "../styles/Home.module.css"
import { Button } from "web3uikit"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { ethers } from "ethers"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"
import networkMapping from "../constants/networkMapping.json"
import { useNftNotification } from "../context/NFTNotificationContext"
import { useEffect, useState } from "react"
import SellSwapForm from "../components/SellSwapForm"
import { useRouter } from "next/router"

const SellSwapNFT = () => {
    const router = useRouter()
    const { chainId, account, isWeb3Enabled } = useMoralis()
    const { runContractFunction } = useWeb3Contract()

    // Determine the current chain and marketplace address
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]

    // State variables
    const [nftAddressFromQuery, setNftAddressFromQuery] = useState(router.query.nftAddress || "")
    const [tokenIdFromQuery, setTokenIdFromQuery] = useState(router.query.tokenId || "")

    const [activeForm, setActiveForm] = useState("sell")
    const [proceeds, setProceeds] = useState("0")

    const { showNftNotification, closeNftNotification } = useNftNotification()

    // Update NFT address and token ID from the router query
    useEffect(() => {
        if (router.query.nftAddress) {
            setNftAddressFromQuery(router.query.nftAddress)
        }
        if (router.query.tokenId) {
            setTokenIdFromQuery(router.query.tokenId)
        }
    }, [router.query])

    // Function to approve the NFT for sale or swap
    const approveAndList = async (data) => {
        const { nftAddress, tokenId, price, desiredNftAddress, desiredTokenId } = data
        const formattedPrice = ethers.utils.parseUnits(price, "ether").toString()
        const formattedDesiredNftAddress =
            desiredNftAddress || "0x0000000000000000000000000000000000000000"
        const formattedDesiredTokenId = desiredTokenId || "0"
        let listAndApproveNotificationId

        try {
            listAndApproveNotificationId = showNftNotification(
                "Listing",
                "Approving NFT...",
                "info",
                true
            )
            const tx = await useRawApprove(nftAddress)(marketplaceAddress, tokenId)
            await handleApproveSuccess(
                tx,
                nftAddress,
                tokenId,
                formattedPrice,
                formattedDesiredNftAddress,
                formattedDesiredTokenId,
                listAndApproveNotificationId
            )
        } catch (error) {
            console.error("Error in approveAndList:", error)
            closeNftNotification(listAndApproveNotificationId)
            showNftNotification("Error", "Failed to approve and list the NFT.", "error")
        }
    }

    // Raw approve function to allow the marketplace to manage the NFT
    const useRawApprove = (nftAddress) => {
        const provider = new ethers.providers.Web3Provider(window.ethereum)

        return async (to, tokenId) => {
            const functionSignature = ethers.utils.id("approve(address,uint256)").slice(0, 10)
            const addressPadded = ethers.utils.hexZeroPad(to, 32).slice(2)
            const tokenIdHex = ethers.utils
                .hexZeroPad(ethers.BigNumber.from(tokenId).toHexString(), 32)
                .slice(2)
            const data = functionSignature + addressPadded + tokenIdHex
            const signer = provider.getSigner()
            return signer.sendTransaction({
                to: nftAddress,
                data: data,
            })
        }
    }

    // Handle the approval success and list the NFT for sale or swap
    const handleApproveSuccess = async (
        tx,
        nftAddress,
        tokenId,
        price,
        desiredNftAddress,
        desiredTokenId,
        previousNotificationId
    ) => {
        await tx.wait()
        closeNftNotification(previousNotificationId)
        // Show notification for starting the listing process
        const listNotificationId = showNftNotification(
            "Check your Wallet",
            "Confirm listing...",
            "info",
            true
        )
        const listOptions = {
            abi: nftMarketplaceAbi,
            contractAddress: marketplaceAddress,
            functionName: "listItem",
            params: {
                nftAddress,
                tokenId,
                price,
                desiredNftAddress,
                desiredTokenId,
            },
        }

        await runContractFunction({
            params: listOptions,
            onSuccess: () => handleListSuccess(listNotificationId),
            onError: (error) => console.log(error),
        })
    }

    // Notify the user when the NFT is successfully listed
    const handleListSuccess = async (previousNotificationId) => {
        closeNftNotification(previousNotificationId)
        showNftNotification("NFT Listed", "Your NFT has been successfully listed.", "success")
        // Set a timeout for 5 seconds before redirecting
        setTimeout(() => {
            router.push("/my-nft")
        }, 5000)
    }

    // Notify the user when proceeds are successfully withdrawn
    const handleWithdrawSuccess = () => {
        showNftNotification("Withdrawal", "Proceeds successfully withdrawn.", "success")
    }

    // Setup the UI, checking for any proceeds the user can withdraw
    const setupUI = async () => {
        const returnedProceeds = await runContractFunction({
            params: {
                abi: nftMarketplaceAbi,
                contractAddress: marketplaceAddress,
                functionName: "getProceeds",
                params: {
                    seller: account,
                },
            },
            onError: (error) => console.log(error),
        })

        if (returnedProceeds) {
            // Convert the proceeds from Wei to Ether
            const proceedsInEther = ethers.utils.formatUnits(returnedProceeds.toString(), "ether")
            setProceeds(proceedsInEther)
        }
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            setupUI()
        }
    }, [proceeds, account, isWeb3Enabled, chainId])
    return (
        <div className={styles.nftSellSwapContainer}>
            <div className={styles.nftSellSwapButton}>
                <Button onClick={() => setActiveForm("sell")} text="SELL" />
                <Button onClick={() => setActiveForm("swap")} text="SWAP" />
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
                        />
                    )}
                    {activeForm === "swap" && (
                        <SellSwapForm
                            onSubmit={approveAndList}
                            title="Swap your NFT!"
                            id="Swap Form"
                            defaultNftAddress={nftAddressFromQuery}
                            defaultTokenId={tokenIdFromQuery}
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
                                <div>{proceeds} ETH</div>
                            </div>
                        </div>
                        <div className={styles.nftWithdrawButton}>
                            {proceeds !== "0" ? (
                                <Button
                                    name="Withdraw"
                                    type="button"
                                    text="WITHDRAW"
                                    onClick={() => {
                                        runContractFunction({
                                            params: {
                                                abi: nftMarketplaceAbi,
                                                contractAddress: marketplaceAddress,
                                                functionName: "withdrawProceeds",
                                                params: {},
                                            },
                                            onError: (error) => console.log(error),
                                            onSuccess: handleWithdrawSuccess,
                                        })
                                    }}
                                />
                            ) : (
                                <div className="flex flex-row justify-center">
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
