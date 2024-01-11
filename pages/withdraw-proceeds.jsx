// React Imports
import { useEffect, useState } from "react"
import { useRouter } from "next/router"

// Ethereum and Smart Contract Interaction
import { ethers } from "ethers"
import { useAccount, usePublicClient } from "wagmi"

// User-Created Hooks and Components

import { useGetProceeds } from "../hooks/useGetProceeds"
import { useWithdrawProceeds } from "../hooks/useWithdrawProceeds"

import networkMapping from "../constants/networkMapping.json"

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

    // ------------------- State Management -------------------
    const [proceeds, setProceeds] = useState("0.0")

    // ------------------ Contract Functions ------------------

    const handleWithdrawCompletion = () => {
        refetchProceeds()
    }

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

    console.log("Withdraw ", isWithdrawTxSuccess)
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
            <div className={styles.nftWithdrawWrapper}>
                <div className={styles.nftWithdraw}>
                    <div>
                        <h2>Important note for users:</h2>
                    </div>
                    <div className={styles.nftWithdrawInformation}>
                        <p>
                            When selling or exchanging NFTs on our platform, it is important that
                            you are clear about the withdrawal process of your proceeds. After a
                            successful sale or exchange, your proceeds will be credited to your
                            account in Ether. To access these funds you will need to make a manual
                            withdrawal. Please remember to withdraw your proceeds regularly to
                            ensure your funds remain safe and accessible. This step is crucial to
                            maintaining full control of your earned funds. If you need help or
                            further information, do not hesitate to contact our support.
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
    )
}

export default SellSwapNFT
