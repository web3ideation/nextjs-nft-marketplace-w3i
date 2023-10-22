import styles from "../styles/Home.module.css"
import { useNotification, Button } from "web3uikit"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { ethers } from "ethers"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"
import networkMapping from "../constants/networkMapping.json"
import { useEffect, useState } from "react"
import SellSwapForm from "../components/SellSwapForm"
import { useRouter } from "next/router"

export default function Home() {
    const router = useRouter()
    const [nftAddressFromQuery, setNftAddressFromQuery] = useState("")
    const [tokenIdFromQuery, setTokenIdFromQuery] = useState("")
    const { chainId, account, isWeb3Enabled } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]
    const [activeForm, setActiveForm] = useState(null)
    const dispatch = useNotification()
    const [proceeds, setProceeds] = useState("0")

    useEffect(() => {
        if (router.query.nftAddress) {
            setNftAddressFromQuery(router.query.nftAddress)
        }
        if (router.query.tokenId) {
            setTokenIdFromQuery(router.query.tokenId)
        }
    }, [router.query])

    const { runContractFunction } = useWeb3Contract()

    function useRawApprove(nftAddress) {
        // !!!W this function shouldnt be in a function!
        const provider = new ethers.providers.Web3Provider(window.ethereum)

        const rawApprove = async (to, tokenId) => {
            try {
                // Calculate the function signature for "approve(address,uint256)"
                const functionSignature = ethers.utils.id("approve(address,uint256)").slice(0, 10)

                // Convert the parameters to the required format
                const addressPadded = ethers.utils.hexZeroPad(to, 32).slice(2)
                const tokenIdHex = ethers.utils
                    .hexZeroPad(ethers.BigNumber.from(tokenId).toHexString(), 32)
                    .slice(2)

                // Construct the data for the raw call
                const data = functionSignature + addressPadded + tokenIdHex

                // Get the signer from the provider
                const signer = provider.getSigner()

                // Send the transaction using the signer
                const tx = await signer.sendTransaction({
                    to: nftAddress,
                    data: data,
                })

                return tx
            } catch (error) {
                console.error("Error sending raw approve transaction:", error)
                throw error
            }
        }

        return rawApprove
    }

    // !!! when the user wants to sell an nft that is not theirs, example: entering a wrong tokenId and klick submit, nothing happens. But when you check the browser console, you see that actually an error has been thrown, that the user is not approved. So this error message should also be visible to the user in the frontend.

    async function approveAndList(data) {
        console.log("Approving...")
        const nftAddress = data.data[0].inputResult
        const tokenId = data.data[1].inputResult
        const price = ethers.utils.parseUnits(data.data[2].inputResult, "ether").toString()

        const rawApprove = useRawApprove(nftAddress)

        try {
            const tx = await rawApprove(marketplaceAddress, tokenId)

            // If rawApprove completes without errors, call handleApproveSuccess
            handleApproveSuccess(tx, nftAddress, tokenId, price)
        } catch (error) {
            console.error("Error in approveAndList:", error) // !!!W does this error has to have a different format? like "NftMarketplace__blablabla" ?
        }
    }

    async function handleApproveSuccess(tx, nftAddress, tokenId, price) {
        // !!!W also dispatch a notification here like:
        // dispatch({
        //   type: "success",
        //   message: "Approval",
        //   title: "Marketplace approved",
        //   position: "topR",
        // })

        await tx.wait()
        console.log("Ok! Now time to list")
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
            onSuccess: () => handleListSuccess(), // !!!W this gets triggert before the tx is mined, so the notification is a bit early
            onError: (error) => console.log(error),
        })
    }

    async function handleListSuccess() {
        dispatch({
            type: "success",
            message: "NFT listing",
            title: "NFT listed",
            position: "topR",
        })
    }

    const handleWithdrawSuccess = () => {
        dispatch({
            type: "success",
            message: "Withdrawing proceeds",
            position: "topR",
        })
    }

    async function setupUI() {
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
        <>
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
                                    inputWidth: "100%",
                                    key: "desiredNftAddress",
                                    validation: {
                                        regExp: /^0x[0-9a-fA-F]{40}$/,
                                        regExpInvalidMessage:
                                            "Please enter a valid Ethereum address.",
                                        required: true,
                                    },
                                },
                                {
                                    name: "Desired Token ID",
                                    type: "number",
                                    inputWidth: "100%",
                                    key: "desiredTokenId",
                                    validation: {
                                        regExp: /^[0-9]\d*$/,
                                        regExpInvalidMessage:
                                            "Please enter a positive integer or zero.",
                                        required: true,
                                    },
                                },
                            ]}
                        />
                    )}
                </div>
                <div>
                    <div className="flex flex-row justify-center">
                        <div>Withdraw {proceeds} proceeds</div>
                    </div>
                    {proceeds != "0" ? (
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
                                    onSuccess: () => handleWithdrawSuccess,
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
        </>
    )
}
