import React, { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/router"
import { ethers } from "ethers"
import { usePublicClient, useAccount } from "wagmi"
import SellSwapForm from "@components/SellSwapActionForm/SellSwapForm/SellSwapForm"
import { useNFT } from "@context/NftDataProvider"
import { useApprove, useListItem } from "../../hooks/index"

import networkMapping from "@constants/networkMapping.json"
import styles from "./SellSwapActionForm.module.scss"

const ActionForm = ({ formTitle, extraFields = [] }) => {
    const router = useRouter()
    const chainString = usePublicClient().chains[0]?.id?.toString() ?? "31337"
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]
    const { address: userAddress, isConnected } = useAccount()

    const { reloadNFTs } = useNFT()
    const [isFormSubmitted, setIsFormSubmitted] = useState(false)

    const [formData, setFormData] = useState({
        nftAddress: router.query.nftAddress || "",
        tokenId: router.query.tokenId || "",
        price: router.query.price || "",
        desiredNftAddress: "",
        desiredTokenId: "",
        categories: [],
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

    const handleTransactionCompletion = useCallback(() => {
        const { pathname } = router

        if (pathname !== "/my-nft") {
            router.push("/my-nft")
        }

        reloadNFTs()
    }, [router, reloadNFTs])

    const { handleList } = useListItem(
        marketplaceAddress,
        formData.nftAddress,
        formData.tokenId,
        formData.price,
        formData.desiredNftAddress,
        formData.desiredTokenId,
        formData.categories,
        handleTransactionCompletion
    )

    const { handleApprove, isApprovingTxSuccess } = useApprove(
        marketplaceAddress,
        formData.nftAddress,
        formData.tokenId,
        isConnected,
        () => handleList()
    )

    const handleFormSubmit = (newFormData) => {
        const { price, desiredNftAddress, desiredTokenId, categories } = newFormData
        console.log("Submitting form data:", newFormData)

        const formattedPrice = ethers.utils.parseUnits(price, "ether").toString()
        const formattedDesiredNftAddress = desiredNftAddress || ethers.constants.AddressZero
        const formattedDesiredTokenId = desiredTokenId ? ethers.BigNumber.from(desiredTokenId).toString() : "0"

        const updatedFormData = {
            ...newFormData,
            price: formattedPrice,
            desiredNftAddress: formattedDesiredNftAddress,
            desiredTokenId: formattedDesiredTokenId,
            categories,
        }

        console.log("Updated form data for contract:", updatedFormData)
        setFormData(updatedFormData)
        setIsFormSubmitted(true)
    }

    useEffect(() => {
        if (
            formData.nftAddress &&
            formData.tokenId &&
            formData.price &&
            formData.desiredNftAddress &&
            formData.desiredTokenId
        ) {
            console.log("Form data is complete:", formData)
        } else {
            console.warn("Form data is incomplete:", formData)
        }
    }, [formData])

    const approveAndList = async (formData) => {
        try {
            await handleApprove()
            if (isApprovingTxSuccess) {
                console.log("approved", formData)
                await handleList()
            }
        } catch (error) {
            console.error("An error occurred during the transaction: ", error)
        }
    }

    useEffect(() => {
        if (isFormSubmitted) {
            approveAndList(formData)
            setIsFormSubmitted(false)
        }
    }),
        [isFormSubmitted]

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
                    formData={formData}
                    setFormData={setFormData}
                />
            </div>
        </div>
    )
}

export default ActionForm
