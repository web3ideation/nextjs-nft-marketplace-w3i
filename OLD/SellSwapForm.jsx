import React, { useState, useRef } from "react"
import useFormValidation from "@hooks/formValidation/useFormValidation"
import SellSwapInformation from "../components/SellSwapActionForm/SellSwapInformation/SellSwapInformation"
import BtnWithAction from "@components/Btn/BtnWithAction"

import styles from "./SellSwapForm.module.scss"
import CategoriesCheckbox from "./CategoriesCheckbox"
import SellSwapInputFields from "../components/SellSwapActionForm/SellSwapForm/SellSwapInputFields"

const SellSwapForm = ({
    title,
    onSubmit,
    defaultNftAddress = "",
    defaultTokenId = "",
    defaultPrice = "",
    extraFields = [],
    formData,
    setFormData,
}) => {
    const formRef = useRef(null)

    const { errors, handleChange, validateForm } = useFormValidation({
        nftAddress: defaultNftAddress,
        tokenId: defaultTokenId,
        price: defaultPrice,
        ...extraFields.reduce((acc, field) => ({ ...acc, [field.key]: "" }), {}),
    })
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
            label: "Price",
            type: "number",
            placeholder: "min. amount: 0.000000000000000001",
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
        Utility: false,
    })

    const handleSubmit = (e) => {
        e.preventDefault()

        const selectedCategories = Object.entries(checkboxData)
            .filter(([category, isChecked]) => isChecked)
            .map(([category]) => category)

        const form = e.target
        const formData = new FormData(form)
        const formProps = Object.fromEntries(formData.entries())

        const submissionData = { ...formProps, categories: selectedCategories }

        if (validateForm(submissionData)) {
            // Ensure all fields are defined and correctly formatted
            submissionData.tokenId = submissionData.tokenId || "0"
            submissionData.desiredTokenId = submissionData.desiredTokenId || "0"
            submissionData.price = submissionData.price || "0"
            onSubmit(submissionData)
        }
    }

    return (
        <div className={styles.sellSwapFormWrapper}>
            <h2>{title}</h2>
            <form className={styles.sellSwapForm} onSubmit={handleSubmit} ref={formRef}>
                <div className={styles.sellSwapInputFieldsWrapper}>
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
                </div>
                <SellSwapInformation />
                <BtnWithAction buttonText={"Approve and list"} type="submit" />
            </form>
        </div>
    )
}

export default SellSwapForm
