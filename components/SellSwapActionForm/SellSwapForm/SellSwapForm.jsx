import React, { useState, useRef } from "react"
import useFormValidation from "@hooks/formValidation/useFormValidation"
import Tooltip from "@components/Tooltip/Tooltip"
import SellSwapInformation from "../SellSwapInformation/SellSwapInformation"
import BtnWithAction from "@components/Btn/BtnWithAction"
import ComingSoon from "@components/ComingSoon/ComingSoon"

import styles from "./SellSwapForm.module.scss"

const SellSwapForm = ({
    title,
    onSubmit,
    defaultNftAddress = "",
    defaultTokenId = "",
    defaultPrice = "",
    extraFields = [],
}) => {
    const formRef = useRef(null)

    const { formData, errors, handleChange, validateForm } = useFormValidation({
        nftAddress: defaultNftAddress,
        tokenId: defaultTokenId,
        price: defaultPrice,
        ...extraFields.reduce((acc, field) => ({ ...acc, [field.key]: "" }), {}),
    })

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

    const [checkboxError, setCheckboxError] = useState("")

    const handleChangeCheckbox = (e) => {
        const { name, checked } = e.target
        const selectedCount = Object.values(checkboxData).filter((val) => val).length

        if (!checked || selectedCount < 2) {
            setCheckboxData({ ...checkboxData, [name]: checked })
            setCheckboxError("")
        } else {
            setCheckboxError("You can choose up to 2 categories.")
        }
    }

    const checkboxErrorDisplay = checkboxError ? <Tooltip message={checkboxError} /> : null

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
                                    {errors[field.key] && <Tooltip message={errors[field.key]} />}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.checkboxFieldsWrapper}>
                        <ComingSoon></ComingSoon>
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
