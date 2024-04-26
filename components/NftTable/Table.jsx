import React, { useEffect, useRef } from "react"
import styles from "./Table.module.scss"

const Table = ({ tableRows }) => {
    const listRef = useRef(null)

    const onWheel = (e) => {
        if (!listRef.current) return
        listRef.current.scrollTop += e.deltaY
        e.preventDefault()
    }

    useEffect(() => {
        const listElement = listRef.current
        if (listElement) {
            listElement.addEventListener("wheel", onWheel)
        }

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
export default Table
