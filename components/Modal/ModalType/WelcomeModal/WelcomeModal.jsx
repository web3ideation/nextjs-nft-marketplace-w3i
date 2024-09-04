import React from "react"
import Link from "next/link"
import { useWeb3Modal } from "@web3modal/wagmi/react"
import { useAccount } from "wagmi"
import { useModal } from "@context/ModalProvider"

import SellSwapInformation from "@components/SellSwapActionForm/SellSwapInformation/SellSwapInformation"

import Modal from "@components/Modal/ModalBasis/Modal"

import styles from "./WelcomeModal.module.scss"

const WelcomeModal = () => {
    const { open } = useWeb3Modal()
    const { isConnected } = useAccount()
    const { closeModal, currentModalId } = useModal()

    const buttons = [
        !isConnected && {
            text: "Connect your Wallet here",
            action: () => open(),
        },
        {
            text: "Close",
            action: () => closeModal(currentModalId),
        },
    ].filter(Boolean)

    return (
        <Modal modalTitle="Welcome to the ideation market by web3ideation!" buttons={buttons}>
            <div className={styles.modalContent}>
                <h4>You are actually connected to Sepolia testnet</h4>
                <br />
                <p>
                    This is a place where you can buy, sell and swap NFTs. Soon you can also chat
                    with other users.
                </p>
                <br />
                <p>
                    To be able to use all features of this platform, please connect your wallet. If
                    you do not have a wallet yet, you can create one with MetaMask. Simply click on
                    the {'"Connect"'} button below. You will be guided through the process.
                </p>
                <p>
                    You can also use the platform without a wallet. However, you will not be able
                    to buy, sell or swap NFTs.
                </p>
                <br />
                <strong>
                    Please ensure that your wallet is connected to the Sepolia testnet. This is
                    essential for interacting with the {"platform's"} features.
                </strong>
                <br />
                <p>Have fun!</p>
                <p>Your web3ideation team</p>
                <br />
                <p>PS: This is a testnet, so do not use real money here!</p>
                <p>
                    PPS: Join our official WhatsApp group for all testers and developers{" "}
                    <Link href="https://chat.whatsapp.com/BiEucaxvvQQHTLUnDTwCNv">
                        Ideationmarket.com Tester & Developer
                    </Link>
                </p>
                <p>
                    PPPS: If you have any questions, please contact us{" "}
                    <Link href="mailto:info@web3ideation.com">info@web3ideation.com</Link>
                </p>
                <br />
                <SellSwapInformation type="welcome" />
            </div>
        </Modal>
    )
}

WelcomeModal.displayName = "WelcomeModal"

export default WelcomeModal
