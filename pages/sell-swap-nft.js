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
            // @ Niklas: I only commented this to check if the name and symbol are fetched correctly, you can uncomment it again
            // } finally {
            //     setTimeout(() => {
            //         router.reload("/my-nft")
            //     }, 6000)
        }
        // !!! the following lines can be deleted once the name and symbol are implemented in the database
        try {
            const fetchNftName = useRawName(nftAddress)
            await fetchNftName() // This will print the name to the console

            const fetchNftSymbol = useRawSymbol(nftAddress)
            await fetchNftSymbol() // This will print the symbol to the console
        } catch (error) {
            console.error("Error fetching NFT name/symbol:", error)
            // You might want to handle this error appropriately
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
    // Raw name and symbol function to fetch the NFT name and symbol

    const useRawName = (nftAddress) => {
        const provider = new ethers.providers.Web3Provider(window.ethereum)

        return async () => {
            const functionSignature = ethers.utils.id("name()").slice(0, 10)
            const signer = provider.getSigner()
            const response = await signer.call({
                to: nftAddress,
                data: functionSignature,
            })

            // Decode the response
            const decodedResponse = ethers.utils.defaultAbiCoder.decode(["string"], response)
            const nftName = decodedResponse[0]
            console.log(nftName) // !!! this line can be deleted once the name and symbol are implemented in the database
            return nftName
        }
    }

    const useRawSymbol = (nftAddress) => {
        const provider = new ethers.providers.Web3Provider(window.ethereum)

        return async () => {
            const functionSignature = ethers.utils.id("symbol()").slice(0, 10)
            const signer = provider.getSigner()
            const response = await signer.call({
                to: nftAddress,
                data: functionSignature,
            })

            // Decode the response
            const decodedResponse = ethers.utils.defaultAbiCoder.decode(["string"], response)
            const nftSymbol = decodedResponse[0]
            console.log(nftSymbol) // !!! this line can be deleted once the name and symbol are implemented in the database
            return nftSymbol
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
                    <div>Withdraw {proceeds} Ether proceeds</div>
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
