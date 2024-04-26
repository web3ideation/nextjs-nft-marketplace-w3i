import React, { forwardRef, useState, useEffect, useMemo } from "react"
import { useRouter } from "next/router"

import { useAccount, usePublicClient } from "wagmi"

import { useNFT } from "@context/NftDataProvider"
import { useModal } from "@context/ModalProvider"
import { useBuyItem } from "@hooks/useBuyItem"
import { useCancelListing } from "@hooks/useCancelListing"
import Modal from "@components/Modal/ModalBasis/Modal"
import Overview from "@components/Modal/ModalElements/NftOverview/Overview"
import ModalList from "@components/Modal/ModalElements/NftModalCollectionList/ModalList"

import { formatPriceToEther } from "@utils/formatting"

import networkMapping from "@constants/networkMapping.json"

const NftModal = forwardRef((props, ref) => {
    const router = useRouter()
    const { data: nftData, reloadNFTs } = useNFT()
    const { isConnected } = useAccount()
    const chainString = usePublicClient().chains[0]?.id?.toString() ?? "31337"
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]
    const { openModal, modalContent, modalType, closeModal, currentModalId } = useModal()
    const [formattedPrice, setFormattedPrice] = useState("")

    const nftToShow = useMemo(
        () =>
            nftData.find(
                (nft) =>
                    nft.nftAddress === modalContent.nftAddress &&
                    nft.tokenId === modalContent.tokenId
            ),
        [nftData, modalContent.nftAddress, modalContent.tokenId]
    )

    useEffect(() => {
        setFormattedPrice(formatPriceToEther(modalContent.price))
    }, [modalContent.price])

    const { handleBuyClick } = useBuyItem(
        marketplaceAddress,
        modalContent.price,
        modalContent.nftAddress,
        modalContent.tokenId,
        isConnected,
        formattedPrice,
        reloadNFTs
    )
    const { handleCancelListingClick } = useCancelListing(
        marketplaceAddress,
        modalContent.nftAddress,
        modalContent.tokenId,
        isConnected,
        reloadNFTs
    )

    const handleUpdatePriceButtonClick = () => {
        const modalId = `nftUpdateModal-${modalContent.nftAddress}${modalContent.tokenId}`
        openModal("update", modalId, { ...modalContent, price: formattedPrice })
    }

    const handleListClick = (action) => {
        const urlParams = `nftAddress=${modalContent.nftAddress}&tokenId=${modalContent.tokenId}&price=${formattedPrice}`
        const basePath =
            action === "sell"
                ? `/sell-nft?${urlParams}`
                : `/swap-nft?${urlParams}&desiredNftAddress=${modalContent.desiredNftAddress}&desiredTokenId=${modalContent.desiredTokenId}`
        router.push(basePath)
        closeModal(currentModalId)
    }

    const buttons = useMemo(() => {
        let actionButtons = []
        switch (modalType) {
            case "info":
                if (modalContent.isListed) {
                    actionButtons.push({ text: "BUY", action: handleBuyClick })
                }
                break
            case "list":
                actionButtons.push({ text: "SELL", action: () => handleListClick("sell") })
                actionButtons.push({ text: "SWAP", action: () => handleListClick("swap") })
                break
            case "sell":
                actionButtons.push({ text: "UPDATE", action: handleUpdatePriceButtonClick })
                actionButtons.push({ text: "DELIST", action: handleCancelListingClick })
                break
            default:
                break
        }
        return actionButtons
    }, [
        modalType,
        modalContent.isListed,
        handleBuyClick,
        handleListClick,
        handleUpdatePriceButtonClick,
        handleCancelListingClick,
    ])

    return (
        <Modal ref={ref} modalTitle={modalContent.tokenName || ""} buttons={buttons}>
            <Overview modalContent={nftToShow || modalContent} />
            <ModalList
                filterAddress={modalContent.nftAddress}
                filterTokenId={modalContent.tokenId}
            />
        </Modal>
    )
})

export default NftModal
