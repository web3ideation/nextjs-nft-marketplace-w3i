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

    // Zustand für Checkboxen
    const [checkboxData, setCheckboxData] = useState({
        Music: false,
        DAO: false,
        Utility: false,
        Gaming: false,
        Wearables: false,
        Staking: false,
        Membership: false,

        // Fügen Sie weitere Kategorien hinzu
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
        <div className={styles.sellSwapFormWrapper}>
            <h2>{title}</h2>
            <div className={styles.sellSwapFormTitles}>
                <h3>The data of your NFT</h3>
                <h3>Choose your category</h3>
            </div>
            <form className={styles.sellSwapForm} onSubmit={handleSubmit} ref={formRef}>
                <div className={styles.inputFieldsWrapper}>
                    {/* Standard form fields for NFT Address, Token ID, and Price */}
                    <div className={styles.formInputWrapper}>
                        {["nftAddress", "tokenId", "price"].map((fieldKey) => (
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
                                            const error = validateField(
                                                e.target.name,
                                                e.target.value
                                            )
                                            setErrors((prevErrors) => ({
                                                ...prevErrors,
                                                [e.target.name]: error,
                                            }))
                                        }}
                                        onFocus={() => {
                                            setErrors((prevErrors) => ({
                                                ...prevErrors,
                                                [fieldKey]: "",
                                            }))
                                        }}
                                    />
                                    {errors[fieldKey] && <Tooltip message={errors[fieldKey]} />}
                                </div>
                            </div>
                        ))}
                        {extraFields.map((field) => (
                            <div key={field.key} className={styles.formInput}>
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
                                            const error = validateField(
                                                e.target.name,
                                                e.target.value
                                            )
                                            setErrors((prevErrors) => ({
                                                ...prevErrors,
                                                [e.target.name]: error,
                                            }))
                                        }}
                                        onFocus={() => {
                                            setErrors((prevErrors) => ({
                                                ...prevErrors,
                                                [field.key]: "",
                                            }))
                                        }}
                                    />
                                    {console.log("ERROR", errors[field.key])}
                                    {errors[field.key] && <Tooltip message={errors[field.key]} />}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className={styles.checkboxFieldsWrapper}>
                        {" "}
                        {Object.keys(checkboxData).map((category) => (
                            <div key={category} className={styles.checkboxWrapper}>
                                <input
                                    type="checkbox"
                                    id={category}
                                    name={category}
                                    checked={checkboxData[category]}
                                    onChange={(e) =>
                                        setCheckboxData({
                                            ...checkboxData,
                                            [e.target.name]: e.target.checked,
                                        })
                                    }
                                />
                                <label htmlFor={category}>{category}</label>
                            </div>
                        ))}
                    </div>
                </div>{" "}
                <div className={styles.sellSwapFormTitles}>
                    <h3>Here are some things to keep in mind when listing your item:</h3>
                </div>
                <div className={styles.sellSwapInformationWrapper}>
                    <div className={styles.sellSwapInformation}>
                        <h4>Entering Price:</h4>
                        <p>
                            Enter the desired price in Ethereum (ETH). Please make sure to enter
                            the price accurately, as this directly affects the visibility and
                            attractiveness of your offer.
                        </p>
                        <br></br>
                        <h4>Fees and Costs:</h4>
                        <p>
                            Please note that when listing and selling in L1 currency (ETH), network
                            fees (so-called gas fees) may apply. These fees vary and depend on the
                            load on the Ethereum network.
                        </p>
                        <br></br>
                        <h4>NFT Address:</h4>
                        <p>
                            It's crucial to enter the correct NFT Address, which is the unique
                            contract address of your NFT on the blockchain. This ensures that the
                            right asset is being listed and can be identified accurately by buyers.
                        </p>
                        <br></br>
                        <h4>Token ID:</h4>
                        <p>
                            Each NFT has a distinct Token ID. Enter this Token ID carefully, as it
                            uniquely identifies your NFT within its collection or contract.
                            Incorrect entry of the Token ID could lead to listing a different asset
                            than intended.
                        </p>
                        <br></br>
                        <h4>Exchange NFT Address:</h4>
                        <p>
                            When initiating a trade, it's important to specify the correct Exchange
                            NFT Address, which is the unique contract address of the NFT you wish
                            to receive in the exchange. This ensures that the correct asset is
                            targeted in the trade and can be accurately identified by the other
                            party.
                        </p>
                        <br></br>
                        <h4>Exchange Token ID:</h4>
                        <p>
                            Each NFT you aim to receive in a trade has a distinct Token ID.
                            Carefully enter this Token ID, as it uniquely identifies the NFT within
                            its collection or contract. An incorrect Token ID could result in a
                            different asset being exchanged than the one you intended.
                        </p>
                        <br></br>
                        <h4>Approval for Marketplace:</h4>
                        <p>
                            Before listing your NFT, it must first be approved for the marketplace.
                            This approval process ensures that your NFT meets all necessary
                            criteria and standards for listing. Once approved, you can proceed with
                            listing your NFT on the platform.
                        </p>
                        <br></br>
                        <h4>Confirmation and Transaction:</h4>
                        <p>
                            After entering your price and obtaining marketplace approval, you must
                            confirm the transaction. This is usually done via your connected
                            wallet. Make sure you have enough ETH in your wallet to cover network
                            fees.
                        </p>
                        <br></br>
                        <h4>Visibility of your offer:</h4>
                        <p>
                            Once you have set the price, obtained approval, and confirmed the
                            transaction, your offer will be visible on the market with the new
                            price. This increases the chance that potential buyers will become
                            aware of your offer.
                        </p>
                        <br></br>
                        <h4>Security and Responsibility:</h4>
                        <p>
                            Please check all details carefully before confirming the listing.
                            Transactions on the blockchain are irreversible and cannot be reversed.
                            By keeping these points in mind, you will ensure that your offer
                            appears on the market correctly and at your desired price.
                        </p>
                    </div>
                </div>{" "}
                <button type="submit">APPROVE AND LIST</button>
            </form>
        </div>
    )
}

export default SellSwapForm
