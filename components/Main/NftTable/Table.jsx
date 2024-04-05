// React Imports
import React, { useEffect, useRef } from "react"

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
    const listRef = useRef(null)

    // Funktion zum horizontalen Scrollen
    const onWheel = (e) => {
        if (!listRef.current) return

        // Horizontales Scrollen ermöglichen
        listRef.current.scrollTop += e.deltaY

        // Verhindern, dass das Scroll-Event weitergeleitet wird und andere Scroll-Operationen ausführt
        e.preventDefault()
    }
    // Effect Hook, um den Event Listener hinzuzufügen
    useEffect(() => {
        const listElement = listRef.current
        if (listElement) {
            listElement.addEventListener("wheel", onWheel)
        }

        // Cleanup-Funktion
        return () => {
            if (listElement) {
                listElement.removeEventListener("wheel", onWheel)
            }
        }
    }, [])
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
            <tbody ref={listRef}>{tableRows}</tbody>
        </table>
    )
}
