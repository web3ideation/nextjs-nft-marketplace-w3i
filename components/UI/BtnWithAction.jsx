import React from "react"
import styles from "./BtnWithAction.module.scss"

const BtnWithAction = ({ buttonText, onClickAction, type = "button", style }) => {
    return (
        <button className={styles.button} type={type} onClick={onClickAction} style={style}>
            {buttonText}
        </button>
    )
}

export default BtnWithAction
