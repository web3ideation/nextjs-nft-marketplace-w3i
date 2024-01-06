// ------------------ React Imports ------------------
// Core React and necessary hooks
import React, { useState, useRef } from "react"

// ------------------ Custom Hooks & Utility Imports ------------------
// Utility function for field validation
import { validateField } from "../../../utils/validation"

// ------------------ Component Imports ------------------
// Tooltip component for error display
import Tooltip from "../ux/Tooltip"

// ------------------ Style Imports ------------------
// Styles specific to this component
import styles from "../../../styles/Home.module.css"

// ------------------ SellSwapForm Component ------------------
// This component is responsible for rendering a form tailored for selling or swapping NFTs.
// It includes fields for NFT address, token ID, price, and additional user-defined fields.
function SellSwapForm({
    title,
    onSubmit,
    defaultNftAddress = "",
    defaultTokenId = "",
    defaultPrice = "",
    extraFields = [],
}) {
    // ------------------ Refs ------------------
    // Reference to the form element for direct DOM manipulation if needed
    const formRef = useRef(null)

    // ------------------ State Initialization ------------------
    // State for form data, initialized with default values and dynamically added extra fields
    const [formData, setFormData] = useState({
        nftAddress: defaultNftAddress,
        tokenId: defaultTokenId,
        price: defaultPrice,
        ...extraFields.reduce((acc, field) => ({ ...acc, [field.key]: "" }), {}),
    })

    // State for managing form field errors
    const [errors, setErrors] = useState({
        nftAddress: "",
        tokenId: "",
        price: "",
    })

    // ------------------ Form Validation ------------------
    // Validates the entire form data and logs validation results
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
        console.log("Form validation result:", isValid)
        return isValid
    }

    // ------------------ Event Handlers ------------------
    // Handles changes in form fields and updates state accordingly
    const handleChange = (e) => {
        const { name, value } = e.target

        setFormData((prev) => ({ ...prev, [name]: value }))
        setErrors((prev) => ({ ...prev, [name]: validateField(name, value) ? "" : errors[name] }))
    }

    // Handles form submission, including validation and data logging
    const handleSubmit = (e) => {
        e.preventDefault()
        console.log("Form submission attempted")
        if (validateForm(formData)) {
            console.log("Form data on submit:", formData)
            onSubmit(formData)
        } else {
            console.log("Form validation failed")
        }
    }

    return (
        <form className={styles.sellSwapForm} onSubmit={handleSubmit} ref={formRef}>
            <h2>{title}</h2>
            {/* Standard form fields for NFT Address, Token ID, and Price */}
            {["nftAddress", "tokenId", "price"].map((fieldKey) => (
                <div key={fieldKey} className={styles.formInputWrapper}>
                    <div key={fieldKey} className={styles.formInput}>
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
                                    const error = validateField(e.target.name, e.target.value)
                                    setErrors((prevErrors) => ({
                                        ...prevErrors,
                                        [e.target.name]: error,
                                    }))
                                }}
                                onFocus={() => {
                                    setErrors((prevErrors) => ({ ...prevErrors, [fieldKey]: "" }))
                                }}
                            />
                            {errors[fieldKey] && <Tooltip message={errors[fieldKey]} />}
                        </div>
                    </div>
                </div>
            ))}
            {/* Rendering extra fields if provided */}
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
                                    const error = validateField(e.target.name, e.target.value)
                                    setErrors((prevErrors) => ({
                                        ...prevErrors,
                                        [e.target.name]: error,
                                    }))
                                }}
                                onFocus={() => {
                                    setErrors((prevErrors) => ({ ...prevErrors, [field.key]: "" }))
                                }}
                            />
                            {console.log("ERROR", errors[field.key])}
                            {errors[field.key] && <Tooltip message={errors[field.key]} />}
                        </div>
                    </div>
                </div>
            ))}
            <button type="submit">SUBMIT</button>
        </form>
    )
}

export default SellSwapForm
