import React, { forwardRef, useState, useRef, useEffect, useCallback, useMemo } from "react"
import { usePublicClient } from "wagmi"
import { useNFT, useModal } from "@context"
import { networkMapping } from "@constants"
import { useUpdateListing, useEthToCurrencyRates } from "@hooks"
import { Modal } from "@components/Modal"
import { InputFields, Information } from "@components/SellSwapActionForm"
import { validateField } from "@utils"
import styles from "./UpdateListingModal.module.scss"

const UpdateListingModal = forwardRef((props, ref) => {
    const { openModal, modalContent, isModalOpen } = useModal()
    const chainString = usePublicClient().chains[0]?.id?.toString() ?? "31337"
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]
    const formRef = useRef(null)
    const { reloadNFTs } = useNFT()

    const { ethToCurrencyRates } = useEthToCurrencyRates()
    console.log("ethToCurrencyRates", ethToCurrencyRates)
    const [ethPrice, setEthPrice] = useState(modalContent.price)
    const [currency, setCurrency] = useState("EUR") // Standardwährung EUR
    const [currencyPrice, setCurrencyPrice] = useState(() => {
        if (modalContent.price && ethToCurrencyRates["eur"]) {
            return (formData.price * ethToCurrencyRates["eur"]).toFixed(2)
        }
        return ""
    })
    const initialFormData = useMemo(
        () => ({
            newPrice: modalContent.price || "",
            newPriceInCurrency: currencyPrice || "",
            newDesiredNftAddress: modalContent.desiredNftAddress || "",
            newDesiredTokenId: modalContent.desiredTokenId || "",
        }),
        [modalContent, currencyPrice]
    )
    const [formData, setFormData] = useState(initialFormData)

    const [activeInput, setActiveInput] = useState("newPrice") // Neuer State für aktives Eingabefeld

    const initialErrors = useMemo(
        () => ({
            newPrice: "",
            newPriceInCurrency: "",
            newDesiredNftAddress: "",
            newDesiredTokenId: "",
        }),
        []
    )

    const [errors, setErrors] = useState(initialErrors)

    const convertEthToCurrency = (eth) => {
        if (!ethToCurrencyRates[currency.toLowerCase()]) return ""
        const rate = ethToCurrencyRates[currency.toLowerCase()]
        const convertedValue = eth * rate

        // Rundung für BTC mit 8 Nachkommastellen
        if (currency === "BTC") {
            return convertedValue.toFixed(8)
        }
        return convertedValue.toFixed(2) // Andere Währungen haben 2 Nachkommastellen
    }

    const convertCurrencyToEth = (currencyValue) => {
        if (!ethToCurrencyRates[currency.toLowerCase()]) return "" // Überprüfe, ob der Umrechnungskurs vorhanden ist
        return currencyValue / ethToCurrencyRates[currency.toLowerCase()] // Konvertiere die ausgewählte Währung in ETH
    }

    // Aktualisiere `currencyPrice`, wenn sich der `ethPrice` ändert
    useEffect(() => {
        if (
            ethPrice &&
            ethToCurrencyRates[currency.toLowerCase()] &&
            activeInput !== "newPriceInCurrency"
        ) {
            console.log("ethPrice", ethPrice)
            const decimalPlaces = currency === "BTC" ? 8 : 2 // 8 Nachkommastellen für Bitcoin
            setCurrencyPrice(convertEthToCurrency(ethPrice))
        }
    }, [ethPrice, ethToCurrencyRates, currency, activeInput])

    // Aktualisiere `ethPrice`, wenn sich der `currencyPrice` ändert
    useEffect(() => {
        if (
            currencyPrice &&
            ethToCurrencyRates[currency.toLowerCase()] &&
            activeInput !== "newPrice"
        ) {
            setEthPrice(convertCurrencyToEth(currencyPrice).toFixed(18))
        }
    }, [currencyPrice, ethToCurrencyRates, currency, activeInput])

    const handleCurrencyChange = (e) => {
        const newCurrency = e.target.value
        setCurrency(newCurrency)

        if (activeInput === "newPrice") {
            const convertedPrice = convertEthToCurrency(ethPrice)
            if (!isNaN(convertedPrice)) {
                const decimalPlaces = newCurrency === "BTC" ? 8 : 2
                setCurrencyPrice(convertedPrice ? convertedPrice : "")
            }
        } else if (activeInput === "newPriceInCurrency") {
            const ethValue = convertCurrencyToEth(currencyPrice)
            if (!isNaN(ethValue)) {
                setEthPrice(ethValue.toFixed(18))
            }
        }
    }

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
        // Sicherstellen, dass die aktuellsten Werte im formData stehen
        const updatedFormData = {
            ...formData,
            newPrice: ethPrice,
            newPriceInCurrency: currencyPrice,
        }

        if (validateForm(updatedFormData)) {
            try {
                await handleUpdateListing() // Hier wird dann der neueste `newPrice` verwendet
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

        setActiveInput(name)

        if (name === "newPrice") {
            const [integerPart, decimalPart] = value.split(".")
            if (decimalPart && decimalPart.length > 18) {
                e.target.value = `${integerPart}.${decimalPart.slice(0, 18)}`
            }
            setEthPrice(e.target.value)
            setFormData((prev) => ({ ...prev, newPrice: e.target.value }))
        } else if (name === "newPriceInCurrency") {
            const [integerPart, decimalPart] = value.split(".")
            const decimalPlaces = currency === "BTC" ? 8 : 2 // Nutze genau 8 Nachkommastellen für BTC
            if (decimalPart && decimalPart.length > decimalPlaces) {
                e.target.value = `${integerPart}.${decimalPart.slice(0, decimalPlaces)}`
            }
            setCurrencyPrice(e.target.value)
            const ethValue = convertCurrencyToEth(e.target.value).toFixed(18)
            setEthPrice(ethValue)
            setFormData((prev) => ({ ...prev, newPrice: ethValue }))
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }))
        }

        const error = validateField(name, value)
        setErrors((prev) => ({ ...prev, [name]: error ? error : "" }))
    }

    //useEffect(() => {
    //    if (isModalOpen && ethToCurrencyRates[currency.toLowerCase()]) {
    //        const initialCurrencyPrice = convertEthToCurrency(ethPrice) || 0
    //        setCurrencyPrice(initialCurrencyPrice ? initialCurrencyPrice : "")
    //    }
    //}, [isModalOpen, ethPrice, ethToCurrencyRates, currency])

    const handleBlur = () => {
        setActiveInput(null)
    }

    const inputFields = [
        {
            key: "newPrice",
            label: "New price in ETH",
            type: "number",
            placeholder: "min. amount: 0.000000000000000001",
            onChange: handleChange,
            onBlur: handleBlur,
        },
        {
            key: "newPriceInCurrency",
            label: (
                <span>
                    Price in
                    <select id="currency" value={currency} onChange={handleCurrencyChange}>
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                        <option value="GBP">GBP</option>
                        <option value="BTC">BTC</option>
                    </select>
                </span>
            ),
            type: "number",
            placeholder: "min. amount: 0.00",
            step: currency === "BTC" ? "0.00000001" : "0.01",
            onChange: handleChange,
            onBlur: handleBlur,
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

    const resetForm = useCallback(() => {
        setFormData({
            newPrice: modalContent.price || "",
            newPriceInCurrency: currencyPrice || "",
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
                <InputFields
                    fields={inputFields}
                    formData={{
                        ...formData,
                        newPrice: ethPrice,
                        newPriceInCurrency: currencyPrice, // Verwende den umgerechneten Wert direkt
                    }}
                    errors={errors}
                    setErrors={setErrors}
                    setFormData={setFormData}
                    handleChange={handleChange}
                />
                {/*<CategoriesCheckbox
                    checkboxData={checkboxData}
                    setCheckboxData={setCheckboxData}
                />*/}
            </form>
            <Information type="update" />
        </Modal>
    )
})

UpdateListingModal.displayName = "UpdateListingModal"

export default UpdateListingModal
