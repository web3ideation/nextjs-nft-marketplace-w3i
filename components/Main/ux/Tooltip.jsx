// Style import
import styles from "../../../styles/Home.module.css"

/**
 * Tooltip Component
 * This functional component renders a tooltip with a given message.
 * Props:
 * - message: The text to be displayed inside the tooltip.
 */
function Tooltip({ message }) {
    // Log when Tooltip is rendered
    console.log("Rendering Tooltip with message:", message)
    return (
        <div className={styles.tooltip}>
            <span className={styles.tooltipText}>{message}</span>
        </div>
    )
}

export default Tooltip
