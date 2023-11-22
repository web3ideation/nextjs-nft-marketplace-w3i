import styles from "../styles/Home.module.css"
import React from "react"

export default function NFTTable({ tableRows }) {
    // ------------------ Hooks & Data Retrieval ------------------

    // ------------------ Render Functions ------------------

    return (
        <table className={styles.nftTable}>
            <thead>
                <tr>
                    <th></th>
                    <th>Address</th>
                    <th>Collection Name</th>
                    <th>Items</th>
                    <th>Sold</th>
                    <th>Total price</th>
                </tr>
            </thead>
            <tbody>{tableRows}</tbody>
        </table>
    )
}
