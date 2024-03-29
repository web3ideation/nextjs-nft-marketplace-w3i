// React Imports
import React from "react"

// Style Imports
import styles from "./Table.module.scss"

/**
 * Table Component
 * - This component renders a table displaying NFT collection data.
 * - It takes a single prop 'tableRows', which is an array of table row elements.
 *
 * Props:
 *   tableRows: Array of React elements representing each row in the table.
 *              Expected to be passed from a parent component, typically representing NFT collections.
 */

export default function Table({ tableRows }) {
    return (
        <table className={styles.table}>
            <thead>
                <tr>
                    <th></th>
                    <th className={styles.nonNecessaryTableItems}>Address</th>
                    <th>Collection</th>
                    <th>Items</th>
                    <th className={styles.nonNecessaryTableItems}>Sold</th>
                    <th>Total price</th>
                </tr>
            </thead>
            <tbody>{tableRows}</tbody>
        </table>
    )
}
