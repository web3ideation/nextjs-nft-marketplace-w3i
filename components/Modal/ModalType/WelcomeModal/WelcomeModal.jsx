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
                <h4>You are actually connected to sepolia testnet</h4>
                <br />
                <p>This is a place where you can buy, sell and swap NFTs. Soon you can also chat with other users.</p>
                <br />
                <p>
                    To be able to use all features of this platform, please connect your wallet. If you do not have a
                    wallet yet, you can create one with MetaMask. Simply click on the {'"Connect"'} button below. You
                    will be guided through the process.
                </p>
                <p>
                    You can also use the platform without a wallet. However, you will not be able to buy, sell or swap
                    NFTs.
                </p>
                <br />
                {/*<p>
                    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut
                    labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores
                    et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
                    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut
                    labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores
                    et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
                </p>
                <br />*/}
                <p>Have fun!</p>
                <p>Your web3ideation team</p>
                <br />
                <p>PS: This is a testnet, so do not use real money here!</p>
                <p>
                    PPS: If you have any questions, please contact us{" "}
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
