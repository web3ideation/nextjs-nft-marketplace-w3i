import styles from "../styles/Home.module.css"
import { useState, useEffect } from "react"
import { useMoralis } from "react-moralis"
import networkMapping from "../constants/networkMapping.json"
import NFTTableElement from "../components/NFTTableElement"

export default function NFTTable({ nftCollections, loadingImage }) {
    // ------------------ Hooks & Data Retrieval ------------------

    // Retrieve blockchain and user data using Moralis hook
    const { chainId, isWeb3Enabled } = useMoralis()

    // Convert chain ID to string format
    const chainString = chainId ? parseInt(chainId).toString() : "31337"

    // Get the marketplace address based on the current chain
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]

    // ------------------ State Management ------------------

    // Web3 and User related states
    const [isConnected, setIsConnected] = useState(isWeb3Enabled)

    // Update connection state
    useEffect(() => {
        setIsConnected(isWeb3Enabled)
    }, [isWeb3Enabled])

    // ------------------ Render Functions ------------------

    return (
        <table className={styles.nftTable}>
            <thead>
                <tr className={styles.nftTableRow}>
                    <th></th>
                    <th>Address</th>
                    <th>Collection Name</th>
                    <th>Items</th>
                </tr>
            </thead>
            <tbody>
                {nftCollections.map((collection) => (
                    <NFTTableElement
                        key={collection.nftAddress}
                        collection={collection}
                        loadingImage={loadingImage}
                    />
                ))}
            </tbody>
        </table>
    )
}
