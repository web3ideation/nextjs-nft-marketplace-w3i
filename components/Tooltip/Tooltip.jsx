import styles from "./Tooltip.module.scss"

const Tooltip = ({ message }) => {
    return (
        <div className={styles.tooltip}>
            <span className={styles.tooltipText}>{message}</span>
        </div>
    )
}

export default Tooltip
