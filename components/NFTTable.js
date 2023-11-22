import styles from "../styles/Home.module.css"
import React from "react"

export default function NFTTable({ tableRows }) {
    // NFTTable component renders a table with NFT collection data
    // Props:
    //   tableRows: Array of table row elements to be rendered in the table body defined in NFTCollection

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
