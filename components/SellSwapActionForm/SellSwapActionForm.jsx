import { useEffect, useState, useCallback, useRef, useMemo } from "react"
import { useRouter } from "next/router"
import { usePublicClient } from "wagmi"
import SellSwapInformation from "@components/SellSwapActionForm/SellSwapInformation/SellSwapInformation"
import CategoriesCheckbox from "./SellSwapForm/CategoriesCheckbox"
import SellSwapInputFields from "./SellSwapForm/SellSwapInputFields"
import BtnWithAction from "@components/Btn/BtnWithAction"
import { useNFT } from "@context/NftDataProvider"
import { useApprove, useListItem } from "../../hooks/index"
import networkMapping from "@constants/networkMapping.json"
import styles from "./SellSwapActionForm.module.scss"
import { validateField } from "@utils/validation"
import { capitalizeFirstChar } from "@utils/formatting"
import useEthToEurRate from "@hooks/ethToEurRate/useEthToEurRate"
import { useModal } from "@context/ModalProvider"

const ActionForm = ({ action, formTitle, extraFields = [] }) => {
    const router = useRouter()
    const chainString = usePublicClient().chains[0]?.id?.toString() ?? "31337"
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]
    const formRef = useRef(null)
    const { openModal, modalContent, modalType, closeModal, currentModalId } = useModal()
    const { reloadNFTs } = useNFT()

    const initialFormData = useMemo(
        () => ({
            nftAddress: router.query.nftAddress || "",
            tokenId: router.query.tokenId || "",
            price: router.query.price || "",
            ...extraFields.reduce((acc, field) => ({ ...acc, [field.key]: "" }), {}),
            categories: [],
        }),
        [router.query.nftAddress, router.query.tokenId, router.query.price, extraFields]
    )

    const [formData, setFormData] = useState(initialFormData)
    const [ethPrice, setEthPrice] = useState(formData.price)
    const [eurPrice, setEurPrice] = useState("")
    const { ethToEurRate } = useEthToEurRate()
    const initialErrors = useMemo(
        () => ({
            nftAddress: "",
            tokenId: "",
            price: "",
            ...extraFields.reduce((acc, field) => ({ ...acc, [field.key]: "" }), {}),
            categories: "",
        }),
        [extraFields]
    )

    const [errors, setErrors] = useState(initialErrors)

    const inputFields = [
        {
            key: "nftAddress",
            label: "NFT Address",
            type: "text",
            placeholder: "0x0000000000000000000000000000000000000000",
        },
        { key: "tokenId", label: "Token ID", type: "text", placeholder: "0" },
        {
            key: "price",
            label: "Price in ETH",
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
            key: "priceInEur",
            label: "Price in EUR",
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
        ...extraFields,
    ]

    const [checkboxData, setCheckboxData] = useState({
        DAO: false,
        Music: false,
        Membership: false,
        "Real world assets": false,
        Gaming: false,
        Wearables: false,
        "Digital Twin": false,
    })

    const convertEthToEur = (eth) => {
        if (!ethToEurRate) return "" // or any default value
        return (eth * ethToEurRate).toFixed(2) // Convert ETH to EUR
    }

    const convertEurToEth = (eur) => {
        if (!ethToEurRate) return "" // or any default value
        return (eur / ethToEurRate).toFixed(18) // Convert EUR to ETH
    }

    const handleTransactionCompletion = useCallback(() => {
        const { pathname } = router
        const modalId = `transactionModal-${formData.nftAddress}${formData.tokenId}`
        const modalTransactionContent = {
            nftAddress: formData.nftAddress,
            tokenId: formData.tokenId,
        }

        if (pathname !== "/") {
            router.push("/")
        }

        reloadNFTs()
        openModal("transaction", modalId, modalTransactionContent)
    }, [router, formData.nftAddress, formData.tokenId, reloadNFTs, openModal])

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

    const handleApproveCompleted = useCallback(() => {
        handleListItem()
    }, [handleListItem])

    const { handleApprove } = useApprove(
        marketplaceAddress,
        formData.nftAddress,
        formData.tokenId,
        handleApproveCompleted
    )

    const approveAndList = (e) => {
        e.preventDefault() // Prevent the default form submission behavior
        if (!validateForm(formData)) {
            return
        }
        if (handleApprove) {
            handleApprove()
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

        // Überprüfen, ob das Feld "price" (ETH) oder "priceInEur" (EUR) ist
        if (name === "price") {
            setEthPrice(value)

            // Berechnung nur ausführen, wenn das Eingabefeld nicht leer ist
            if (value && !isNaN(value)) {
                setEurPrice(convertEthToEur(value))
            } else {
                setEurPrice("") // Leeren Zustand setzen, wenn Eingabefeld leer ist
            }
        } else if (name === "priceInEur") {
            setEurPrice(value)

            // Berechnung nur ausführen, wenn das Eingabefeld nicht leer ist
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

    const handleCategoryChange = (updatedCategories) => {
        setFormData((prev) => ({ ...prev, categories: updatedCategories }))
    }

    useEffect(() => {
        console.log("Modal Content updated:", modalContent)
    }, [modalContent])

    return (
        <div className={styles.nftSellSwapContainer}>
            <div className={styles.sellSwapFormWrapper}>
                <h2>{capitalizeFirstChar(action)} your NFT</h2>
                <div className={styles.sellSwapForm} ref={formRef}>
                    <SellSwapInputFields
                        fields={inputFields}
                        formData={{ ...formData, price: ethPrice, priceInEur: eurPrice }}
                        errors={errors}
                        setFormData={setFormData}
                        handleChange={handleChange}
                    />

                    <CategoriesCheckbox
                        checkboxData={checkboxData}
                        setCheckboxData={setCheckboxData}
                        handleCategoryChange={handleCategoryChange}
                    />
                </div>
                <SellSwapInformation type={action} />
                <BtnWithAction buttonText={"Approve and list"} onClickAction={approveAndList} />
            </div>
        </div>
    )
}

export default ActionForm
