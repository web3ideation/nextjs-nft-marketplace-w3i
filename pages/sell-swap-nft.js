import styles from "../styles/Home.module.css"
import { useNotification, Button } from "web3uikit"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { ethers } from "ethers"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"
import networkMapping from "../constants/networkMapping.json"
import { useEffect, useState } from "react"
import SellSwapForm from "../components/SellSwapForm"

function useRawApprove() {
    // !!!W this function shouldnt be in a function!
    const provider = new ethers.providers.Web3Provider(window.ethereum)

    return async (to, tokenId) => {
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
}

export default function Home() {
    const { chainId, account, isWeb3Enabled } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]
    const dispatch = useNotification()
    const [proceeds, setProceeds] = useState("0")

    const { runContractFunction } = useWeb3Contract()

    const rawApprove = useRawApprove()

    // !!! when the user wants to sell an nft that is not theirs, example: entering a wrong tokenId and klick submit, nothing happens. But when you check the browser console, you see that actually an error has been thrown, that the user is not approved. So this error message should also be visible to the user in the frontend.

    async function approveAndList(data) {
        console.log("Approving...")
        const { nftAddress, tokenId, price } = data.data

        try {
            const tx = await rawApprove(marketplaceAddress, tokenId)
            // If rawApprove completes without errors, call handleApproveSuccess
            handleApproveSuccess(tx, nftAddress, tokenId, price)
        } catch (error) {
            console.error("Error in approveAndList:", error) // !!!W does this error has to have a different format? like "NftMarketplace__blablabla" ?
            dispatch({ type: "error", message: error.message, position: "topR" }) // Display the error to the user
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
                <SellSwapForm onSubmit={approveAndList} title="Sell your NFT!" id="Sell Form" />
                <SellSwapForm
                    onSubmit={approveAndList}
                    title="Swap your NFT!"
                    id="Swap Form"
                    extraFields={[
                        {
                            name: "Desired NFT-Address",
                            type: "text",
                            inputWidth: "100%",
                            value: "",
                            key: "desiredNftAddress",
                            validation: {
                                regExp: /^0x[0-9a-fA-F]{40}$/,
                                regExpInvalidMessage: "Please enter a valid Ethereum address.",
                            },
                        },
                    ]}
                />
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
        </>
    )
}
