import React, { forwardRef, useState, useRef, useEffect, useCallback } from "react"

import { usePublicClient } from "wagmi"

import { useNFT } from "@context/NftDataProvider"
import { validateField } from "@utils/validation"
import { useUpdateListing } from "@hooks/contractWrite/useUpdateListing"
import SellSwapInputFields from "@components/SellSwapActionForm/SellSwapForm/SellSwapInputFields"
import CategoriesCheckbox from "@components/SellSwapActionForm/SellSwapForm/CategoriesCheckbox"
import { useModal } from "@context/ModalProvider"
import Modal from "@components/Modal/ModalBasis/Modal"

import networkMapping from "@constants/networkMapping.json"

import styles from "./UpdateListingModal.module.scss"
import SellSwapInformation from "../../../SellSwapActionForm/SellSwapInformation/SellSwapInformation"

const UpdateListingModal = forwardRef((props, ref) => {
    const { openModal, modalContent, isModalOpen } = useModal()
    const chainString = usePublicClient().chains[0]?.id?.toString() ?? "31337"
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]
    const formRef = useRef(null)
    const { reloadNFTs } = useNFT()

    const [formData, setFormData] = useState({
        newPrice: modalContent.price,
        newDesiredNftAddress: modalContent.desiredNftAddress,
        newDesiredTokenId: modalContent.desiredTokenId,
    })
    const [errors, setErrors] = useState({
        newPrice: "",
        newDesiredNftAddress: "",
        newDesiredTokenId: "",
    })

    const inputFields = [
        {
            key: "newPrice",
            label: "New Price",
            type: "number",
            placeholder: "min. amount: 0.000000000000000001",
        },
        {
            key: "newDesiredNftAddress",
            label: "New Desired NFT Address",
            type: "text",
            placeholder: "0x0000000000000000000000000000000000000000",
        },
        {
            key: "newDesiredTokenId",
            label: "New Desired Token ID",
            type: "text",
            placeholder: "0",
        },
    ]

    const [checkboxData, setCheckboxData] = useState({
        DAO: false,
        Music: false,
        Membership: false,
        "Real world assets": false,
        Gaming: false,
        Wearables: false,
        "Digital Twin": false,
        Utility: false,
    })

    const handleTransactionCompletion = useCallback(() => {
        const modalId = `nftTransactionModal-${modalContent.nftAddress}${modalContent.tokenId}`
        const modalTransactionContent = {
            nftAddress: modalContent.nftAddress,
            tokenId: modalContent.tokenId,
        }
        reloadNFTs()
        openModal("transaction", modalId, modalTransactionContent)
    }, [openModal])

    const { handleUpdateListing } = useUpdateListing(
        marketplaceAddress,
        modalContent.nftAddress,
        modalContent.tokenId,
        modalContent.price,
        formData.newPrice || "0",
        formData.newDesiredNftAddress,
        formData.newDesiredTokenId,
        handleTransactionCompletion
    )

    const validateAndUpdateListing = async () => {
        console.log("Validating form with data:", formData)
        if (validateForm(formData)) {
            try {
                console.log("Form is valid, calling handleUpdateListing")
                await handleUpdateListing()
            } catch (error) {
                console.error("An error occurred during the transaction: ", error)
            }
        }
    }

    const validateForm = (data) => {
        let newErrors = {}
        let isValid = true

        Object.keys(data).forEach((key) => {
            const errorMessage = validateField(key, data[key])
            newErrors[key] = errorMessage

            if (errorMessage) {
                isValid = false
            }
        })

        setErrors(newErrors)
        return isValid
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        const error = validateField(name, value)

        setFormData((prev) => ({ ...prev, [name]: value }))
        setErrors((prev) => ({ ...prev, [name]: error ? error : "" }))
    }

    const resetForm = useCallback(() => {
        setFormData({
            newPrice: modalContent.price || "",
            newDesiredNftAddress: modalContent.desiredNftAddress || "",
            newDesiredTokenId: modalContent.desiredTokenId || "",
        })
        setErrors({
            newPrice: "",
            newDesiredNftAddress: "",
            newDesiredTokenId: "",
        })
    }, [modalContent])

    useEffect(() => {
        if (!isModalOpen) {
            resetForm()
        }
    }, [isModalOpen, resetForm])

    const buttons = [
        {
            text: "UPDATE",
            action: validateAndUpdateListing,
        },
    ]

    return (
        <Modal ref={ref} modalTitle="Updating price or the desired swap" buttons={buttons}>
            <form className={styles.updateListingForm} ref={formRef}>
                <SellSwapInputFields
                    fields={inputFields}
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    handleChange={handleChange}
                />
                <CategoriesCheckbox
                    checkboxData={checkboxData}
                    setCheckboxData={setCheckboxData}
                />
            </form>
            <SellSwapInformation type="update" />
        </Modal>
    )
})

UpdateListingModal.displayName = "UpdateListingModal"

export default UpdateListingModal
