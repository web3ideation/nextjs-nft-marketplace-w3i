import { useMoralis } from "react-moralis"
import React, { useState, useCallback } from "react"
import NFTListed from "../components/NFTListed"
import SearchSideFilters from "../components/SearchSideFilters"
import styles from "../styles/Home.module.css"

export default function Home() {
    const { isWeb3Enabled, chainId } = useMoralis()

    const [items, setItems] = useState([])
    const [filteredItems, setFilteredItems] = useState([])

    const handleFilteredItemsChange = useCallback((newFilteredItems) => {
        setFilteredItems(newFilteredItems)
    }, [])

    return (
        <div className={styles.nftListingContainer}>
            <SearchSideFilters
                initialItems={items}
                onFilteredItemsChange={handleFilteredItemsChange}
            />
            <NFTListed
                isWeb3Enabled={isWeb3Enabled}
                chainId={chainId}
                items={items}
                setItems={setItems}
                filteredItems={filteredItems}
                setFilteredItems={setFilteredItems}
            />
        </div>
    )
}
