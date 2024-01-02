import styles from "../../styles/Home.module.css"

function Tooltip({ message }) {
    return (
        <div className={styles.tooltip}>
            <span className={styles.tooltipText}>{message}</span>
        </div>
    )
}

export default Tooltip
