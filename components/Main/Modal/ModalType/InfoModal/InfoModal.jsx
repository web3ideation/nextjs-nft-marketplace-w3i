// React imports
import React, { forwardRef, useState, useEffect, useMemo } from "react"
import { useRouter } from "next/router"

// Contract hooks
import { useAccount, usePublicClient } from "wagmi"

// Custom hooks and components
import { useNFT } from "@context/NFTDataProvider"
import { useModal } from "@context/ModalProvider"
import { useBuyItem } from "@hooks/useBuyItem"
import { useCancelListing } from "@hooks/useCancelListing"
import Modal from "../../ModalBasis/Modal"
import NFTOverview from "../../ModalElements/NFTOverview/NFTOverview"
import NFTModalList from "../../ModalElements/ModalCollectionList/NFTModalList"

// Utility Imports
import { formatPriceToEther } from "@utils/formatting"

// Constants import
import networkMapping from "@constants/networkMapping.json"

const NftModal = forwardRef((props, ref) => {
    // Destructuring the passed properties

    const router = useRouter()
    const { data: nftData, reloadNFTs } = useNFT()
    const { isConnected } = useAccount()
    const chainString = usePublicClient().chains[0]?.id?.toString() ?? "31337"
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]

    const { openModal, modalContent, modalType, closeModal, currentModalId } = useModal()

    const [formattedPrice, setFormattedPrice] = useState("")

    console.log("Modal content info", modalContent, modalType)

    const nftToShow = useMemo(() => {
        return nftData.find(
            (nft) =>
                nft.nftAddress === modalContent.nftAddress && nft.tokenId === modalContent.tokenId
        )
    }, [nftData, modalContent.nftAddress, modalContent.tokenId])

    const handleUpdatePriceButtonClick = () => {
        const modalId = "nftUpdateModal-" + `${modalContent.nftAddress}${modalContent.tokenId}`
        const updateListingData = {
            price: formattedPrice,
            nftAddress: modalContent.nftAddress,
            tokenId: modalContent.tokenId,
            desiredNftAddress: modalContent.desiredNftAddress,
            desiredTokenId: modalContent.desiredTokenId,
        }
        openModal("update", modalId, updateListingData)
    }
    // Event handlers for various interactions
    const handleTransactionCompletion = () => {
        reloadNFTs()
    }
    useEffect(() => {
        setFormattedPrice(formatPriceToEther(modalContent.price))
    }, [])

    const { handleBuyClick } = useBuyItem(
        marketplaceAddress,
        modalContent.price,
        modalContent.nftAddress,
        modalContent.tokenId,
        isConnected,
        formattedPrice,
        handleTransactionCompletion
    )
    const { handleCancelListingClick } = useCancelListing(
        marketplaceAddress,
        modalContent.nftAddress,
        modalContent.tokenId,
        isConnected,
        handleTransactionCompletion
    )

    const buttons = []
    let titleText
    switch (modalType) {
        case "info":
            titleText = modalContent.tokenName
            if (modalContent.isListed) {
                buttons.push({ text: "BUY", action: handleBuyClick })
            }
            break
        case "list":
            titleText = modalContent.tokenName
            buttons.push({ text: "SELL", action: () => handleListClick("sell") })
            buttons.push({ text: "SWAP", action: () => handleListClick("swap") })
            break
        case "sell":
            titleText = modalContent.tokenName
            buttons.push({ text: "UPDATE", action: handleUpdatePriceButtonClick })
            buttons.push({ text: "DELIST", action: handleCancelListingClick })
            break
        default:
            break
    }

    const handleListClick = (action) => {
        if (action === "sell") {
            // Logic for sell
            router.push(
                `/sell-nft?nftAddress=${modalContent.nftAddress}&tokenId=${
                    modalContent.tokenId
                }&price=${formatPriceToEther(modalContent.price)}`
            )
        } else if (action === "swap") {
            // Logic for swap
            router.push(
                `/swap-nft?nftAddress=${modalContent.nftAddress}&tokenId=${
                    modalContent.tokenId
                }&price=${formatPriceToEther(modalContent.price)}&desiredNftAddress=${
                    modalContent.desiredNftAddress
                }&desiredTokenId=${modalContent.desiredTokenId}`
            )
        }
        closeModal(currentModalId)
    }

    return (
        <Modal ref={ref} modalTitle={titleText} buttons={buttons}>
            <NFTOverview modalContent={nftToShow || modalContent}></NFTOverview>
            <NFTModalList
                filterAddress={modalContent.nftAddress}
                filterTokenId={modalContent.tokenId}
            />
        </Modal>
    )
})

export default NftModal
