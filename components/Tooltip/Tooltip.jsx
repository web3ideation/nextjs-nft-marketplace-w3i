import styles from "./Tooltip.module.scss"

const Tooltip = ({ message }) => {
    return (
        <div className={styles.tooltipWrapper} id="tooltipWrapper">
            <div className={styles.tooltip}>
                <span className={styles.tooltipText}>{message}</span>
            </div>
        </div>
    )
}

export default Tooltip
