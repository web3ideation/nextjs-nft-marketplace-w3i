// React Imports
import React from "react";

// Style Imports
import styles from "../../../styles/Home.module.css";

/**
 * NFTTable Component
 * - This component renders a table displaying NFT collection data.
 * - It takes a single prop 'tableRows', which is an array of table row elements.
 *
 * Props:
 *   tableRows: Array of React elements representing each row in the table.
 *              Expected to be passed from a parent component, typically representing NFT collections.
 */

export default function NFTTable({ tableRows }) {
    return (
        <table className={styles.nftTable}>
            <thead>
                <tr>
                    <th></th>
                    <th>Address</th>
                    <th>Collection</th>
                    <th>Items</th>
                    <th>Sold</th>
                    <th>Total price</th>
                </tr>
            </thead>
            <tbody>{tableRows}</tbody>
        </table>
    );
}

