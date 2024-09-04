import React, { forwardRef, useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/router"
import { usePublicClient } from "wagmi"
import { useNFT } from "@context/NftDataProvider"
import { useModal } from "@context/ModalProvider"
import { useBuyItem, useCancelListing } from "../../../../hooks/index"
import Modal from "@components/Modal/ModalBasis/Modal"
import Overview from "@components/Modal/ModalElements/NftOverview/Overview"
import ModalList from "@components/Modal/ModalElements/NftModalCollectionList/ModalList"
import { formatPriceToEther } from "@utils/formatting"
import networkMapping from "@constants/networkMapping.json"

const InfoModal = forwardRef((props, ref) => {
    const router = useRouter()
    const { data: nftData, reloadNFTs } = useNFT()
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

    const handleTransactionCompletion = useCallback(() => {
        const modalId = `nftTransactionModal-${modalContent.nftAddress}${modalContent.tokenId}`
        const modalTransactionContent = {
            nftAddress: modalContent.nftAddress,
            tokenId: modalContent.tokenId,
        }
        reloadNFTs()
        openModal("transaction")
    }, [openModal])

    const { handleBuyItem } = useBuyItem(
        marketplaceAddress,
        modalContent.price,
        modalContent.nftAddress,
        modalContent.tokenId,
        formattedPrice,
        handleTransactionCompletion
    )
    const { handleCancelListing } = useCancelListing(
        marketplaceAddress,
        modalContent.nftAddress,
        modalContent.tokenId,
        handleTransactionCompletion
    )

    const handleUpdatePriceButtonClick = useCallback(() => {
        const modalId = `nftUpdateModal-${modalContent.nftAddress}${modalContent.tokenId}`
        openModal("update", modalId, { ...modalContent, price: formattedPrice })
    }, [modalContent, formattedPrice, openModal])

    const handleListClick = useCallback(
        (action) => {
            const urlParams = `nftAddress=${modalContent.nftAddress}&tokenId=${
                modalContent.tokenId
            }&price=${formattedPrice || "0"}`
            const basePath =
                action === "sell"
                    ? `/sell-nft?${urlParams}`
                    : `/swap-nft?${urlParams}&desiredNftAddress=${modalContent.desiredNftAddress}&desiredTokenId=${modalContent.desiredTokenId}`
            router.push(basePath)
            closeModal(currentModalId)
        },
        [modalContent, formattedPrice, router, closeModal, currentModalId]
    )

    const buttons = useMemo(() => {
        let actionButtons = []
        switch (modalType) {
            case "info":
                if (modalContent.isListed) {
                    actionButtons.push({ text: "BUY", action: handleBuyItem })
                }
                break
            case "list":
                actionButtons.push({ text: "SELL", action: () => handleListClick("sell") })
                actionButtons.push({ text: "SWAP", action: () => handleListClick("swap") })
                break
            case "sell":
                actionButtons.push({ text: "UPDATE", action: handleUpdatePriceButtonClick })
                actionButtons.push({ text: "DELIST", action: handleCancelListing })
                break
            default:
                break
        }
        return actionButtons
    }, [
        modalType,
        modalContent.isListed,
        handleBuyItem,
        handleListClick,
        handleUpdatePriceButtonClick,
        handleCancelListing,
    ])

    return (
        <Modal ref={ref} modalTitle={modalContent.collectionName || ""} buttons={buttons}>
            <Overview modalContent={nftToShow || modalContent} />
            <ModalList
                filterAddress={modalContent.nftAddress}
                filterTokenId={modalContent.tokenId}
            />
        </Modal>
    )
})

InfoModal.displayName = "InfoModal"

export default InfoModal
