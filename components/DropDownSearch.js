import React, { useState, useRef } from "react"
import styles from "../styles/Home.module.css"
import { Button } from "web3uikit"

const DropDownSearch = ({ buttonText, options, onChange }) => {
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef(null)

    const handleMouseEnter = () => {
        setIsOpen(true)
    }

    const handleMouseLeave = () => {
        setIsOpen(false)
    }

    return (
        <div
            className={styles.DropDownSearch}
            ref={menuRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Button text={buttonText} />
            {isOpen && (
                <div className={styles.dropDownSearchItemsWrapper}>
                    {options.map((option) => (
                        <Button
                            key={option.id}
                            text={option.label}
                            onClick={onChange}
                            style={{ fontWeight: 400 }}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default DropDownSearch
