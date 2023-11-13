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

export default function Home() {
    const router = useRouter()
    const { chainId, account, isWeb3Enabled } = useMoralis()
    const { runContractFunction } = useWeb3Contract()

    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]

    const [nftAddressFromQuery, setNftAddressFromQuery] = useState("")
    const [tokenIdFromQuery, setTokenIdFromQuery] = useState("")
    const [activeForm, setActiveForm] = useState("sell")
    const [proceeds, setProceeds] = useState("0")

    const { nftNotifications, showNftNotification, closeNftNotification } = useNftNotification()

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
        const nftAddress = data.nftAddress
        const tokenId = data.tokenId
        const price = ethers.utils.parseUnits(data.price, "ether").toString()
        let listAndApproveNotificationId

        try {
            listAndApproveNotificationId = showNftNotification(
                "Listing",
                "Aprove and List NFT...",
                "info",
                true
            )
            const tx = await useRawApprove(nftAddress)(marketplaceAddress, tokenId)
            await handleApproveSuccess(tx, nftAddress, tokenId, price)
        } catch (error) {
            console.error("Error in approveAndList:", error)
            closeNftNotification(listAndApproveNotificationId)
            showNftNotification("Error", "Failed to approve and list the NFT.", "error")
        } finally {
            setTimeout(() => {
                router.reload("/my-nft")
            }, 6000)
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
    const handleApproveSuccess = async (tx, nftAddress, tokenId, price) => {
        await tx.wait()
        const listOptions = {
            abi: nftMarketplaceAbi,
            contractAddress: marketplaceAddress,
            functionName: "listItem",
            params: {
                nftAddress: nftAddress,
                tokenId: tokenId,
                price: price,
                desiredNftAddress: "0x0000000000000000000000000000000000000000",
                desiredTokenId: "0",
            },
        }

        await runContractFunction({
            params: listOptions,
            onSuccess: handleListSuccess,
            onError: (error) => console.log(error),
        })
    }

    // Notify the user when the NFT is successfully listed
    const handleListSuccess = async () => {
        showNftNotification("NFT listing", "NFT listing process...", "info", true)
        setTimeout(() => {
            router.push("/my-nft")
        }, 6000)
    }

    // Notify the user when proceeds are successfully withdrawn
    const handleWithdrawSuccess = () => {
        showNftNotification("Withdrawl", "Withdrawing proceeds", "success")
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
        setupUI()
    }, [proceeds, account, isWeb3Enabled, chainId])

    return (
        <div className={styles.nftSellSwapContainer}>
            <div className={styles.nftSellSwapButton}>
                <Button onClick={() => setActiveForm("sell")} text="Sell" />
                <Button onClick={() => setActiveForm("swap")} text="Swap" />
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
                                    placeholder: "1",
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
                                    text="Withdraw"
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
