import React, { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useAccount, usePublicClient } from "wagmi"
import { useGetProceeds } from "../hooks/index"
import { useWithdrawProceeds } from "../hooks/index"
import { fetchEthToEurRate } from "@utils/fetchEthToEurRate"
import networkMapping from "@constants/networkMapping.json"
import { useModal } from "@context/ModalProvider"
import ConnectWalletBtn from "@components/Btn/ConnectWalletBtn/ConnectWalletBtn"
import BtnWithAction from "@components/Btn/BtnWithAction"
import styles from "@styles/Home.module.scss"

const WithdrawProceeds = () => {
    const [initialized, setInitialized] = useState(false)
    const provider = usePublicClient()
    const chainId = provider.chains[0]
    const chainString = chainId.id ? parseInt(chainId.id).toString() : "31337"
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]
    const { openModal, modalContent } = useModal()
    const { address: userAddress, isConnected } = useAccount()

    const [proceeds, setProceeds] = useState("0.0")
    const [proceedsInEur, setProceedsInEur] = useState("0.0")

    const { returnedProceeds, isLoadingProceeds, errorLoadingProceeds, proceedsStatus, refetchProceeds } =
        useGetProceeds(marketplaceAddress, userAddress)

    const handleWithdrawSuccess = () => {
        openModal("withdrawn")
    }

    const { handleWithdrawProceeds, isTxSuccess } = useWithdrawProceeds(marketplaceAddress, proceeds, refetchProceeds)

    useEffect(() => {
        if (userAddress) {
            refetchProceeds()
        }
    }, [userAddress, refetchProceeds])

    useEffect(() => {
        if (returnedProceeds) {
            const proceedsInEther = ethers.utils.formatUnits(returnedProceeds.toString(), "ether")
            setProceeds(proceedsInEther)
        } else {
            setProceeds("0.0")
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
        setInitialized(true)
    }, [initialized])

    if (!initialized) return null

    return (
        <div className={styles.withdrawProceedsContainer}>
            <div className={styles.withdrawProceeds}>
                <div className={styles.withdrawProceedsTitle}>
                    <h3>Important note for users:</h3>
                </div>
                <div className={styles.withdrawProceedsInformation}>
                    <p>
                        When selling or exchanging NFTs on our platform, it is important that you are clear about the
                        withdrawal process of your proceeds. After a successful sale or exchange, your proceeds will be
                        credited to your account in Ether (ETH). To access these funds, you will need to make a manual
                        withdrawal, and please note that the withdrawal will be conducted only in ETH. Additionally, be
                        aware that withdrawing funds will incur gas fees, which are required for processing the
                        transaction on the Ethereum network. These fees vary based on network congestion. Therefore, we
                        recommend planning your withdrawals accordingly. Please remember to withdraw your proceeds
                        regularly to ensure your funds remain safe and accessible. This step is crucial to maintaining
                        full control of your earned funds. If you need help or further information, do not hesitate to
                        contact our support.
                    </p>
                </div>
                {!isConnected ? (
                    <div>
                        Connect Wallet to show proceeds
                        <ConnectWalletBtn />
                    </div>
                ) : (
                    <>
                        <div className={styles.proceedsInformationWrapper}>
                            <div className={styles.proceedsInformation}>
                                <h4>Your credit:</h4>
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
                            {isConnected && proceeds !== "0.0" ? (
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

export default WithdrawProceeds
