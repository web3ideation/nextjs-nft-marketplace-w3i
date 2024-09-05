import React, { forwardRef, useState, useRef, useEffect, useCallback, useMemo } from "react"
import { usePublicClient } from "wagmi"
import { useNFT } from "@context/NftDataProvider"
import { validateField } from "@utils/validation"
import { useUpdateListing } from "@hooks/contractWrite/useUpdateListing"
import SellSwapInputFields from "@components/SellSwapActionForm/SellSwapForm/SellSwapInputFields"
import CategoriesCheckbox from "@components/SellSwapActionForm/SellSwapForm/CategoriesCheckbox"
import { useModal } from "@context/ModalProvider"
import Modal from "@components/Modal/ModalBasis/Modal"
import networkMapping from "@constants/networkMapping.json"
import useEthToEurRate from "@hooks/ethToEurRate/useEthToEurRate"
import styles from "./UpdateListingModal.module.scss"
import SellSwapInformation from "../../../SellSwapActionForm/SellSwapInformation/SellSwapInformation"

const UpdateListingModal = forwardRef((props, ref) => {
    const { openModal, modalContent, isModalOpen } = useModal()
    const chainString = usePublicClient().chains[0]?.id?.toString() ?? "31337"
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]
    const formRef = useRef(null)
    const { reloadNFTs } = useNFT()

    const initialFormData = useMemo(
        () => ({
            newPrice: modalContent.price || "",
            newDesiredNftAddress: modalContent.desiredNftAddress || "",
            newDesiredTokenId: modalContent.desiredTokenId || "",
        }),
        [modalContent]
    )

    const [formData, setFormData] = useState(initialFormData)
    const [ethPrice, setEthPrice] = useState(formData.newPrice)
    const [eurPrice, setEurPrice] = useState("")
    const { ethToEurRate } = useEthToEurRate()

    const initialErrors = useMemo(
        () => ({
            newPrice: "",
            newDesiredNftAddress: "",
            newDesiredTokenId: "",
        }),
        []
    )

    const [errors, setErrors] = useState(initialErrors)

    const inputFields = [
        {
            key: "newPrice",
            label: "New price in ETH",
            type: "number",
            placeholder: "min. amount: 0.000000000000000001",
            onInput: (e) => {
                const { value } = e.target
                const [integerPart, decimalPart] = value.split(".")
                if (decimalPart && decimalPart.length > 18) {
                    // Trim to 18 decimal places if exceeded
                    e.target.value = `${integerPart}.${decimalPart.slice(0, 18)}`
                }
            },
        },
        {
            key: "newPriceInEur",
            label: "New price in EUR",
            type: "number",
            placeholder: "min. amount: 0.00",
            onInput: (e) => {
                const { value } = e.target
                if (!value) return // Beende, wenn der Wert leer ist

                const cleanedValue = value.replace(/[^0-9]/g, "") // Entferne alle nicht-numerischen Zeichen
                const integerPart = cleanedValue.slice(0, -2) || "0" // Nimm die ersten Ziffern für den Ganzzahlteil
                const decimalPart = cleanedValue.slice(-2).padStart(2, "0") // Fülle Dezimalstellen auf 2 auf

                e.target.value = `${parseInt(integerPart)}.${decimalPart}` // Entferne führende Nullen
            },
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

    const convertEthToEur = (eth) => {
        if (!ethToEurRate) return "" // or any default value
        return (eth * ethToEurRate).toFixed(2) // Convert ETH to EUR
    }

    const convertEurToEth = (eur) => {
        if (!ethToEurRate) return "" // or any default value
        return (eur / ethToEurRate).toFixed(18) // Convert EUR to ETH
    }

    useEffect(() => {
        // Set initial EUR price when the component is first rendered or ETH price changes
        if (ethPrice && ethToEurRate) {
            setEurPrice(convertEthToEur(ethPrice))
        }
    }, [ethPrice, ethToEurRate]) // Dependency array ensures effect runs on ETH price or rate change

    const handleTransactionCompletion = useCallback(() => {
        const modalId = `nftTransactionModal-${modalContent.nftAddress}${modalContent.tokenId}`
        const modalTransactionContent = {
            nftAddress: modalContent.nftAddress,
            tokenId: modalContent.tokenId,
        }
        reloadNFTs()
        openModal("transaction", modalId, modalTransactionContent)
    }, [modalContent.nftAddress, modalContent.tokenId, openModal, reloadNFTs])

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
        if (validateForm(formData)) {
            try {
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

        if (name === "newPrice") {
            setEthPrice(value)
            if (value && !isNaN(value)) {
                setEurPrice(convertEthToEur(value))
            } else {
                setEurPrice("") // Leeren Zustand setzen, wenn Eingabefeld leer ist
            }
        } else if (name === "newPriceInEur") {
            setEurPrice(value)
            if (value && !isNaN(value)) {
                setEthPrice(convertEurToEth(value))
            } else {
                setEthPrice("") // Leeren Zustand setzen, wenn Eingabefeld leer ist
            }
        }

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
        setErrors(initialErrors)
    }, [modalContent, initialErrors])

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
                    formData={{ ...formData, newPrice: ethPrice, newPriceInEur: eurPrice }}
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
