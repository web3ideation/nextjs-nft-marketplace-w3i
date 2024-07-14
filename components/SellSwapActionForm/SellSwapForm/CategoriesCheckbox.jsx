import React, { useState, useEffect } from "react"
import Tooltip from "@components/Tooltip/Tooltip"
import ComingSoon from "@components/ComingSoon/ComingSoon"

import styles from "./CategoriesCheckbox.module.scss"

const CategoriesCheckbox = ({ checkboxData, setCheckboxData }) => {
    const [checkboxError, setCheckboxError] = useState("")
    const [errorCategory, setErrorCategory] = useState("")

    const handleChangeCheckbox = (e) => {
        const { name, checked } = e.target
        const selectedCount = Object.values(checkboxData).filter((val) => val).length

        if (!checked || selectedCount < 2) {
            setCheckboxData((prevData) => ({ ...prevData, [name]: checked }))
            setCheckboxError("")
            setErrorCategory("")
        } else {
            setCheckboxError("You can choose up to 2 categories.")
            setErrorCategory(name)
        }
    }

    return (
        <div className={styles.checkboxWrapper}>
            <h3>Choose 2 categories</h3>
            <div className={styles.checkboxFieldsWrapper}>
                {Object.keys(checkboxData).map((category) => (
                    <div key={category} className={styles.checkboxField}>
                        <input
                            type="checkbox"
                            id={category}
                            name={category}
                            checked={checkboxData[category]}
                            onChange={handleChangeCheckbox}
                            disabled="disabled" // entfernen wenn datenbank verbunden
                            aria-label={`Category ${category}`}
                        />
                        <label htmlFor={category}>{category}</label>
                        {checkboxError && errorCategory === category && (
                            <Tooltip message={checkboxError} />
                        )}
                    </div>
                ))}
                <ComingSoon size="large" />
            </div>
        </div>
    )
}

export default CategoriesCheckbox
