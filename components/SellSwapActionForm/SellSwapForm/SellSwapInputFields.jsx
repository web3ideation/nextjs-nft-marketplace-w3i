// InputFields.jsx
import React from "react"
import Tooltip from "@components/Tooltip/Tooltip"
import styles from "./SellSwapInputFields.module.scss"

const InputFields = ({ fields, formData, setFormData, errors, handleChange }) => {
    return (
        <div className={styles.sellSwapInputWrapper}>
            <h3>The data of your NFT</h3>
            <div className={styles.sellSwapInputFieldsWrapper}>
                {fields.map(({ key, label, type, placeholder }) => (
                    <div key={key} className={styles.sellSwapInputField}>
                        <label htmlFor={key}>{label}</label>
                        <input
                            type={type}
                            id={key}
                            name={key}
                            placeholder={placeholder}
                            value={formData[key]}
                            onChange={(e) => {
                                handleChange(e)
                                setFormData((prev) => ({
                                    ...prev,
                                    [key]: e.target.value,
                                }))
                            }}
                            aria-label={`Enter ${label}`}
                        />
                        {errors[key] && <Tooltip message={errors[key]} />}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default InputFields
