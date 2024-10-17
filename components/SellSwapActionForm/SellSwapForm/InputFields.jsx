import React, { useEffect, useRef } from "react"
import { Tooltip } from "@components"
import styles from "./InputFields.module.scss"

const InputFields = ({ fields, formData, setFormData, errors, setErrors, handleChange }) => {
    const numberInputRefs = useRef([])

    useEffect(() => {
        // Funktion zum Verhindern des Scrollens mit dem Mausrad
        const preventScroll = (event) => {
            event.preventDefault()
        }

        // Füge den Event Listener für jedes Nummern-Input hinzu
        numberInputRefs.current.forEach((input) => {
            if (input) {
                input.addEventListener("wheel", preventScroll)
            }
        })

        // Entferne den Event Listener bei Komponentende-Montage
        return () => {
            numberInputRefs.current.forEach((input) => {
                if (input) {
                    input.removeEventListener("wheel", preventScroll)
                }
            })
        }
    }, [])

    // Function to handle resetting the error when input loses focus
    const handleBlur = (key) => {
        setErrors((prevErrors) => ({
            ...prevErrors,
            [key]: "", // Reset the error for the field
        }))
    }

    return (
        <div className={styles.sellSwapInputWrapper}>
            <h3>The data of your NFT</h3>
            <div className={styles.sellSwapInputFieldsWrapper}>
                {fields.map(({ key, label, type, placeholder, onInput, onBlur }, index) => (
                    <div key={key} className={styles.sellSwapInputField}>
                        <div className={styles.labelAndTooltip}>
                            <label htmlFor={key}>{label}</label>
                            {errors[key] && <Tooltip message={errors[key]} />}
                        </div>
                        <input
                            ref={
                                type === "number"
                                    ? (el) => (numberInputRefs.current[index] = el)
                                    : null
                            }
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
                            onInput={onInput}
                            onBlur={() => handleBlur(key)}
                            aria-label={`Enter ${label}`}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default InputFields
