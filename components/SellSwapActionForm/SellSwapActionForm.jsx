import React, { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { ethers } from "ethers"
import { useAccount, usePublicClient } from "wagmi"
import SellSwapForm from "@components/SellSwapActionForm/SellSwapForm/SellSwapForm"
import { useNFT } from "@context/NftDataProvider"
import { useRawApprove } from "@hooks/useRawApprove"
import { useListItem } from "@hooks/useListItem"
import networkMapping from "@constants/networkMapping.json"
import styles from "./SellSwapActionForm.module.scss"

const ActionForm = ({ action, formTitle, extraFields = [] }) => {
    const router = useRouter()
    const provider = usePublicClient()
    const chainId = provider.chains[0].id || "31337"
    const marketplaceAddress = networkMapping[chainId].NftMarketplace[0]
    const { address: userAddress, isConnected } = useAccount()
    const { reloadNFTs } = useNFT()

    const [formData, setFormData] = useState({
        nftAddress: router.query.nftAddress || "",
        tokenId: router.query.tokenId || "",
        price: router.query.price || "",
        desiredNftAddress: "",
        desiredTokenId: "",
    })

    useEffect(() => {
        const { nftAddress, tokenId, price } = router.query
        setFormData((prevData) => ({
            ...prevData,
            nftAddress: nftAddress || prevData.nftAddress,
            tokenId: tokenId || prevData.tokenId,
            price: price || prevData.price,
        }))
    }, [router.query])

    const handleTransactionCompletion = () => {
        router.push("/my-nft")
        reloadNFTs()
    }

    const { handleApproveItem, isApprovingTxSuccess } = useRawApprove(
        formData.nftAddress,
        marketplaceAddress,
        formData.tokenId,
        isConnected,
        () => handleListItem()
    )

    const { handleListItem } = useListItem(
        marketplaceAddress,
        formData.nftAddress,
        formData.tokenId,
        formData.price,
        formData.desiredNftAddress,
        formData.desiredTokenId,
        formData.categories,
        handleTransactionCompletion
    )

    const handleFormSubmit = (newFormData) => {
        const { price, desiredNftAddress, desiredTokenId } = newFormData
        const formattedPrice = ethers.utils.parseUnits(price, "ether").toString()
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

    const approveAndList = async (formData) => {
        try {
            await handleApproveItem()
            if (isApprovingTxSuccess) {
                await handleListItem()
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
                    defaultNftAddress={formData.nftAddress}
                    defaultTokenId={formData.tokenId}
                    defaultPrice={formData.price}
                    extraFields={extraFields}
                />
            </div>
        </div>
    )
}

export default ActionForm