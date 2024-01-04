// React imports (React core and hooks
import React, { useState, useRef } from "react";

// Importing styles specific to the SellSwapForm component
import styles from "../../../styles/Home.module.css";

// Tooltip component for displaying form field errors
import Tooltip from "../ux/Tooltip";

// ------------------ SellSwapForm Component ------------------
// This component renders a form for selling or swapping NFTs, including fields for NFT address, token ID, price, and additional user-defined fields.
function SellSwapForm({
    title,
    key,
    onSubmit,
    defaultNftAddress,
    defaultTokenId,
    defaultPrice,
    extraFields = [],
}) {
    const formRef = useRef(null);
    const [focusedField, setFocusedField] = useState(null);

    // ------------------ State Initialization ------------------
    // Initializing form data with default values and dynamic extra fields
    const [formData, setFormData] = useState({
        nftAddress: defaultNftAddress,
        tokenId: defaultTokenId,
        price: defaultPrice,
        ...extraFields.reduce((acc, field) => {
            acc[field.key] = "";
            return acc;
        }, {}),
    });

    // Initializing form error state for each field
    const [errors, setErrors] = useState({
        nftAddress: "",
        tokenId: "",
        price: "",
    });

    // ------------------ Validation Logic ------------------
    // Function to validate individual form fields based on field name and value
    function validateField(name, value) {
        let errorMessage = "";

        // Custom validation logic based on field type
        switch (name) {
            // Validation for Ethereum address fields
            case "nftAddress":
            case "desiredNftAddress":
                if (!/^0x[0-9a-fA-F]{40}$/.test(value)) {
                    errorMessage = "Please enter a valid Ethereum address in the format 0x1234...";
                }
                break;

            // Validation for token ID fields
            case "tokenId":
            case "desiredTokenId":
                if (!/^[0-9]\d*$/.test(value)) {
                    errorMessage = "Please enter a positive integer or zero.";
                }
                break;

            // Validation for price fields
            case "price":
                if (!/^\d{1,18}(\.\d{1,18})?$/.test(value)) {
                    errorMessage = "Please enter a positive amount in ETH.";
                }
                break;
            default:
                break;
        }

        // Updating error state for the specific field
        setErrors((prevErrors) => ({ ...prevErrors, [name]: errorMessage }));

        return errorMessage === "";
    }

    // Function to validate the entire form
    function validateForm(data) {
        let isValid = true;

        // Iterating over each form field to validate
        Object.keys(data).forEach((key) => {
            if (!validateField(key, data[key])) {
                isValid = false;
            }
        });

        return isValid;
    }

    // ------------------ Event Handlers ------------------
    // Handler for form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        // Special handling for price field to restrict decimal places
        if (name === "price") {
            const parts = value.split(".");
            if (parts.length > 1 && parts[1].length > 18) {
                return;
            }
        }

        // Updating form data state
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Handler for form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm(formData)) {
            onSubmit(formData);
        }
    };

    return (
        <form className={styles.sellSwapForm} onSubmit={handleSubmit} key={key} ref={formRef}>
            <h2>{title}</h2>
            {/* Standard form fields for NFT Address, Token ID, and Price */}
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
            <button type="submit">SUBMIT</button>
        </form>
    )
}

export default SellSwapForm
