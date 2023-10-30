import React, { useState, useRef } from "react"
import { Button } from "web3uikit"
import styles from "../styles/Home.module.css"
import Tooltip from "../components/Tooltip"

function SellSwapForm({
    title,
    key,
    onSubmit,
    defaultNftAddress,
    defaultTokenId,
    extraFields = [],
}) {
    const formRef = useRef(null)
    const [focusedField, setFocusedField] = useState(null)

    // Initial state for form data
    const [formData, setFormData] = useState({
        nftAddress: defaultNftAddress,
        tokenId: defaultTokenId,
        price: "",
        ...extraFields.reduce((acc, field) => {
            acc[field.key] = ""
            return acc
        }, {}),
    })

    // Initial state for form errors
    const [errors, setErrors] = useState({
        nftAddress: "",
        tokenId: "",
        price: "",
    })

    // ------------------ Validation Logic ------------------

    // Validate individual form fields
    function validateField(name, value) {
        let errorMessage = ""

        switch (name) {
            case "nftAddress":
            case "desiredNftAddress":
                if (!/^0x[0-9a-fA-F]{40}$/.test(value)) {
                    errorMessage = "Please enter a valid Ethereum address in the format 0x1234..."
                }
                break
            case "tokenId":
            case "desiredTokenId":
                if (!/^[0-9]\d*$/.test(value)) {
                    errorMessage = "Please enter a positive integer or zero."
                }
                break
            case "price":
                if (!/^\d{1,18}(\.\d{1,18})?$/.test(value)) {
                    errorMessage = "Please enter a positive amount in ETH."
                }
                break
            default:
                break
        }

        // Update error state for the specific field
        setErrors((prevErrors) => ({ ...prevErrors, [name]: errorMessage }))

        return errorMessage === ""
    }

    // Validate the entire form
    function validateForm(data) {
        let isValid = true

        // Validate each field and update the isValid status
        Object.keys(data).forEach((key) => {
            if (!validateField(key, data[key])) {
                isValid = false
            }
        })

        return isValid
    }

    // ------------------ Handlers ------------------

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }))
    }

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault()
        if (validateForm(formData)) {
            onSubmit(formData)
        }
    }

    return (
        <form className={styles.sellSwapForm} onSubmit={handleSubmit} key={key} ref={formRef}>
            <h2>{title}</h2>
            {/* Render form fields for NFT Address, Token ID, and Price */}
            {["nftAddress", "tokenId", "price"].map((fieldKey) => (
                <div key={fieldKey} className={styles.formInputWrapper}>
                    <div className={styles.formInput}>
                        <label htmlFor={fieldKey}>
                            {fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1)}
                        </label>
                        <div className={styles.inputWrapper}>
                            <input
                                type={fieldKey === "price" ? "number" : "text"}
                                id={fieldKey}
                                name={fieldKey}
                                placeholder={
                                    fieldKey === "nftAddress"
                                        ? "0x0000000000000000000000000000000000000000"
                                        : fieldKey === "tokenId"
                                        ? "0"
                                        : "min. amount: 0.000000000000000001"
                                }
                                value={formData[fieldKey]}
                                onChange={handleChange}
                                onBlur={(e) => {
                                    validateField(e.target.name, e.target.value)
                                    setFocusedField(null)
                                }}
                                onFocus={() => {
                                    setFocusedField(fieldKey)
                                    setErrors("")
                                }}
                                className={focusedField === fieldKey ? styles.inputFocused : ""}
                            />
                            {errors[fieldKey] && <Tooltip message={errors[fieldKey]} />}
                        </div>
                    </div>
                </div>
            ))}
            {/* Render extra fields if provided */}
            {extraFields.map((field) => (
                <div key={field.key} className={styles.formInputWrapper}>
                    <div className={styles.formInput}>
                        <label htmlFor={field.key}>{field.name}</label>
                        <div className={styles.inputWrapper}>
                            <input
                                type={field.type}
                                key={field.key}
                                name={field.key}
                                placeholder={field.placeholder}
                                value={formData[field.key]}
                                onChange={handleChange}
                                onBlur={(e) => {
                                    validateField(e.target.name, e.target.value)
                                    setFocusedField(null)
                                }}
                                onFocus={() => {
                                    setFocusedField(field.key)
                                    setErrors("")
                                }}
                                className={focusedField === field.key ? styles.inputFocused : ""}
                            />
                            {errors[field.key] && <Tooltip message={errors[field.key]} />}
                        </div>
                    </div>
                </div>
            ))}
            <Button type="submit" text="Submit" />
        </form>
    )
}

export default SellSwapForm
