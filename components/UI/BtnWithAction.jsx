// React import
import React from "react"

// Styles import
import styles from "./BtnWithAction.module.scss"

/**
 * BtnWithAction - A React component for a button.
 *
 * @param {object} props - The props for the BtnWithAction component.
 * @param {string} props.buttonText - The text to be displayed on the button.
 * @param {function} props.onClickAction - The function to execute when the button is clicked.
 * @param {string} [props.type="button"] - The button type (e.g., "submit", "reset", defaults to "button").
 * @param {object} [props.style] - Additional inline styles that can be applied to the button.
 * @returns {React.Element} - The rendered button component.
 */
const BtnWithAction = ({ buttonText, onClickAction, type = "button", style }) => {
    return (
        <button
            className={styles.button}
            type={type} // The type of the button, defaults to "button"
            onClick={onClickAction} // The function to execute on button click
            style={style} // Additional inline styles, if any
        >
            {buttonText}
        </button>
    )
}

export default BtnWithAction
