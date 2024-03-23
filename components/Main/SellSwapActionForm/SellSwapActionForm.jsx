// NFTActionForm.jsx
import React, { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { ethers } from "ethers"
import { useAccount, usePublicClient } from "wagmi"
import SellSwapForm from "@components/Main/SellSwapActionForm/SellSwapForm/SellSwapForm"
import { useNFT } from "@context/NFTDataProvider"
import { useRawApprove } from "@hooks/useRawApprove"
import { useListItem } from "@hooks/useListItem"
import networkMapping from "@constants/networkMapping.json"
import styles from "./SellSwapActionForm.module.scss"

const NFTActionForm = ({ action, formTitle, extraFields = [] }) => {
    const router = useRouter()
    const provider = usePublicClient()
    const chainId = provider.chains[0]
    const chainString = chainId.id ? parseInt(chainId.id).toString() : "31337"
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]
    const { address: userAdress, isConnected } = useAccount()
    const { reloadNFTs } = useNFT()

    const [nftAddressFromQuery, setNftAddressFromQuery] = useState(router.query.nftAddress || "")
    const [tokenIdFromQuery, setTokenIdFromQuery] = useState(router.query.tokenId || "")
    const [priceFromQuery, setPriceFromQuery] = useState(router.query.price || "")
    const [formData, setFormData] = useState({
        nftAddress: "",
        tokenId: "",
        price: "",
        desiredNftAddress: "",
        desiredTokenId: "",
    })
    // Update NFT address and token ID from the router query
    useEffect(() => {
        setNftAddressFromQuery(router.query.nftAddress)
        setTokenIdFromQuery(router.query.tokenId)
        setPriceFromQuery(router.query.price)
    }, [router.query])

    // Update NFT address, token ID, and price from the router query
    useEffect(() => {
        const { nftAddress, tokenId, price } = router.query
        setFormData({
            ...formData,
            nftAddress: nftAddress || "",
            tokenId: tokenId || "",
            price: price || "",
        })
    }, [router.query])

    const handleTransactionCompletion = () => {
        reloadNFTs()

        setTimeout(() => {
            router.push("/my-nft")
        }, 2000)
    }

    const handleApproveCompletion = () => {
        handleListItem()
    }

    // Funktion zum Aktualisieren der Formulardaten
    const updateFormData = (newFormData) => {
        setFormData(newFormData)
    }

    // ------------------ Contract Functions ------------------
    //Function hook to approve an Item for the marketplace
    const { handleApproveItem, isApprovingTxSuccess } = useRawApprove(
        formData.nftAddress,
        marketplaceAddress,
        formData.tokenId,
        isConnected,
        handleApproveCompletion
    )
    //Function hook to list an item on the marketplace
    const { handleListItem } = useListItem(
        marketplaceAddress,
        formData.nftAddress,
        formData.tokenId,
        formData.price,
        formData.desiredNftAddress,
        formData.desiredTokenId,
        handleTransactionCompletion
    )

    // Function to handle form submission
    const handleFormSubmit = (newFormData) => {
        console.log("Form Data Received: ", newFormData)
        updateFormData(newFormData)

        const { price, desiredNftAddress, desiredTokenId } = newFormData

        const formattedPrice = ethers.utils.parseUnits(price, "ether").toString() // Add any other data formatting here
        const formattedDesiredNftAddress = desiredNftAddress || ethers.constants.AddressZero
        const formattedDesiredTokenId = desiredTokenId || "0"

        const updatedFormData = {
            ...newFormData,
            price: formattedPrice,
            desiredNftAddress: formattedDesiredNftAddress,
            desiredTokenId: formattedDesiredTokenId,
        }
        setFormData(updatedFormData)
        approveAndList(updatedFormData)
    }

    // Function to approve the NFT for sale or swap
    const approveAndList = async (formData) => {
        console.log("Starting approveAndList with data:", formData)
        try {
            // Aufrufen der rawApprove Funktion
            await handleApproveItem()

            if (isApprovingTxSuccess) {
                await handleListItem()
            } else {
                console.error("No transaction receipt from approve.")
            }
        } catch (error) {
            console.error("An error occurred during the transaction: ", error)
        }
    }
    return (
        <div className={styles.nftSellSwapContainer}>
            <div className={styles.nftSellSwapWrapper}>
                <SellSwapForm
                    onSubmit={handleFormSubmit}
                    title={formTitle}
                    id={`${action} Form`}
                    defaultNftAddress={nftAddressFromQuery}
                    defaultTokenId={tokenIdFromQuery}
                    defaultPrice={priceFromQuery}
                    extraFields={extraFields}
                />
            </div>
        </div>
    )
}

export default NFTActionForm
