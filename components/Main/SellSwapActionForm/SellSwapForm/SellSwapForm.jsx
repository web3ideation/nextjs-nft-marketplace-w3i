// React Imports
import React, { useState, useRef } from "react"

// Custom Hooks
import useFormValidation from "@hooks/formValidation/useFormValidation"

// Component Imports
import Tooltip from "@components/UX/Tooltip/Tooltip"
import SellSwapInformation from "../SellSwapInformation/SellSwapInformation"
import BtnWithAction from "@components/UI/BtnWithAction"

// Style Imports
import styles from "./SellSwapForm.module.scss"

// SellSwapForm Component
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

    // Initialisiere den Hook mit den Standardwerten und dynamisch hinzugefügten Extrafeldern
    const { formData, errors, handleChange, validateForm } = useFormValidation({
        nftAddress: defaultNftAddress,
        tokenId: defaultTokenId,
        price: defaultPrice,
        ...extraFields.reduce((acc, field) => ({ ...acc, [field.key]: "" }), {}),
    })

    // Checkbox-Zustände werden separat verwaltet, da sie nicht direkt in die form-spezifische Validierung einfließen
    const [checkboxData, setCheckboxData] = useState({
        DAO: false,
        Music: false,
        Membership: false,
        "Real world assets": false,
        Gaming: false,
        Wearables: false,
        "Digital Twin": false,
        Utility: false,
        //"VR Estate": false,
        //Art: false,
        //Collectibles: false,
        //Entertainment: false,
        //Education: false,
        //"Health & Wellness": false,
        //Finance: false,
        //Technology: false,
        //Fashion: false,
        //Literature: false,
        //Travel: false,
        //"F&B": false,
        //"Social Media": false,
        //Environment: false,
        //Sports: false,
    })

    // Neue Zustandsvariable für Checkbox-Fehler
    const [checkboxError, setCheckboxError] = useState("")

    const handleChangeCheckbox = (e) => {
        const { name, checked } = e.target
        const selectedCount = Object.values(checkboxData).filter((val) => val).length

        if (!checked || selectedCount < 2) {
            setCheckboxData({
                ...checkboxData,
                [name]: checked,
            })

            setCheckboxError("")
        } else {
            setCheckboxError("You can choose up to 2 categories.")
        }
    }

    // Hinzufügen der Tooltip-Anzeige für Checkbox-Fehler
    const checkboxErrorDisplay = checkboxError ? <Tooltip message={checkboxError} /> : null

    const handleSubmit = (e) => {
        e.preventDefault()

        // Extrahiere die Kategorien, die als "true" markiert sind, aus checkboxData
        const selectedCategories = Object.entries(checkboxData)
            .filter(([category, isChecked]) => isChecked)
            .map(([category]) => category)

        const form = e.target
        const formData = new FormData(form)
        const formProps = Object.fromEntries(formData.entries())

        // Hinzufügen der Checkbox-Daten (jetzt als 'categories')
        const submissionData = {
            ...formProps,
            categories: selectedCategories, // Verwende den zusammengesetzten String der ausgewählten Kategorien
        }

        if (validateForm(submissionData)) {
            onSubmit(submissionData)
        }
    }

    return (
        <div className={styles.sellSwapFormWrapper}>
            <h2>{title}</h2>
            <form className={styles.sellSwapForm} onSubmit={handleSubmit} ref={formRef}>
                <div className={styles.sellSwapInputFieldsWrapper}>
                    {/* Standard form fields for NFT Address, Token ID, and Price */}
                    <div className={styles.sellSwapFormInputWrapper}>
                        <div className={styles.sellSwapFormTitles}>
                            <h3>The data of your NFT</h3>
                        </div>
                        {["nftAddress", "tokenId", "price"].map((fieldKey) => (
                            <div key={fieldKey} className={styles.sellSwapFormInput}>
                                <label htmlFor={fieldKey}>
                                    {fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1)}
                                </label>
                                <div className={styles.sellSwapInputWrapper}>
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
                                    />
                                    {errors[fieldKey] && <Tooltip message={errors[fieldKey]} />}
                                </div>
                            </div>
                        ))}
                        {extraFields.map((field) => (
                            <div key={field.key} className={styles.sellSwapFormInput}>
                                <label htmlFor={field.key}>{field.name}</label>
                                <div className={styles.sellSwapInputWrapper}>
                                    <input
                                        type={field.type}
                                        key={field.key}
                                        name={field.key}
                                        placeholder={field.placeholder}
                                        value={formData[field.key]}
                                        onChange={handleChange}
                                    />
                                    {console.log("ERROR", errors[field.key])}
                                    {errors[field.key] && <Tooltip message={errors[field.key]} />}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className={styles.checkboxFieldsWrapper}>
                        <div className={styles.sellSwapFormTitles}>
                            <h3>Choose up to 2 categories</h3>
                        </div>
                        {Object.keys(checkboxData).map((category) => (
                            <div key={category} className={styles.checkboxWrapper}>
                                <input
                                    type="checkbox"
                                    id={category}
                                    name={category}
                                    checked={checkboxData[category]}
                                    onChange={handleChangeCheckbox}
                                />
                                <label htmlFor={category}>{category}</label>
                            </div>
                        ))}
                        {checkboxErrorDisplay}
                    </div>
                </div>
                <div className={styles.sellSwapFormTitles}>
                    <h3>Here are some things to keep in mind when listing your item:</h3>
                </div>
                <SellSwapInformation />
                <BtnWithAction buttonText={"Approve and list"} type="submit" />
            </form>
        </div>
    )
}

export default SellSwapForm
