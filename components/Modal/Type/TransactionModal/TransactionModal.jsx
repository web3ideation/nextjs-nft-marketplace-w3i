import React, { forwardRef, useMemo } from "react"
import { useRouter } from "next/router"
import { useAccount } from "wagmi"
import { useNFT, useModal } from "@context"
import { Card } from "@components"
import { Modal } from "@components/Modal"
import { formatPriceToEther } from "@utils"
import styles from "./TransactionModal.module.scss"

const TransactionModal = forwardRef((props, ref) => {
    const { data: nftData } = useNFT()

    const { address } = useAccount()
    console.log("Wallet address", address)

    const router = useRouter()

    const { modalContent, modalType, closeModal, currentModalId } = useModal()
    console.log("Modal content transaction", modalContent)
    //const nftToShow = useMemo(
    //    () =>
    //        nftData.find(
    //            (nft) =>
    //                nft.nftAddress === modalContent.nftAddress &&
    //                nft.tokenId === modalContent.tokenId
    //        ),
    //    [nftData, modalContent.nftAddress, modalContent.tokenId]
    //)

    // Initialisiere das Array für die Buttons
    const buttons = []

    // Logik zur Bestimmung des Titeltexts und der Button-Handler basierend auf modalType
    let titleText
    switch (modalType) {
        case "bought":
            titleText = "Your purchase overview for: "
            buttons.push({
                text: "SELL",
                action: () =>
                    router.push(
                        `/sell-nft?nftAddress=${modalContent.nftAddress}&tokenId=${
                            modalContent.tokenId
                        }&price=${formatPriceToEther(modalContent.price)}`
                    ),
            })
            buttons.push({
                text: "SWAP",
                action: () =>
                    router.push(
                        `/swap-nft?nftAddress=${modalContent.nftAddress}&tokenId=${
                            modalContent.tokenId
                        }&price=${formatPriceToEther(modalContent.price)}&desiredNftAddress=${
                            modalContent.desiredNftAddress
                        }&desiredTokenId=${modalContent.desiredTokenId}`
                    ),
            })
            buttons.push({
                text: "GO TO MY NFTs",
                action: () => router.push("/my-nft"),
            })
            break
        case "listed":
            titleText = "Your listing overview for: "
            buttons.push({
                text: "CLOSE",
                action: () => closeModal(currentModalId),
            })
            break
        case "updated":
            titleText = "Your update overview for: "
            buttons.push({
                text: "CLOSE",
                action: () => closeModal(currentModalId),
            })
            break
        case "delisted":
            titleText = "Your delisting overview for: "
            buttons.push({
                text: "CLOSE",
                action: () => closeModal(currentModalId),
            })
            break
        case "withdrawn":
            titleText = "Your withdrawal overview: "
            buttons.push({
                text: "CLOSE",
                action: () => closeModal(currentModalId),
            })
            break
        case "transaction":
            titleText = "Transaction successful"
            buttons.push({
                text: "CLOSE",
                action: () => closeModal(currentModalId),
            })
            break
        default:
            break
    }

    return (
        <Modal ref={ref} modalTitle={titleText} buttons={buttons}>
            <div className={styles.modalContent}>
                <br />
                <p>Your transaction was successfully processed.</p>
                {/*<p>You can now view your NFT in your collection.</p>
                <br />
                <div className={styles.cardWrapper}>{<Card nftData={nftToShow} />}</div>
                <p>This is how your NFT appears on marketplace.</p>*/}
            </div>
        </Modal>
    )
})

TransactionModal.displayName = "TransactionModal"

export default TransactionModal
