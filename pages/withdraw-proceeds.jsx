// React Imports
import React, { useEffect, useState } from "react"

// Ethereum and Smart Contract Interaction
import { ethers } from "ethers"
import { useAccount, usePublicClient } from "wagmi"
import { useWeb3Modal } from "@web3modal/wagmi/react"

// User-Created Hooks and Components
import { useGetProceeds } from "@hooks/useGetProceeds"
import { useWithdrawProceeds } from "@hooks/useWithdrawProceeds"
import { fetchEthToEurRate } from "@utils/fetchEthToEurRate"
import networkMapping from "@constants/networkMapping.json"

import ConnectWalletBtn from "@components/Header/WalletConnect/ConnectWalletButton/ConnectWalletBtn"
import BtnWithAction from "@components/UI/BtnWithAction"

// Styles
import styles from "@styles/Home.module.scss"

const SellSwapNFT = () => {
    // -------------------- Web3 Elements ---------------------
    const [isClient, setIsClient] = useState(false)
    const [initialized, setInitialized] = useState(false)
    const provider = usePublicClient()
    const { open } = useWeb3Modal()
    const chainId = provider.chains[0]
    const chainString = chainId.id ? parseInt(chainId.id).toString() : "31337"
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]
    const { address: userAdress, isConnected } = useAccount()

    // ------------------- State Management -------------------
    const [proceeds, setProceeds] = useState("0.0")
    const [proceedsInEur, setProceedsInEur] = useState("0.0")

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

    //Function hook to withdraw proceeds
    const { handleWithdrawProceeds, isWithdrawTxSuccess } = useWithdrawProceeds(
        marketplaceAddress,
        isConnected,
        handleWithdrawCompletion
    )

    // Setup the UI, checking for any proceeds the user can withdraw
    useEffect(() => {
        if (returnedProceeds) {
            // Convert the proceeds from Wei to Ether
            const proceedsInEther = ethers.utils.formatUnits(returnedProceeds.toString(), "ether")
            setProceeds(proceedsInEther)
        }
    }, [returnedProceeds])

    useEffect(() => {
        const updatePriceInEur = async () => {
            const ethToEurRate = await fetchEthToEurRate()
            if (ethToEurRate) {
                setProceedsInEur(proceeds * ethToEurRate)
            }
        }
        updatePriceInEur()
    }, [proceeds])

    useEffect(() => {
        setIsClient(typeof window !== "undefined")
        setInitialized(true)
    }, [])

    if (!initialized) return null

    return (
        <div className={styles.withdrawProceedsContainer}>
            <div className={styles.withdrawProceeds}>
                <div className={styles.withdrawProceedsTitle}>
                    <h2>Important note for users:</h2>
                </div>
                <div className={styles.withdrawProceedsInformation}>
                    <p>
                        When selling or exchanging NFTs on our platform, it is important that you
                        are clear about the withdrawal process of your proceeds. After a successful
                        sale or exchange, your proceeds will be credited to your account in Ether
                        (ETH). To access these funds, you will need to make a manual withdrawal,
                        and please note that the withdrawal will be conducted only in ETH.
                        Additionally, be aware that withdrawing funds will incur gas fees, which
                        are required for processing the transaction on the Ethereum network. These
                        fees vary based on network congestion. Therefore, we recommend planning
                        your withdrawals accordingly. Please remember to withdraw your proceeds
                        regularly to ensure your funds remain safe and accessible. This step is
                        crucial to maintaining full control of your earned funds. If you need help
                        or further information, do not hesitate to contact our support.
                    </p>
                </div>
                {!isConnected ? (
                    <div>
                        Connect Wallet to show proceeds
                        <ConnectWalletBtn onConnect={() => open()} isClient={isClient} />
                    </div>
                ) : (
                    <>
                        <div className={styles.proceedsInformationWrapper}>
                            <div className={styles.proceedsInformation}>
                                <h3>Your credit:</h3>
                                {isLoadingProceeds ? (
                                    <div>Processing...</div>
                                ) : errorLoadingProceeds ? (
                                    <div>Error loading proceeds. Please try again later.</div>
                                ) : (
                                    <div className={styles.proceeds}>
                                        <div>{proceeds} ETH</div>
                                        <div>{proceedsInEur} €</div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={styles.withdrawProceedsBtn}>
                            {isConnected & (proceeds !== "0.0") ? (
                                <BtnWithAction
                                    buttonText={"Withdraw"}
                                    onClickAction={() => {
                                        handleWithdrawProceeds()
                                    }}
                                    type="button"
                                />
                            ) : (
                                <div>
                                    <div>No proceeds detected</div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default SellSwapNFT
