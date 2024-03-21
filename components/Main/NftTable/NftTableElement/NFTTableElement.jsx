import React from "react"
import Image from "next/image"

import LoadingWave from "@components/Main/ux/LoadingWave"
import { useModal } from "@context/ModalProvider"

// Utility functions for formatting
import { truncateStr, formatPriceToEther, truncatePrice } from "@utils/formatting"

import styles from "./NFTTableElement.module.scss"

// NFTTableElement: A React component to render a table row for a specific NFT collection
export default function NFTTableElement({ collection }) {
    // Destructuring properties from the 'collection' object
    const {
        nftAddress,
        firstImageURI: imageURI,
        firstTokenDescription: tokenDescription,
        collectionCount,
        collectionSymbol,
        count: itemCount,
        collectionPrice,
    } = collection

    const { openModal } = useModal()

    // Formatting NFT address and price for display
    const formattedNftAddress = truncateStr(nftAddress || "", 4, 4) // Truncating NFT address for brevity
    const priceInEther = formatPriceToEther(collectionPrice) // Converting price to Ether
    const formattedPrice = truncatePrice(priceInEther, 4) // Formatting and truncating price
    const handleCollectionClick = (collection) => {
        const modalId = "topCollectionModal-" + collection.nftAddress
        openModal("collection", modalId, collection)
    }
    return (
        <>
            {imageURI ? (
                // Render table row for NFT collection with image
                <tr
                    className={styles.nftTableRow}
                    key={`${collection.nftAddress}${collection.collectionCount}`}
                    onClick={() => handleCollectionClick(collection)}
                >
                    <td>
                        <div className={styles.contentWrapper}>
                            <Image
                                className={styles.tableImage}
                                src={imageURI.src}
                                height={50}
                                width={50}
                                alt={tokenDescription || "..."}
                            />
                        </div>
                    </td>
                    <td className={styles.nonNecessaryTableItems}>
                        <div className={styles.contentWrapper}>{formattedNftAddress}</div>
                    </td>
                    <td>
                        <div className={styles.contentWrapper}>{collectionSymbol}</div>
                    </td>
                    <td className={styles.nonNecessaryTableItems}>
                        <div className={styles.contentWrapper}>{itemCount}</div>
                    </td>
                    <td>
                        <div className={styles.contentWrapper}>{collectionCount}</div>
                    </td>
                    <td>
                        <div className={styles.contentWrapper}>{formattedPrice} ETH</div>
                    </td>
                </tr>
            ) : (
                // Render loading state if no image URI is available
                <div className={styles.nftLoadingIconWrapper}>
                    <div className={styles.nftLoadingIcon}>
                        <LoadingWave />
                    </div>
                </div>
            )}
        </>
    )
}
