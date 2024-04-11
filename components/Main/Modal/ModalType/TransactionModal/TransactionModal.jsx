// React imports (React core and hooks
import React, { forwardRef } from "react"
import { useRouter } from "next/router"
import { useAccount } from "wagmi"

// Custom hooks and components
import NFTOverview from "../../ModalElements/NFTOverview/NFTOverview"
import useFetchNFTsForWallet from "@hooks/fetchNFTsForWallet"
import { useModal } from "@context/ModalProvider"
import Modal from "../../ModalBasis/Modal"
import { formatPriceToEther } from "@utils/formatting"

// Styles import
import styles from "./TransactionModal.module.scss"

const TransactionModal = forwardRef((props, ref) => {
    const { address } = useAccount()
    console.log("Wallet address", address)

    const { nfts } = useFetchNFTsForWallet(address)
    console.log("Fetched nfts from wallet", nfts)

    const router = useRouter()

    const { modalContent, modalType } = useModal()
    console.log("Modal content transaction", modalContent)

    const nftToShow = () => {
        return nfts.find(
            (nft) =>
                nft.nftAddress === modalContent.nftAddress && nft.tokenId === modalContent.tokenId
        )
    }

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
            // Füge hier spezifische Buttons für den Fall "listed" hinzu, falls nötig
            break
        case "updated":
            titleText = "Your update overview for: "
            // Füge hier spezifische Buttons für den Fall "updated" hinzu, falls nötig
            break
        case "delisted":
            titleText = "Your delisting overview for: "
            // Füge hier spezifische Buttons für den Fall "delisted" hinzu, falls nötig
            break
        case "withdrawn":
            titleText = "Your withdrawal overview: "
            // Füge hier spezifische Buttons für den Fall "withdrawn" hinzu, falls nötig
            break
        default:
            // Optionale Default-Case-Logik
            break
    }

    return (
        <Modal ref={ref} modalTitle={titleText} buttons={buttons}>
            <NFTOverview modalContent={nftToShow()}></NFTOverview>
        </Modal>
    )
})

export default TransactionModal
