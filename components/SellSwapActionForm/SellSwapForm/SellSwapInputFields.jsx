import React, { useEffect, useRef } from "react"
import Tooltip from "@components/Tooltip/Tooltip"
import styles from "./SellSwapInputFields.module.scss"

const InputFields = ({ fields, formData, setFormData, errors, handleChange }) => {
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

    return (
        <div className={styles.sellSwapInputWrapper}>
            <h3>The data of your NFT</h3>
            <div className={styles.sellSwapInputFieldsWrapper}>
                {fields.map(({ key, label, type, placeholder }, index) => (
                    <div key={key} className={styles.sellSwapInputField}>
                        <label htmlFor={key}>{label}</label>
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
