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
    const [activeForm, setActiveForm] = useState(null)
    const [proceeds, setProceeds] = useState("0")

    const { nftNotifications, showNftNotification, clearNftNotification } = useNftNotification()

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
        showNftNotification("Listing", "Aprove and List NFT...", "info", 0, true)
        try {
            const tx = await useRawApprove(nftAddress)(marketplaceAddress, tokenId)
            await handleApproveSuccess(tx, nftAddress, tokenId, price)
        } catch (error) {
            console.error("Error in approveAndList:", error)
            showNftNotification("Error", "Failed to approve and list the NFT.", "error", 6000)
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
    const handleListSuccess = () => {
        showNftNotification("NFT listing", "NFT listing process...", "info", 0, true)
        // Reload the page after a short delay to show the notification
        setTimeout(() => {
            router.reload()
        }, 6000)
    }

    // Notify the user when proceeds are successfully withdrawn
    const handleWithdrawSuccess = () => {
        showNftNotification("Withdrawl", "Withdrawing proceeds", "success", 6000)
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
            setProceeds(returnedProceeds.toString())
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
            <div>
                <div className="flex flex-row justify-center">
                    <div>Withdraw {proceeds} proceeds</div>
                </div>
                {proceeds !== "0" ? (
                    <Button
                        name="Withdraw"
                        type="button"
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
    )
}
